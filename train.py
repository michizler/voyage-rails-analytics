"""Trains the VoyageRail fare model and its linear baseline, and writes them to models/ with a model card.

Feature audit first: the model uses only what a booking desk knows when it quotes. Five columns in the
source data give the fare away or are known only after the fact, so they are excluded:
  Base_Price_At_Booking plus Price_Premium equals the ticket price (exact in every row where both are present), and
  Seats_Sold_Realized, Remaining_Seats_Realized and Load_Factor are final per-departure tallies (seats sold
  equals that departure's booking count in every departure).

Usage (from the repo root):
    python train.py                      # full run with the model comparison, about 8 minutes
    python train.py --skip-comparison    # gradient boosting and baseline only, about a minute
Every run is logged to MLflow (sqlite:///mlflow.db). View it with: mlflow ui --backend-store-uri sqlite:///mlflow.db
"""
from __future__ import annotations

import argparse
import hashlib
import json
import platform
import time
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler

SEED = 42
SOURCE_REPO = "https://github.com/michizler/voyage-rails-analytics"
SOURCE_COMMIT = "5c52136d3db34c5ff7f855f72f4a49b1dc30bc04"
TARGET = "Ticket_Price_GBP"

NUMERIC = ["Distance_km", "Booking_Frequency_Qtr", "Average_Spend_GBP", "Total_Seats", "Demand_Index",
           "Days_Before_Travel"]
CATEGORICAL = ["Seat_Class", "Booking_Channel", "Origin", "Destination", "Route_Category", "Customer_Segment",
               "Loyalty_Status"]
FEATURES = NUMERIC + CATEGORICAL
EXCLUDED = {
    "Price_Premium": "It is the ticket price minus the base fare, which puts the answer inside a feature.",
    "Base_Price_At_Booking": "It is the ticket price minus the premium, so it also comes from the target.",
    "Seats_Sold_Realized": "It is the final number of seats sold for the departure, which is not known when a fare is quoted.",
    "Remaining_Seats_Realized": "It is total seats minus final seats sold, which is not known when a fare is quoted.",
    "Load_Factor": "It is final seats sold over total seats, which is not known when a fare is quoted.",
}
WITH_EXCLUDED_NUMERIC = ["Distance_km", "Booking_Frequency_Qtr", "Average_Spend_GBP", "Total_Seats", "Seats_Sold_Realized",
                    "Remaining_Seats_Realized", "Demand_Index", "Days_Before_Travel", "Price_Premium", "Load_Factor"]

GBM_PARAMS = dict(max_iter=400, learning_rate=0.08, random_state=SEED)

DATA_NOTES = [
    "The data is synthetic. In it, fares rise with booking lead time for about three weeks and then level off "
    "(mean £48.70 same day, about £77 from 15 days out). That is the opposite of real UK advance fares. The model "
    "reproduces the data and is not pricing advice.",
    "Bookings are front-loaded. A third are same-day and only 655 of 519,713 are more than 60 days out, so the "
    "curve beyond 60 days rests on thin data.",
    "Demand_Index is one score per departure in the source data. The demo treats it as the operator's demand "
    "forecast, available when quoting.",
]


def load(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["Loyalty_Status"] = df["Loyalty_Status"].fillna("None")   # as the notebook did: no tier recorded
    # Only for the excluded-columns check: fill the two price columns so they can be scored
    df["Base_Price_At_Booking"] = df["Base_Price_At_Booking"].fillna(df[TARGET])
    df["Price_Premium"] = df["Price_Premium"].fillna(df[TARGET] - df["Base_Price_At_Booking"])
    return df


def gbm() -> Pipeline:
    pre = ColumnTransformer([("num", "passthrough", NUMERIC),
                             ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), CATEGORICAL)],
                            verbose_feature_names_out=False)
    return Pipeline([("pre", pre), ("reg", HistGradientBoostingRegressor(**GBM_PARAMS))])


def linear(numeric: list[str] = NUMERIC) -> Pipeline:
    pre = ColumnTransformer([("num", StandardScaler(), numeric),
                             ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL)])
    return Pipeline([("pre", pre), ("reg", LinearRegression())])


