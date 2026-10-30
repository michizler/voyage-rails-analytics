# Voyage Rails Analytics

<div align="center">

**An explainable fare model for rail revenue management**

*A proof of concept for VoyageRail Ltd.*

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.8-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.129-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.55-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![MLflow](https://img.shields.io/badge/MLflow-3.10-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Business Context](#business-context)
- [The Business Challenge](#the-business-challenge)
- [Project Rationale](#project-rationale)
- [Project Objectives](#project-objectives)
- [Solution Architecture](#solution-architecture)
- [Project Structure](#project-structure)
- [Data](#data)
- [Feature Audit](#feature-audit)
- [Machine Learning Approach](#machine-learning-approach)
- [Explainability with SHAP](#explainability-with-shap)
- [MLflow Experiment Tracking](#mlflow-experiment-tracking)
- [API Service (FastAPI)](#api-service-fastapi)
- [Fare Desk (Streamlit)](#fare-desk-streamlit)
- [Containerisation with Docker](#containerisation-with-docker)
- [Getting Started](#getting-started)
- [Limitations](#limitations)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Executive Summary

VoyageRail Ltd. is a regional rail operator facing a familiar post-pandemic problem. **Demand has recovered, but revenue per seat has not kept pace.** Ticket volumes are stable, yet yield per seat varies a lot across routes and travel windows, especially around peak times. Static pricing rules no longer match how today's travellers book.

This project replaces rule-based pricing with a fare model. It quotes a fare from what a booking desk knows at quote time, explains every quote in pounds, and shows how the fare should move as departure approaches. Commercial teams can then price with confidence and defend each number.

**The deliverable is a containerised service.** A FastAPI fare API and a Streamlit fare desk run together with one Docker Compose command. Every training run is logged to MLflow.

The shipped model is gradient boosting, with a holdout R² of **0.903** and an average error of **£6.53** per fare. The linear baseline scores 0.713.

VoyageRail is a stand-in name for a client that can't be named under contract. A synthetic booking dataset was used in place of their data.

---

## Business Context

| Detail | Value |
|--------|-------|
| **Company** | VoyageRail Ltd. |
| **Sector** | Rail transportation and travel |
| **Core Business** | Passenger ticket sales across many routes, seat classes and booking channels |
| **Key Operational Metrics** | Load factor, yield per seat, booking lead time, revenue per passenger km |

VoyageRail runs 25 origin and destination pairs, such as Manchester to London and Exeter to York. It sells three seat classes (Standard, Flex and First) through four channels (Mobile, Web, Agent and Partner). Its customers are Leisure, Business, Commuter and Student travellers, and each group books and responds to price differently.

---

## The Business Challenge

VoyageRail saw **uneven revenue growth across routes and travel periods**. Overall ticket volumes were stable, but yield per seat varied a lot. That pointed to hidden pricing problems.

### Key Challenges Identified

**1. Static, rule-based pricing**
Fares came from fixed rules that did not respond to demand. A seat priced on Monday might not reflect Thursday's demand.

**2. Revenue leakage**
Seats were often sold **below the right price when demand was high**, and priced too high when demand was low, which left seats unsold. Both mistakes lose revenue.

**3. Different customers, one price**
Leisure, business, commuter and student travellers react differently to price changes. The pricing did not account for that.

**4. Operational complexity**
Many routes, classes, booking windows and seasons made pricing hard to manage by hand across a commercial team.

**5. Limited explainability**
Earlier models gave little insight into their output, so commercial teams found it hard to **trust or act on** them. A model nobody can explain is a model nobody will use to set prices.

---

## Project Rationale

### Understanding Ticket Pricing and Revenue Management

Revenue management means **setting ticket prices in response to demand, customer behaviour, time to departure and capacity**. The aim is more revenue without losing customer goodwill.

Transport and travel companies use it to

- adjust prices as bookings come in
- price for different customer groups
- manage how seats are allocated

### Industry Relevance

Leading transport and travel companies now rely on **machine learning** to forecast demand, **dynamic pricing** that responds in near real time, and **explainable AI** for governance. Operators without these tools risk falling behind rivals who price demand better.

### Strategic Importance

| # | Reason | Business Value |
|---|--------|----------------|
| 1 | **Revenue** | More yield per seat without adding capacity |
| 2 | **Demand and supply** | Prices that follow booking patterns |
| 3 | **Customer experience** | No sudden or illogical price changes |
| 4 | **Efficiency** | Less manual pricing and rule upkeep |
| 5 | **Competition** | Faster response to the market than static fare tables |

---

## Project Objectives

1. **Quote fares accurately** from what is known at the moment of booking.
2. **Show how a fare should move** across the booking window, so pricing can follow demand.
3. **Account for customer behaviour** such as lead time, travel purpose and loyalty.
4. **Explain every quote** with SHAP, in pounds, so each price can be defended.
5. **Ship it as a service** that a booking system or a commercial analyst can call.

---

## Solution Architecture

Two services run in Docker Compose and talk over its internal network.

```
┌────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                      │
│                                                                    │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │    streamlit     │─────▶│     backend      │                    │
│  │   (port 8501)    │ HTTP │    (FastAPI)     │                    │
│  │    Fare desk     │◀─────│   (port 8000)    │                    │
│  └──────────────────┘ JSON └────────┬─────────┘                    │
│                                     │ loads at startup             │
│                                     ▼                              │
│                   ┌───────────────────────────────────┐            │
│                   │ models/                           │            │
│                   │   model.joblib     (fare model)   │            │
│                   │   baseline.joblib  (linear model) │            │
│                   │   reference.json   (routes, bands)│            │
│                   │   model_card.json  (metrics)      │            │
│                   └───────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────────┘
```

**How a quote works**
1. The user picks a route, class, channel, segment, loyalty tier, days before travel and the demand forecast in the fare desk.
2. The fare desk sends them to `POST /predict` and `POST /curve` on the API.
3. The API fills in distance, route category and seat capacity from the chosen route, then runs both models.
4. It returns the fare, the baseline fare, a fare band and the SHAP drivers, plus the fare for every lead time from 0 to 89 days.
5. The fare desk shows the fare, the price curve and why the fare landed where it did.

`train.py` builds everything in `models/` and logs each run to MLflow.

---

## Project Structure

```
voyage-rails-analytics/
│
├── source-data/
│   └── travel_data.csv          # 519,713 synthetic bookings
│
├── preprocessing/
│   └── preprocess.ipynb         # EDA, cleaning and the feature audit
│
├── train.py                     # Trains and compares the models, writes models/, logs to MLflow
├── models/                      # The shipped model, baseline, reference data and model card
│
├── app.py                       # FastAPI fare service
├── streamlit_app.py             # Streamlit fare desk
│
├── Dockerfile.backend           # API image
├── Dockerfile.streamlit         # Fare desk image
├── docker-compose.yml           # Runs both services
│
├── voyage-presentation/         # React slide deck for the client presentation
├── requirements.txt
└── README.md
```

---

## Data

`source-data/travel_data.csv` holds 519,713 bookings for travel between 1 January and 31 March 2025. Each row is one ticket.

**Route and trip**
- `Origin`, `Destination` for 25 routes
- `Distance_km`, `Route_Category` (Short, Medium or Long) and `Total_Seats` for the service
- `Seat_Class` (Standard, Flex or First)

**Booking and timing**
- `Days_Before_Travel`, from 0 to 89
- `Booking_Channel` (Mobile, Web, Agent or Partner)
- `Booking_Frequency_Qtr`, how often the customer books

**Customer**
- `Customer_Segment` (Leisure, Business, Commuter or Student)
- `Loyalty_Status` (None, Silver, Gold or Platinum)
- `Average_Spend_GBP`, the customer's usual spend

**Demand**
- `Demand_Index`, one score per departure, from 0.658 to 1.52

**Pricing and capacity**
- `Base_Price_At_Booking`, `Price_Premium`
- `Seats_Sold_Realized`, `Remaining_Seats_Realized`, `Load_Factor`

**Target**
- `Ticket_Price_GBP`, the fare paid. It runs from £12.29 to £372.86, with a mean of £59.95.

"None" is a real loyalty tier, so the data is read with `keep_default_na=False`. Otherwise pandas would treat it as missing.

The notebook `preprocessing/preprocess.ipynb` covers the EDA and cleaning.

---

## Feature Audit

Before modelling, I checked which columns a fare desk would actually know at the moment it quotes. Five of them give the answer away or are only known after the train has left, so the model never uses them.

| Column | Why it is excluded | Evidence |
|---|---|---|
| `Base_Price_At_Booking` | Base fare plus premium is the ticket price | Exact in 461,445 of 461,445 rows where both are present |
| `Price_Premium` | The same sum, so the answer sits inside the inputs | As above |
| `Seats_Sold_Realized` | The final number of seats sold for the departure | Equals the departure's booking count in 2,250 of 2,250 departures |
| `Remaining_Seats_Realized` | Total seats minus final seats sold | Built from the column above |
| `Load_Factor` | Final seats sold over total seats | Built from the column above |

`train.py` also trains the models with four of these columns added back, on the same split. A random forest then appears to score an R² of 0.924. That score is not real, because a fare desk can't know these values, and it is why the columns are excluded. The figures are kept in the model card under `excluded_columns_check`.

The model uses 13 features. Six are numeric (distance, booking frequency, average spend, total seats, demand index and days before travel) and seven are categorical (seat class, channel, origin, destination, route category, customer segment and loyalty tier).

---

## Machine Learning Approach

**Task**
Regression on `Ticket_Price_GBP`.

**Evaluation**
An 80/20 holdout split with seed 42, plus 5-fold cross-validation on the training split. The metrics are R², MAE, RMSE and MAPE.

### Models Compared

All three use the same quote-time features and the same split.

| Model | Holdout R² | MAE | Size and fit time |
|---|---|---|---|
| **Gradient boosting (shipped)** | **0.903** | **£6.53** | 0.6 MB, about 10 seconds |
| Random forest | 0.864 | £7.40 | about 17 MB, about 3 minutes |
| Linear regression (baseline) | 0.713 | £11.21 | under 2 seconds |

Five-fold cross-validation gives gradient boosting an R² of 0.903 ± 0.002 and an MAE of £6.54. Gradient boosting won on accuracy, size and fit time, so it is saved as `models/model.joblib`.

The linear model is kept as `models/baseline.joblib`. The API returns its fare next to the model's, so every quote shows what a simple model would have said.

The full metrics are in [`models/model_card.json`](models/model_card.json).

---

## Explainability with SHAP

Every quote comes with SHAP contributions in pounds. They start from the average fare in the training data and add up to the quoted fare, so each price can be explained feature by feature.

For the example quote below, 21 days of lead time adds £14.77, the 169 km distance takes off £10.55 and a demand forecast of 0.92 takes off £5.89.

---

## MLflow Experiment Tracking

`train.py` logs each run to MLflow in `mlflow.db`, under the experiment `voyagerail-fare-model`.

Each run records
- the gradient boosting parameters
- the features used and the columns excluded
- holdout and cross-validation metrics for the model and the baseline
- both trained models as MLflow artefacts

To browse the runs, start the MLflow UI.

```bash
mlflow ui --backend-store-uri sqlite:///mlflow.db
```

`mlflow.db` and `mlruns/` are not committed. Running `train.py` creates them.

---

## API Service (FastAPI)

`app.py` serves the model. It loads the files in `models/` once at startup. Interactive docs are at `http://localhost:8000/docs`.

| Method | Path | Returns |
|---|---|---|
| GET | `/` | Status, model name and training date |
| GET | `/options` | Routes, categories, the demand index range and segment defaults |
| GET | `/model-card` | The full model card |
| POST | `/predict` | Fare, baseline fare, fare band and SHAP drivers |
| POST | `/curve` | Model and baseline fares for every lead time from 0 to 89 days |

The request holds only what a booking desk knows. Distance, route category and seat capacity come from the route. Booking frequency and average spend are optional and default to the typical value for the customer segment.

The API rejects a route that isn't in the data, a demand index outside the range the model was trained on, and any field it doesn't expect, such as `load_factor`. Each returns a 422 with a plain message.

### Example

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Manchester",
    "destination": "London",
    "seat_class": "Standard",
    "booking_channel": "Mobile",
    "customer_segment": "Leisure",
    "loyalty_status": "None",
    "days_before_travel": 21,
    "demand_index": 0.92
  }'
```

The response is below, with the drivers shortened to the largest five.

```json
{
  "fare_gbp": 52.83,
  "baseline_fare_gbp": 51.6,
  "fare_band": "Moderate",
  "base_value_gbp": 59.95,
  "drivers": [
    {"feature": "Days_Before_Travel", "value": 21, "gbp": 14.77},
    {"feature": "Distance_km", "value": 169, "gbp": -10.55},
    {"feature": "Demand_Index", "value": 0.92, "gbp": -5.89},
    {"feature": "Seat_Class", "value": "Standard", "gbp": -5.16},
    {"feature": "Total_Seats", "value": 409, "gbp": -1.12}
  ]
}
```

The fare band is Low, Moderate or High, measured against the spread of training fares for that seat class.

---

## Fare Desk (Streamlit)

`streamlit_app.py` is a no-code front end for commercial staff.

- **Sidebar.** The API address, which defaults to `http://backend:8000` inside Docker Compose, and three sample scenarios. These are a business traveller at short notice, a leisure traveller booking ahead, and a student travelling the same day.
- **Quote form.** Route, seat class, channel, segment, loyalty tier, days before travel and the demand forecast. The destination list only shows routes that exist.
- **Result.** The quoted fare, the linear baseline fare and the fare band.
- **Four tabs.** The price curve across the booking window, the SHAP drivers behind the fare, the raw API response, and a cURL command to repeat the call.

---

## Containerisation with Docker

`docker-compose.yml` runs both services side by side.

| Service | Image | Port | Role |
|---------|-------|------|------|
| `backend` | `Dockerfile.backend` | `8000:8000` | FastAPI fare service |
| `streamlit` | `Dockerfile.streamlit` | `8501:8501` | Fare desk |

The fare desk reaches the API at `http://backend:8000` through Docker's internal DNS, so the stack runs the same on a laptop or any container host.

```bash
docker-compose up --build     # start
docker-compose down           # stop
```

---

## Getting Started

### Prerequisites

- Python 3.12
- Docker Desktop, for the containerised run
- Git

### Option 1. Docker Compose

```bash
git clone https://github.com/michizler/voyage-rails-analytics.git
cd voyage-rails-analytics
docker-compose up --build

# FastAPI docs   http://localhost:8000/docs
# Fare desk      http://localhost:8501
```

### Option 2. Run locally

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app:app --reload --port 8000                         # terminal 1
API_URL=http://localhost:8000 streamlit run streamlit_app.py # terminal 2
```

### Retraining the model

```bash
python train.py                      # about 8 minutes, includes the model comparison
python train.py --skip-comparison    # faster, skips the random forest runs
```

This rewrites the four files in `models/` and logs a new MLflow run.

---

## Limitations

- **The data is synthetic.** In it, fares rise with lead time for about three weeks and then level off. The mean fare is £48.70 on the day and about £77 from 15 days out. That is the opposite of real UK advance fares. The model reproduces the data and is not pricing advice.
- **Bookings are front-loaded.** A third are made on the day, and only 655 of 519,713 are made more than 60 days out. The price curve beyond 60 days rests on thin data.
- **The demand index is one score per departure.** The fare desk treats it as the operator's demand forecast, which would be known when quoting.
- **One quarter of travel.** The data covers January to March 2025, so the model has seen no summer or holiday demand.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | Python 3.12 | Core implementation |
| **Data** | pandas, NumPy | Loading, cleaning and features |
| **Machine Learning** | scikit-learn (gradient boosting, random forest, linear regression) | Training and evaluation |
| **Explainability** | SHAP | Per-quote contributions in pounds |
| **Experiment Tracking** | MLflow | Run logging and model artefacts |
| **API** | FastAPI, Pydantic, Uvicorn | REST serving with request validation |
| **Front End** | Streamlit | Fare desk for commercial staff |
| **Containers** | Docker, Docker Compose | Running both services together |
| **Notebooks** | Jupyter | EDA and the feature audit |
| **Version Control** | Git, GitHub | Source control |

---

## Roadmap

**Phase 1. Validation (months 1 and 2)**
Check predictions against held-out history, A/B test against the current rule-based pricing on one route, and refine features with the commercial team.

**Phase 2. Integration (months 3 to 5)**
Connect the API to VoyageRail's booking system, add data drift monitoring, automate retraining and build dashboards for commercial leadership.

**Phase 3. Scale (months 6 to 12)**
Score every route in real time, add upgrade and cross-sell suggestions, add loyalty-aware pricing and measure the revenue uplift against the pre-launch baseline.

**Long term**, the aim is a **revenue intelligence platform** that brings demand forecasting, seat allocation and customer lifetime value into one decision engine.

---

## Author

This project was developed as a proof of concept by Bright Uzosike. All rights reserved.
