import json
from typing import Dict, Any

import requests
import streamlit as st

# -----------------------------
# Page config
# -----------------------------
st.set_page_config(
    page_title="Voyage Rails Prediction Demo",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -----------------------------
# Custom styling
# -----------------------------
st.markdown(
    """
    <style>
        .main {
            padding-top: 1rem;
        }
        .hero-card {
            padding: 1.4rem 1.6rem;
            border-radius: 20px;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: white;
            margin-bottom: 1rem;
        }
        .soft-card {
            padding: 1rem 1.2rem;
            border-radius: 18px;
            background: #11182710;
            border: 1px solid rgba(120,120,120,0.15);
            margin-bottom: 1rem;
        }
        .result-card {
            padding: 1.2rem;
            border-radius: 18px;
            background: linear-gradient(135deg, #ecfeff, #f0fdf4);
            border: 1px solid rgba(0,0,0,0.08);
        }
        .small-muted {
            font-size: 0.9rem;
            color: #6b7280;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# -----------------------------
# Helpers
# -----------------------------
def build_payload(
    distance_km: float,
    booking_frequency_qtr: float,
    average_spend_gbp: float,
    total_seats: int,
    seats_sold_realized: int,
    remaining_seats_realized: int,
    demand_index: float,
    days_before_travel: int,
    price_premium: float,
    load_factor: float,
    seat_class: str,
    booking_channel: str,
    origin: str,
    destination: str,
    route_category: str,
    customer_segment: str,
    loyalty_status: str,
) -> Dict[str, Any]:
    return {
        "Distance_km": distance_km,
        "Booking_Frequency_Qtr": booking_frequency_qtr,
        "Average_Spend_GBP": average_spend_gbp,
        "Total_Seats": total_seats,
        "Seats_Sold_Realized": seats_sold_realized,
        "Remaining_Seats_Realized": remaining_seats_realized,
        "Demand_Index": demand_index,
        "Days_Before_Travel": days_before_travel,
        "Price_Premium": price_premium,
        "Load_Factor": load_factor,
        "Seat_Class": seat_class,
        "Booking_Channel": booking_channel,
        "Origin": origin,
        "Destination": destination,
        "Route_Category": route_category,
        "Customer_Segment": customer_segment,
        "Loyalty_Status": loyalty_status,
    }


def predict_price(base_url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{base_url.rstrip('/')}/predict"
    response = requests.post(url, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def check_api_health(base_url: str) -> Dict[str, Any]:
    url = f"{base_url.rstrip('/')}/"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


# -----------------------------
# Sidebar
# -----------------------------
st.sidebar.title("⚙️ API Settings")

base_url = st.sidebar.text_input(
    "FastAPI Base URL",
    value="http://localhost:8000",
    help="Example: http://localhost:8000",
)

st.sidebar.markdown("---")
st.sidebar.subheader("Quick Actions")

if st.sidebar.button("Check API Health", use_container_width=True):
    try:
        health = check_api_health(base_url)
        st.sidebar.success("API is reachable")
        st.sidebar.json(health)
    except Exception as e:
        st.sidebar.error(f"Health check failed: {e}")

sample_mode = st.sidebar.selectbox(
    "Sample scenario",
    ["Custom Input", "Business Traveller", "Leisure Saver", "Premium Frequent Rider"],
)

# -----------------------------
# Presets
# -----------------------------
presets = {
    "Custom Input": {
        "distance_km": 320.0,
        "booking_frequency_qtr": 3.0,
        "average_spend_gbp": 48.0,
        "total_seats": 180,
        "seats_sold_realized": 120,
        "remaining_seats_realized": 60,
        "demand_index": 1.15,
        "days_before_travel": 7,
        "price_premium": 0.10,
        "load_factor": 0.67,
        "seat_class": "Standard",
        "booking_channel": "Web",
        "origin": "London",
        "destination": "Manchester",
        "route_category": "Medium",
        "customer_segment": "Business",
        "loyalty_status": "Silver",
    },
    "Business Traveller": {
        "distance_km": 410.0,
        "booking_frequency_qtr": 8.0,
        "average_spend_gbp": 110.0,
        "total_seats": 220,
        "seats_sold_realized": 185,
        "remaining_seats_realized": 35,
        "demand_index": 1.35,
        "days_before_travel": 2,
        "price_premium": 0.28,
        "load_factor": 0.84,
        "seat_class": "First",
        "booking_channel": "Agent",
        "origin": "Birmingham",
        "destination": "Edinburgh",
        "route_category": "Long",
        "customer_segment": "Business",
        "loyalty_status": "Gold",
    },
    "Leisure Saver": {
        "distance_km": 145.0,
        "booking_frequency_qtr": 1.0,
        "average_spend_gbp": 25.0,
        "total_seats": 160,
        "seats_sold_realized": 70,
        "remaining_seats_realized": 90,
        "demand_index": 0.92,
        "days_before_travel": 21,
        "price_premium": 0.03,
        "load_factor": 0.44,
        "seat_class": "Standard",
        "booking_channel": "Mobile",
        "origin": "Leeds",
        "destination": "York",
        "route_category": "Short",
        "customer_segment": "Leisure",
        "loyalty_status": "None",
    },
    "Premium Frequent Rider": {
        "distance_km": 280.0,
        "booking_frequency_qtr": 10.0,
        "average_spend_gbp": 82.0,
        "total_seats": 200,
        "seats_sold_realized": 165,
        "remaining_seats_realized": 35,
        "demand_index": 1.22,
        "days_before_travel": 4,
        "price_premium": 0.18,
        "load_factor": 0.83,
        "seat_class": "Flex",
        "booking_channel": "Partner",
        "origin": "Glasgow",
        "destination": "Newcastle",
        "route_category": "Medium",
        "customer_segment": "Commuter",
        "loyalty_status": "Platinum",
    },
}

defaults = presets[sample_mode]

# -----------------------------
# Hero
# -----------------------------
st.markdown(
    """
    <div class="hero-card">
        <h1 style="margin-bottom: 0.2rem;">🚆 Voyage Rails Forecast Demo</h1>
        <p style="margin-top: 0.3rem; font-size: 1.05rem;">
            Interactive Streamlit interface for testing FastAPI prediction endpoint.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

col_a, col_b, col_c = st.columns(3)
col_a.metric("Endpoint", "/predict")
col_b.metric("Method", "POST")
col_c.metric("Model Output", "ticket_price_predication")

# -----------------------------
# Form layout
# -----------------------------
with st.form("prediction_form"):
    st.subheader("Input Features")

    c1, c2, c3 = st.columns(3)

    with c1:
        distance_km = st.number_input("Distance (km)", min_value=0.0, value=float(defaults["distance_km"]), step=1.0)
        booking_frequency_qtr = st.number_input(
            "Booking Frequency (Quarter)",
            min_value=0.0,
            value=float(defaults["booking_frequency_qtr"]),
            step=0.1,
        )
        average_spend_gbp = st.number_input(
            "Average Spend (GBP)",
            min_value=0.0,
            value=float(defaults["average_spend_gbp"]),
            step=1.0,
        )
        total_seats = st.number_input("Total Seats", min_value=1, value=int(defaults["total_seats"]), step=1)

    with c2:
        seats_sold_realized = st.number_input(
            "Seats Sold Realized",
            min_value=0,
            value=int(defaults["seats_sold_realized"]),
            step=1,
        )
        remaining_seats_realized = st.number_input(
            "Remaining Seats Realized",
            min_value=0,
            value=int(defaults["remaining_seats_realized"]),
            step=1,
        )
        demand_index = st.number_input(
            "Demand Index",
            min_value=0.0,
            value=float(defaults["demand_index"]),
            step=0.01,
            format="%.2f",
        )
        days_before_travel = st.number_input(
            "Days Before Travel",
            min_value=0,
            value=int(defaults["days_before_travel"]),
            step=1,
        )

    with c3:
        price_premium = st.number_input(
            "Price Premium",
            min_value=0.0,
            value=float(defaults["price_premium"]),
            step=0.01,
            format="%.2f",
        )
        load_factor = st.number_input(
            "Load Factor",
            min_value=0.0,
            value=float(defaults["load_factor"]),
            step=0.01,
            format="%.2f",
        )
        seat_class = st.selectbox("Seat Class", ["Flex", "Standard", "First"], index=["Flex", "Standard", "First"].index(defaults["seat_class"]))
        booking_channel = st.selectbox("Booking Channel", ["Partner", "Agent", "Mobile", "Web"], index=["Partner", "Agent", "Mobile", "Web"].index(defaults["booking_channel"]))

    c4, c5, c6 = st.columns(3)

    with c4:
        origin = st.text_input("Origin", value=defaults["origin"])
        destination = st.text_input("Destination", value=defaults["destination"])

    with c5:
        route_category = st.selectbox("Route Category", ["Short", "Medium", "Long"], index=["Short", "Medium", "Long"].index(defaults["route_category"]))
        customer_segment = st.selectbox(
            "Customer Segment",
            ["Leisure", "Business", "Commuter", "Group"],
            index=["Leisure", "Business", "Commuter", "Group"].index(defaults["customer_segment"]),
        )

    with c6:
        loyalty_status = st.selectbox(
            "Loyalty Status",
            ["None", "Silver", "Gold", "Platinum"],
            index=["None", "Silver", "Gold", "Platinum"].index(defaults["loyalty_status"]),
        )

    submitted = st.form_submit_button("🚀 Run Prediction", use_container_width=True)

# -----------------------------
# Build payload
# -----------------------------
payload = build_payload(
    distance_km=distance_km,
    booking_frequency_qtr=booking_frequency_qtr,
    average_spend_gbp=average_spend_gbp,
    total_seats=total_seats,
    seats_sold_realized=seats_sold_realized,
    remaining_seats_realized=remaining_seats_realized,
    demand_index=demand_index,
    days_before_travel=days_before_travel,
    price_premium=price_premium,
    load_factor=load_factor,
    seat_class=seat_class,
    booking_channel=booking_channel,
    origin=origin,
    destination=destination,
    route_category=route_category,
    customer_segment=customer_segment,
    loyalty_status=loyalty_status,
)

# -----------------------------
# Preview section
# -----------------------------
left, right = st.columns([1.1, 1])

with left:
    st.markdown('<div class="soft-card">', unsafe_allow_html=True)
    st.subheader("Request Preview")
    st.caption("Payload that will be sent to the FastAPI endpoint")
    st.json(payload)
    st.markdown("</div>", unsafe_allow_html=True)

with right:
    st.markdown('<div class="soft-card">', unsafe_allow_html=True)
    st.subheader("Live Feature Summary")
    st.write(f"**Route:** {origin} → {destination}")
    st.write(f"**Class / Channel:** {seat_class} / {booking_channel}")
    st.write(f"**Segment / Loyalty:** {customer_segment} / {loyalty_status}")
    st.progress(min(max(float(load_factor), 0.0), 1.0), text=f"Load Factor: {load_factor:.2f}")
    st.progress(min(max(float(demand_index) / 2.0, 0.0), 1.0), text=f"Demand Index: {demand_index:.2f}")
    st.markdown("</div>", unsafe_allow_html=True)

# -----------------------------
# Prediction
# -----------------------------
if submitted:
    if seats_sold_realized + remaining_seats_realized != total_seats:
        st.warning(
            "Seats Sold Realized + Remaining Seats Realized does not equal Total Seats. "
            "The API may still work, but this input looks inconsistent."
        )

    try:
        with st.spinner("Calling prediction endpoint..."):
            result = predict_price(base_url, payload)

        prediction_value = float(result["ticket_price_predication"])

        st.markdown('<div class="result-card">', unsafe_allow_html=True)
        st.success("Prediction completed successfully")

        r1, r2, r3 = st.columns(3)
        r1.metric("Predicted Ticket Price", f"£{prediction_value:,.2f}")
        r2.metric("Demand Index", f"{demand_index:.2f}")
        r3.metric("Days Before Travel", f"{days_before_travel}")

        st.markdown("</div>", unsafe_allow_html=True)

        tab1, tab2, tab3 = st.tabs(["📈 Insight View", "🧾 API Response", "🧪 cURL"])

        with tab1:
            st.subheader("Prediction Insight")
            fare_band = (
                "Low"
                if prediction_value < 30
                else "Moderate"
                if prediction_value < 70
                else "High"
            )

            i1, i2 = st.columns(2)
            with i1:
                st.info(f"Estimated fare band: **{fare_band}**")
                st.write(
                    f"""
                    - **Origin:** {origin}
                    - **Destination:** {destination}
                    - **Seat class:** {seat_class}
                    - **Booking channel:** {booking_channel}
                    - **Customer segment:** {customer_segment}
                    """
                )

            with i2:
                comparison_data = {
                    "Metric": [
                        "Predicted Price",
                        "Average Spend",
                        "Demand Index x 100",
                        "Load Factor x 100",
                    ],
                    "Value": [
                        prediction_value,
                        average_spend_gbp,
                        demand_index * 100,
                        load_factor * 100,
                    ],
                }
                st.bar_chart(comparison_data, x="Metric", y="Value")

        with tab2:
            st.subheader("Raw Response")
            st.json(result)

        with tab3:
            st.subheader("cURL Example")
            curl_command = f"""curl -X POST "{base_url.rstrip('/')}/predict" \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(payload)}'"""
            st.code(curl_command, language="bash")

    except requests.exceptions.ConnectionError:
        st.error(
            "Could not connect to the API. Make sure your FastAPI app is running and the base URL is correct."
        )
    except requests.exceptions.HTTPError as e:
        detail = ""
        try:
            detail = e.response.text
        except Exception:
            pass
        st.error(f"HTTP error from API: {e}")
        if detail:
            st.code(detail)
    except Exception as e:
        st.error(f"Prediction failed: {e}")
