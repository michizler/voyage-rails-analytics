from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
import os
import pandas as pd
import mlflow
import mlflow.sklearn
from contextlib import asynccontextmanager

# mlflow tracking uri
track_uri = "sqlite:///c:/Users/brigh/Documents/amdari-internship/projects/voyage-rails-analytics/preprocessing/mlflow.db"
model_uri = "file:c:/Users/brigh/Documents/amdari-internship/projects/voyage-rails-analytics/preprocessing/mlruns/2/models/m-16f23089d41e4faa84a7979dd787394a/artifacts"


model = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    mlflow.set_tracking_uri(track_uri)
    model["pipeline"] = mlflow.sklearn.load_model(model_uri)
    yield
    model.clear()


app = FastAPI(
    title="Voyage Rails Forecast API",
    description="API for forecasting voyage rail demand price using mlflow and scikit-learn",
    version="1.0.0",
    lifespan=lifespan,
)


class PredictionRequest(BaseModel):
    Distance_km: float
    Booking_Frequency_Qtr: float
    Average_Spend_GBP: float
    Total_Seats: int
    Seats_Sold_Realized: int
    Remaining_Seats_Realized: int
    Demand_Index: float
    Days_Before_Travel: int
    Price_Premium: float
    Load_Factor: float
    Seat_Class: Literal["Flex", "Standard", "First"]
    Booking_Channel: Literal["Partner", "Agent", "Mobile", "Web"]
    Origin: str
    Destination: str
    Route_Category: Literal["Short", "Medium", "Long"]
    Customer_Segment: Literal["Leisure", "Business", "Commuter", "Group"]
    Loyalty_Status: Literal["None", "Silver", "Gold", "Platinum"]


class PredictionResponse(BaseModel):
    ticket_price_predication: float


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Convert the request to a pandas DataFrame
    input_df = pd.DataFrame([request.model_dump()])

    # Make a prediction
    prediction = model["pipeline"].predict(input_df)
    
    # Return the prediction in the response model
    return PredictionResponse(ticket_price_predication=float(prediction[0]))
