# Voyage Rails Analytics — Dynamic Ticket Pricing & Revenue Management

<div align="center">

**An Explainable ML Framework for Demand Forecasting and Price Optimization in the Rail Travel Sector**

*A proof-of-concept solution for VoyageRail Ltd.*

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.4+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.32+-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![MLflow](https://img.shields.io/badge/MLflow-2.10+-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[**GitHub Repository**](https://github.com/michizler/voyage-rails-analytics) · [**Live Demo (Local)**](http://localhost:8501)

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
- [Data Pipeline](#data-pipeline)
- [Machine Learning Approach](#machine-learning-approach)
- [Explainability with SHAP](#explainability-with-shap)
- [MLflow Experiment Tracking](#mlflow-experiment-tracking)
- [API Service (FastAPI)](#api-service-fastapi)
- [Interactive Demo (Streamlit)](#interactive-demo-streamlit)
- [Containerization with Docker](#containerization-with-docker)
- [Getting Started](#getting-started)
- [Usage Example](#usage-example)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Executive Summary

VoyageRail Ltd. is a regional rail operator facing a familiar post-pandemic challenge: **demand has recovered, but revenue per seat has not kept pace**. Despite stable ticket volumes, yield per seat varies significantly across routes and travel windows — particularly during peak and near-peak periods. Static pricing rules that worked a decade ago no longer respond to how today's travellers book.

This project delivers an **end-to-end dynamic pricing and revenue management framework** that replaces rule-based pricing with data-driven decisions. The system uses historical booking, capacity, and customer behaviour data to forecast demand, recommend optimal price points, and explain every prediction in terms commercial teams can trust.

**The deliverable is a fully containerized solution** — a FastAPI inference backend, a Streamlit demo interface, and MLflow experiment tracking — all orchestrated through Docker Compose and runnable with a single command.

---

## Business Context

| Detail | Value |
|--------|-------|
| **Company** | VoyageRail Ltd. |
| **Sector** | Rail transportation & travel |
| **Core Business** | Passenger ticket sales across multiple routes, seat classes, and booking channels |
| **Key Operational Metrics** | Load factor, yield per seat, booking lead time, revenue per passenger-km |

VoyageRail operates across multiple origin-destination pairs (e.g., Leeds → York, Manchester → London) with tiered seat classes (Standard, First Class) and multiple booking channels (Mobile, Web, Kiosk, Agent). Customer segments include **Leisure**, **Business**, and **Commuter** travellers — each with distinct price sensitivities and booking behaviours.

---

## The Business Challenge

Despite strong demand recovery in the travel sector, VoyageRail began observing **inconsistent revenue growth across routes and travel periods**. Overall ticket volumes were stable, but yield per seat varied significantly — revealing hidden pricing inefficiencies.

### Key Challenges Identified

**1. Static or Rule-Based Pricing Limitations**
Ticket prices were largely driven by predefined fare rules that failed to respond accurately to real-time demand signals. A seat priced on Monday might no longer reflect Thursday's demand reality.

**2. Revenue Leakage**
Seats were frequently sold **below optimal price points during high-demand windows**, while overpricing during low-demand periods led to unsold capacity. Both errors compound into lost revenue.

**3. Customer Price Sensitivity**
Different customer segments (leisure, business, commuter) reacted differently to price changes — but pricing strategies lacked personalisation or segmentation awareness.

**4. Operational Complexity**
Multiple routes, travel classes, booking windows, and seasonal patterns created pricing inefficiencies that were difficult to manage manually across a distributed commercial team.

**5. Limited Explainability**
Previous analytical models provided limited transparency, making it difficult for commercial teams to **trust or act on** pricing recommendations. A black-box model is useless if the people setting prices cannot defend the numbers.

---

## Project Rationale

### Understanding Ticket Pricing and Revenue Management

Ticket pricing and revenue management is the practice of **optimising ticket prices in response to demand, customer behaviour, time-to-departure, and capacity constraints** — maximising revenue while maintaining customer satisfaction.

In the transportation and travel industry, this approach is widely used to:

- Adjust prices dynamically based on booking velocity
- Segment customers by willingness to pay
- Optimise seat inventory allocation

### Industry Relevance

Leading transportation and travel companies now rely on:

- **Machine learning models** to forecast demand
- **Dynamic pricing engines** that respond in near real time
- **Explainable AI** to support regulatory and internal governance

Without such systems, organisations risk falling behind competitors who monetise demand more effectively.

### Strategic Importance — Top Five Reasons

| # | Reason | Business Value |
|---|--------|----------------|
| 1 | **Revenue Optimisation** | Maximise yield per seat without increasing capacity |
| 2 | **Demand-Supply Alignment** | Match prices to real-time booking patterns and remaining inventory |
| 3 | **Customer Experience Improvement** | Avoid abrupt or illogical price changes that erode trust |
| 4 | **Operational Efficiency** | Reduce manual pricing interventions and rule maintenance |
| 5 | **Competitive Advantage** | Respond dynamically to market shifts while rivals rely on static tables |

---

## Project Objectives

The project aims to design and deploy a data-driven ticket pricing and revenue management framework with the following objectives:

1. **Predict Demand Accurately** — Use historical and behavioural data to forecast ticket demand across routes, dates, and time windows.
2. **Optimise Pricing Decisions** — Determine optimal price points that balance revenue maximisation and seat utilisation.
3. **Incorporate Customer Behaviour** — Account for booking lead time, travel purpose, and price sensitivity.
4. **Enhance Explainability** — Use interpretable machine learning techniques (SHAP) to justify every pricing decision.
5. **Drive Measurable Business Impact** — Increase revenue per seat, improve load factors, and reduce unsold inventory.

---

## Solution Architecture

The solution is built as a **microservices architecture** running in Docker Compose, with three independent services that communicate over an internal network:

```
┌────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                      │
│                                                                    │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │                  │      │                  │                    │
│  │    streamlit     │─────▶│     backend      │                    │
│  │  (port 8501)     │ HTTP │   (FastAPI)      │                    │
│  │                  │ POST │   (port 8000)    │                    │
│  │  User Interface  │◀─────│   Inference API  │                    │
│  │                  │ JSON │                  │                    │
│  └──────────────────┘      └────────┬─────────┘                    │
│                                     │                              │
│                                     │ loads                        │
│                                     ▼                              │
│                            ┌──────────────────┐                    │
│                            │                  │                    │
│                            │   model.pkl +    │                    │
│                            │   MLflow Runs    │                    │
│                            │                  │                    │
│                            └──────────────────┘                    │
└────────────────────────────────────────────────────────────────────┘
```

**Request flow:**
1. The user inputs booking features in the Streamlit UI (origin, destination, days before travel, seat class, etc.)
2. Streamlit sends a POST request to the FastAPI backend at `http://backend:8000/predict`
3. FastAPI validates the payload, loads the trained model, runs inference
4. The predicted ticket price is returned as JSON
5. Streamlit displays the result, along with demand index, fare band, and a comparative bar chart

---

## Project Structure

```
voyage-rails-analytics/
│
├── source-data/
│   └── travel_data.csv               # Raw booking, pricing, and capacity data
│
├── preprocessing/
│   ├── preprocess.ipynb              # EDA, cleaning, feature engineering, model training
│   ├── shap_summary_plot.png         # Saved SHAP explainability visualisation
│   ├── mlruns/                       # MLflow experiment tracking directory
│   └── mlflow.db                     # MLflow backend store (SQLite)
│
├── app.py                            # FastAPI inference service
├── streamlit_app.py                  # Streamlit demo UI
│
├── Dockerfile.backend                # FastAPI service image
├── Dockerfile.streamlit              # Streamlit service image
├── docker-compose.yml                # Orchestrates both services
│
├── requirements.txt                  # Python dependencies
├── mlflow.db                         # MLflow production tracking DB
├── .gitignore
└── README.md
```

---

## Data Pipeline

### Source Data

The dataset (`source-data/travel_data.csv`) contains historical booking records with the following features:

**Route & Trip Characteristics**
- `origin`, `destination` — station pair (e.g., Leeds → York)
- `distance_km` — route distance
- `route_category` — short / medium / long
- `seat_class` — Standard / First Class
- `total_seats` — capacity on the service

**Booking & Timing**
- `days_before_travel` — booking lead time (in days)
- `booking_frequency_quarter` — customer's booking rate
- `booking_channel` — Mobile / Web / Kiosk / Agent

**Pricing & Revenue Signals**
- `price_premium` — surcharge applied above base fare
- `average_spend_gbp` — historical customer spend
- `load_factor` — seats sold / total seats
- `seats_sold_realised`, `remaining_seats_realised`

**Demand Signals**
- `demand_index` — composite demand score (0–1)

**Customer Attributes**
- `customer_segment` — Leisure / Business / Commuter
- `loyalty_status` — None / Silver / Gold / Platinum

**Target Variable**
- `ticket_price` — actual realised ticket price (regression target)

### Feature Engineering

All preprocessing is documented in `preprocessing/preprocess.ipynb`:

- **Categorical encoding** — One-hot encoding for nominal variables (origin, destination, booking_channel); label encoding for ordinal features (seat_class, loyalty_status)
- **Numerical scaling** — Standard scaling applied to continuous features for model convergence
- **Interaction features** — `load_factor × demand_index`, `days_before_travel × route_category` captured non-linear relationships between booking timing and route type
- **Temporal features** — Derived booking window buckets (≤7 days, 8–21 days, >21 days) from `days_before_travel`

---

## Machine Learning Approach

### Problem Framing

**Task type:** Supervised regression
**Target:** `ticket_price` (continuous, GBP)
**Evaluation metrics:** RMSE, MAE, R²

### Models Evaluated

Multiple regression algorithms were trained and compared:

| Model | Purpose |
|-------|---------|
| **Linear Regression** | Baseline — establishes a floor for expected performance |
| **Random Forest Regressor** | Captures non-linear relationships, robust to feature scale |
| **Gradient Boosting Regressor** | Strong out-of-the-box performance on tabular data |
| **XGBoost** | Production-grade gradient boosting with regularisation |

Each model was trained with 80/20 train/test split, 5-fold cross-validation, and hyperparameters tuned via grid search. The **best-performing model was serialised to `model.pkl`** and is the one loaded by the FastAPI backend at runtime.

### Output

The model returns a predicted ticket price (e.g., **£37.30** for a Leeds→York Standard class booking, 21 days before travel, with demand index 0.92 and load factor 0.44).

---

## Explainability with SHAP

**Commercial teams will not act on pricing recommendations they cannot explain.** This is why explainability was a first-class requirement, not an afterthought.

SHAP (SHapley Additive exPlanations) values were computed for every prediction, producing:

- **Global feature importance** — which features drive pricing decisions across the entire dataset
- **Per-prediction explanations** — for any given booking, which features pushed the predicted price up or down, and by how much
- **Dependence plots** — how predicted price changes as a single feature (e.g., `days_before_travel`) varies, holding others constant

The saved `preprocessing/shap_summary_plot.png` visualises the top contributors to pricing decisions. Typical drivers include:

1. `demand_index` (strongest signal)
2. `load_factor`
3. `days_before_travel`
4. `seat_class`
5. `route_category`

This gives commercial teams a defensible narrative: *"We're recommending £37.30 for this Leeds→York booking because demand is 92% of capacity benchmark, with 21 days lead time and moderate load factor — historically this configuration yields the best revenue."*

---

## MLflow Experiment Tracking

MLflow is integrated into the training pipeline to ensure reproducibility and model governance:

- **Experiment runs** logged to `mlflow.db` (SQLite backend) and `preprocessing/mlruns/` artifact store
- **Tracked per run:** hyperparameters, evaluation metrics (RMSE, MAE, R²), training duration, dataset version, git commit hash
- **Model registry:** models can be registered, versioned, and promoted through stages (Staging → Production) for controlled rollouts
- **Artifact logging:** SHAP plots, confusion matrices, and feature importance charts are persisted with each run

This turns the project from "a notebook that once trained a model" into **an auditable, reproducible ML pipeline** — a critical requirement if the system is ever to be deployed in a regulated commercial context.

---

## API Service (FastAPI)

The trained model is served via a **FastAPI REST endpoint** defined in `app.py`, providing real-time inference with automatic OpenAPI documentation.

**Endpoint:** `POST /predict`
**Input:** JSON payload containing all required booking features
**Output:** Predicted ticket price (GBP), demand index echo, and fare band classification

Example request schema:
```json
{
  "distance_km": 145.0,
  "seats_sold_realised": 70,
  "price_premium": 0.03,
  "booking_frequency_quarter": 1.0,
  "remaining_seats_realised": 90,
  "load_factor": 0.44,
  "average_spend_gbp": 25.0,
  "demand_index": 0.92,
  "seat_class": "Standard",
  "total_seats": 160,
  "days_before_travel": 21,
  "booking_channel": "Mobile",
  "origin": "Leeds",
  "route_category": "Short",
  "loyalty_status": "None",
  "destination": "York",
  "customer_segment": "Leisure"
}
```

Example response:
```json
{
  "ticket_price_prediction": 37.30,
  "demand_index": 0.92,
  "days_before_travel": 21,
  "fare_band": "Moderate"
}
```

**Features:**
- **Pydantic request validation** — ensures every inbound payload matches the training schema
- **Automatic Swagger UI** at `http://localhost:8000/docs`
- **Async-ready** — built on Starlette for high-throughput serving
- **Model loaded once at startup** — sub-millisecond inference per request

---

## Interactive Demo (Streamlit)

A **Streamlit web interface** (`streamlit_app.py`) provides a no-code way for stakeholders to test the model, explore predictions, and validate the system's behaviour.

### Features

- **API Settings sidebar** — configurable FastAPI base URL (defaults to `http://backend:8000` inside Docker Compose)
- **Quick Actions** — health check button, sample scenario presets (Leisure Saver, Business Peak, Weekend Commuter)
- **Input form** — all 17 booking features exposed as number inputs, dropdowns, and selectors
- **Run Prediction button** — sends the payload to the FastAPI backend
- **Three result views:**
  - **Insight View** — predicted price as a headline metric, fare band classification (Low / Moderate / High / Premium), comparative bar chart of key drivers
  - **API Response** — raw JSON returned by the backend (for debugging and verification)
  - **cURL** — exportable cURL command for reproducing the call outside the UI

### Example Prediction

For a Leeds → York Standard class booking, 21 days out, with demand index 0.92:

| Metric | Value |
|--------|-------|
| **Predicted Ticket Price** | £37.30 |
| **Demand Index** | 0.92 |
| **Days Before Travel** | 21 |
| **Estimated Fare Band** | Moderate |

The comparative chart visualises Average Spend, Demand Index (×100), Load Factor (×100), and Predicted Price side by side — giving commercial analysts an at-a-glance view of whether a prediction sits in line with historical patterns.

---

## Containerization with Docker

The entire solution is containerised and orchestrated via `docker-compose.yml`. Two services run side-by-side:

| Service | Image | Port | Role |
|---------|-------|------|------|
| `backend` | Built from `Dockerfile.backend` | `8000:8000` | FastAPI inference service |
| `streamlit` | Built from `Dockerfile.streamlit` | `8501:8501` | User-facing demo |

**Internal networking:** Streamlit addresses the backend as `http://backend:8000` using Docker's internal DNS. This means the whole stack is portable — it runs identically on a laptop, a staging server, or any container host (ECS, GKE, AKS).

Starting the stack:
```bash
docker-compose up --build
```

Stopping:
```bash
docker-compose down
```

**Why this matters:** Containerisation bridges the gap between "I trained a model in a notebook" and "this runs in production." It's how the data science work becomes **deployable software**.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Docker Desktop (for the containerised workflow)
- Git

### Option 1 — Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/michizler/voyage-rails-analytics.git
cd voyage-rails-analytics

# Build and start both services
docker-compose up --build

# Once running:
#   FastAPI docs  → http://localhost:8000/docs
#   Streamlit UI  → http://localhost:8501
```

### Option 2 — Run Locally without Docker

```bash
# Set up Python environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI backend (terminal 1)
uvicorn app:app --reload --port 8000

# Start Streamlit frontend (terminal 2)
streamlit run streamlit_app.py
# In the sidebar, set FastAPI Base URL to: http://localhost:8000
```

### Reproducing the Model Training

Open `preprocessing/preprocess.ipynb` in Jupyter and run all cells. This performs the full pipeline: EDA → cleaning → feature engineering → model training → evaluation → SHAP analysis → model serialisation → MLflow logging.

---

## Usage Example

### Via the Streamlit UI

1. Open `http://localhost:8501`
2. Select sample scenario **Leisure Saver** from the sidebar (or enter custom values)
3. Click **Run Prediction**
4. Review the predicted price, fare band, and explanation chart

### Via cURL

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 145.0,
    "seats_sold_realised": 70,
    "price_premium": 0.03,
    "booking_frequency_quarter": 1.0,
    "remaining_seats_realised": 90,
    "load_factor": 0.44,
    "average_spend_gbp": 25.0,
    "demand_index": 0.92,
    "seat_class": "Standard",
    "total_seats": 160,
    "days_before_travel": 21,
    "booking_channel": "Mobile",
    "origin": "Leeds",
    "route_category": "Short",
    "loyalty_status": "None",
    "destination": "York",
    "customer_segment": "Leisure"
  }'
```

Response:

```json
{
  "ticket_price_prediction": 37.30,
  "demand_index": 0.92,
  "fare_band": "Moderate"
}
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | Python 3.10+ | Core implementation |
| **Data Processing** | Pandas, NumPy | Ingestion, cleaning, feature engineering |
| **Machine Learning** | Scikit-learn, XGBoost | Model training & evaluation |
| **Explainability** | SHAP | Per-prediction and global feature attribution |
| **Experiment Tracking** | MLflow | Run logging, model registry, reproducibility |
| **API Framework** | FastAPI, Pydantic, Uvicorn | Async REST serving with schema validation |
| **Front-End / Demo** | Streamlit, Plotly | Interactive UI for stakeholders |
| **Containerisation** | Docker, Docker Compose | Service orchestration & portability |
| **Notebooks** | Jupyter | Development and documentation |
| **Version Control** | Git, GitHub | Source control & collaboration |

---

## Roadmap

**Phase 1 — Validation (Months 1–2)**
Validate predictions against held-out historical data, run A/B tests against the existing rule-based pricing engine on a single route, refine feature engineering based on commercial team feedback.

**Phase 2 — Integration (Months 3–5)**
Connect the API to VoyageRail's booking system, implement data drift monitoring, set up automated model retraining pipelines, build internal dashboards for commercial leadership.

**Phase 3 — Scale (Months 6–12)**
Deploy to production with real-time scoring across all routes, expand to cross-sell and upgrade recommendations, add loyalty-aware pricing, measure realised revenue uplift against the pre-deployment baseline.

**Long-term vision:** evolve from a single-endpoint pricing service into a **revenue intelligence platform** — unifying demand forecasting, inventory optimisation, and customer lifetime value into a single decision engine.

---

## Author

This project was developed as a proof-of-concept by Bright Uzosike. All rights reserved.