def forest(numeric: list[str], n: int) -> Pipeline:
    pre = ColumnTransformer([("num", "passthrough", numeric), ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL)])
    return Pipeline([("pre", pre), ("reg", RandomForestRegressor(n_estimators=n, max_depth=16, min_samples_leaf=20,
                                                                  max_features=0.5, random_state=SEED, n_jobs=-1))])


def scores(y: pd.Series, p: np.ndarray) -> dict:
    return {"r2": round(float(r2_score(y, p)), 4), "mae_gbp": round(float(mean_absolute_error(y, p)), 3),
            "rmse_gbp": round(float(np.sqrt(mean_squared_error(y, p))), 3),
            "mape_pct": round(float(np.mean(np.abs(y - p) / y) * 100), 2)}


def holdout(make, X_tr, y_tr, X_te, y_te) -> tuple[Pipeline, dict, float]:
    t = time.time()
    model = make().fit(X_tr, y_tr)
    return model, scores(y_te, model.predict(X_te)), round(time.time() - t, 1)


def cross_validate(make, X: pd.DataFrame, y: pd.Series) -> dict:
    folds = []
    for tr, va in KFold(n_splits=5, shuffle=True, random_state=SEED).split(X):
        m = make().fit(X.iloc[tr], y.iloc[tr])
        folds.append(scores(y.iloc[va], m.predict(X.iloc[va])))
    return {k: {"mean": round(float(np.mean([f[k] for f in folds])), 4),
                "std": round(float(np.std([f[k] for f in folds])), 4)} for k in folds[0]}


def reference(train: pd.DataFrame) -> dict:
    """Lookups the API needs: valid routes and what they imply, defaults, ranges and fare bands."""
    routes = (train.groupby(["Origin", "Destination"])
              .agg(distance_km=("Distance_km", "first"), route_category=("Route_Category", "first"),
                   total_seats=("Total_Seats", "median"), bookings=("Booking_ID", "size")).reset_index())
    seg = train.groupby("Customer_Segment")[["Booking_Frequency_Qtr", "Average_Spend_GBP"]].median()
    bands = train.groupby("Seat_Class")[TARGET].quantile([1 / 3, 2 / 3]).unstack()
    return {
        "routes": [{"origin": r.Origin, "destination": r.Destination, "distance_km": int(r.distance_km),
                    "route_category": r.route_category, "total_seats": int(round(r.total_seats)), "bookings": int(r.bookings)}
                   for r in routes.itertuples(index=False)],
        "categories": {c: sorted(train[c].unique().tolist()) for c in
                       ["Seat_Class", "Booking_Channel", "Customer_Segment", "Loyalty_Status"]},
        "segment_defaults": {s: {"booking_frequency_qtr": float(r.Booking_Frequency_Qtr),
                                 "average_spend_gbp": round(float(r.Average_Spend_GBP), 2)} for s, r in seg.iterrows()},
        "ranges": {"days_before_travel": [int(train.Days_Before_Travel.min()), int(train.Days_Before_Travel.max())],
                   "demand_index": [round(float(train.Demand_Index.min()), 3), round(float(train.Demand_Index.max()), 3)],
                   "demand_index_median": round(float(train.Demand_Index.median()), 3)},
        "fare_bands_gbp": {c: {"low_below": round(float(r[1 / 3]), 2), "high_above": round(float(r[2 / 3]), 2)}
                           for c, r in bands.iterrows()},
    }


