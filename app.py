"""FastAPI service for the VoyageRail fare model: quotes from what a booking desk knows, with SHAP drivers.

Run locally:  uvicorn app:app --port 8000
The model files in models/ are produced by train.py.
"""
from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal, Optional

import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

MODELS = Path(os.getenv("MODELS_DIR", Path(__file__).resolve().parent / "models"))
state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    state["model"] = joblib.load(MODELS / "model.joblib")
    state["baseline"] = joblib.load(MODELS / "baseline.joblib")
    state["ref"] = json.loads((MODELS / "reference.json").read_text(encoding="utf-8"))
    state["card"] = json.loads((MODELS / "model_card.json").read_text(encoding="utf-8"))
    state["routes"] = {(r["origin"], r["destination"]): r for r in state["ref"]["routes"]}
    state["explainer"] = shap.TreeExplainer(state["model"].named_steps["reg"])
    yield
    state.clear()


app = FastAPI(title="VoyageRail Fare API", version="2.0.0", lifespan=lifespan,
              description="Quotes rail fares from quote-time information and explains each quote with SHAP.")


class Quote(BaseModel):
    """What a booking desk knows when it quotes. Distance, route category and seats come from the route."""
    model_config = ConfigDict(extra="forbid", json_schema_extra={"example": {
        "origin": "Manchester", "destination": "London", "seat_class": "Standard", "booking_channel": "Web",
        "customer_segment": "Business", "loyalty_status": "Silver", "days_before_travel": 7, "demand_index": 1.1}})

    origin: str
    destination: str
    seat_class: Literal["Standard", "Flex", "First"]
    booking_channel: Literal["Mobile", "Web", "Agent", "Partner"]
    customer_segment: Literal["Leisure", "Business", "Commuter", "Student"]
    loyalty_status: Literal["None", "Silver", "Gold", "Platinum"]
    days_before_travel: int = Field(..., ge=0, le=89)
    demand_index: float = Field(..., gt=0, description="Operator's demand forecast, within the range given by /options")
    booking_frequency_qtr: Optional[float] = Field(None, ge=0, le=100)
    average_spend_gbp: Optional[float] = Field(None, ge=0, le=10_000)


def _features(q: dict) -> dict:
    route = state["routes"].get((q["origin"], q["destination"]))
    if route is None:
        raise HTTPException(422, f"No {q['origin']} to {q['destination']} service in the data. See /options.")
    lo, hi = state["ref"]["ranges"]["demand_index"]
    if not lo <= q["demand_index"] <= hi:
        raise HTTPException(422, f"demand_index must be between {lo} and {hi}, the range the model was trained on.")
    seg = state["ref"]["segment_defaults"][q["customer_segment"]]
    return {
        "Distance_km": route["distance_km"],
        "Booking_Frequency_Qtr": q.get("booking_frequency_qtr") if q.get("booking_frequency_qtr") is not None
        else seg["booking_frequency_qtr"],
        "Average_Spend_GBP": q.get("average_spend_gbp") if q.get("average_spend_gbp") is not None
        else seg["average_spend_gbp"],
        "Total_Seats": route["total_seats"],
        "Demand_Index": q["demand_index"],
        "Days_Before_Travel": q["days_before_travel"],
        "Seat_Class": q["seat_class"], "Booking_Channel": q["booking_channel"],
        "Origin": q["origin"], "Destination": q["destination"], "Route_Category": route["route_category"],
        "Customer_Segment": q["customer_segment"], "Loyalty_Status": q["loyalty_status"],
    }


def _frame(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows)[state["card"]["features"]]


@app.get("/")
def health() -> dict:
    return {"status": "ok", "model": state["card"]["model"]["name"], "trained_at": state["card"]["trained_at"]}


@app.get("/options")
def options() -> dict:
    ref = state["ref"]
    return {"routes": [{"origin": r["origin"], "destination": r["destination"]} for r in ref["routes"]],
            "categories": ref["categories"], "ranges": ref["ranges"], "segment_defaults": ref["segment_defaults"]}


@app.get("/model-card")
def model_card() -> dict:
    return state["card"]


@app.post("/predict")
def predict(q: Quote) -> dict:
    feats = _features(q.model_dump())
    X = _frame([feats])
    fare = float(state["model"].predict(X)[0])
    baseline = float(state["baseline"].predict(X)[0])
    shap_row = np.asarray(state["explainer"].shap_values(state["model"].named_steps["pre"].transform(X)))[0]
    base_value = float(np.ravel(state["explainer"].expected_value)[0])
    drivers = sorted(({"feature": f, "value": feats[f], "gbp": round(float(s), 2)}
                      for f, s in zip(state["card"]["features"], shap_row)), key=lambda d: -abs(d["gbp"]))
    bands = state["ref"]["fare_bands_gbp"][q.seat_class]
    band = "Low" if fare < bands["low_below"] else "High" if fare > bands["high_above"] else "Moderate"
    return {"fare_gbp": round(fare, 2), "baseline_fare_gbp": round(baseline, 2), "fare_band": band,
            "base_value_gbp": round(base_value, 2), "drivers": drivers}


@app.post("/curve")
def curve(q: Quote) -> dict:
    feats = _features(q.model_dump())
    lo, hi = state["ref"]["ranges"]["days_before_travel"]
    X = _frame([{**feats, "Days_Before_Travel": d} for d in range(lo, hi + 1)])
    fares, baseline = state["model"].predict(X), state["baseline"].predict(X)
    return {"points": [{"days_before_travel": d, "fare_gbp": round(float(f), 2), "baseline_fare_gbp": round(float(b), 2)}
                       for d, f, b in zip(range(lo, hi + 1), fares, baseline)]}