def log_to_mlflow(card: dict, model: Pipeline, base: Pipeline) -> None:
    """Records the run in MLflow so every training run stays comparable."""
    import mlflow
    import mlflow.sklearn

    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    mlflow.set_experiment("voyagerail-fare-model")
    with mlflow.start_run(run_name="gradient-boosting-quote-time"):
        mlflow.log_params({f"gbm_{k}": v for k, v in GBM_PARAMS.items()})
        mlflow.log_param("features", ",".join(FEATURES))
        mlflow.log_param("excluded", ",".join(EXCLUDED))
        for block in ("model", "baseline"):
            for k, v in card[block]["holdout"].items():
                mlflow.log_metric(f"{block}_holdout_{k}", v)
            for k, v in card[block]["cv"].items():
                mlflow.log_metric(f"{block}_cv_{k}_mean", v["mean"])
        mlflow.sklearn.log_model(model, name="fare_model")
        mlflow.sklearn.log_model(base, name="linear_baseline")
    print("logged run to MLflow", flush=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", type=Path, default=Path(__file__).resolve().parent / "source-data" / "travel_data.csv")
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent / "models")
    ap.add_argument("--skip-comparison", action="store_true")
    args = ap.parse_args()

    df = load(args.data)
    train, test = train_test_split(df, test_size=0.2, random_state=SEED)
    y_tr, y_te = train[TARGET], test[TARGET]
    print(f"rows {len(df):,}  train {len(train):,}  holdout {len(test):,}", flush=True)

    model, gbm_hold, gbm_secs = holdout(gbm, train[FEATURES], y_tr, test[FEATURES], y_te)
    base, lin_hold, lin_secs = holdout(linear, train[FEATURES], y_tr, test[FEATURES], y_te)
    print(f"gbm holdout {gbm_hold}  linear holdout {lin_hold}", flush=True)
    gbm_cv = cross_validate(gbm, train[FEATURES], y_tr)
    lin_cv = cross_validate(linear, train[FEATURES], y_tr)
    print(f"gbm cv r2 {gbm_cv['r2']}  linear cv r2 {lin_cv['r2']}", flush=True)

    comparison, leakage = None, None
    if not args.skip_comparison:
        _, rf_hold, rf_secs = holdout(lambda: forest(NUMERIC, 60), train[FEATURES], y_tr, test[FEATURES], y_te)
        comparison = {"random_forest_60x_depth16": {**rf_hold, "fit_seconds": rf_secs}}
        print(f"rf holdout {rf_hold}", flush=True)
        nb = WITH_EXCLUDED_NUMERIC + CATEGORICAL
        _, lk_lin, _ = holdout(lambda: linear(WITH_EXCLUDED_NUMERIC), train[nb], y_tr, test[nb], y_te)
        _, lk_rf, _ = holdout(lambda: forest(WITH_EXCLUDED_NUMERIC, 20), train[nb], y_tr, test[nb], y_te)
        leakage = {"note": "Same split with the four excluded columns added back. These scores are what a leaky model "
                           "would appear to achieve, and are why the columns are excluded.",
                   "linear": lk_lin, "random_forest_20x_depth16": lk_rf}
        print(f"leaky linear {lk_lin}  leaky rf {lk_rf}", flush=True)

    args.out.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, args.out / "model.joblib", compress=3)
    joblib.dump(base, args.out / "baseline.joblib", compress=3)
    (args.out / "reference.json").write_text(json.dumps(reference(train), indent=1), encoding="utf-8")
    card = {
        "trained_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "data": {"file": args.data.name, "sha256": hashlib.sha256(args.data.read_bytes()).hexdigest(),
                 "rows": len(df), "source_repo": SOURCE_REPO, "source_commit": SOURCE_COMMIT,
                 "travel_dates": "2025-01-01 to 2025-03-31", "synthetic": True},
        "split": {"holdout_fraction": 0.2, "seed": SEED, "cv": "5-fold KFold on the training split, shuffled, seed 42"},
        "target": f"{TARGET} (fare in GBP)",
        "features": FEATURES,
        "excluded_features": EXCLUDED,
        "data_notes": DATA_NOTES,
        "model": {"name": "Gradient boosting (HistGradientBoostingRegressor)", "params": GBM_PARAMS,
                  "holdout": gbm_hold, "cv": gbm_cv, "fit_seconds": gbm_secs},
        "baseline": {"name": "Linear regression (one-hot categoricals, scaled numerics)",
                     "holdout": lin_hold, "cv": lin_cv, "fit_seconds": lin_secs},
        "model_selection": comparison,
        "excluded_columns_check": leakage,
        "versions": {"python": platform.python_version(), "scikit-learn": sklearn.__version__,
                     "numpy": np.__version__, "pandas": pd.__version__},
    }
    (args.out / "model_card.json").write_text(json.dumps(card, indent=1), encoding="utf-8")
    log_to_mlflow(card, model, base)
    print(f"wrote {args.out}", flush=True)


if __name__ == "__main__":
    main()
