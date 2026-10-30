"""Streamlit front end for the VoyageRail Fare API: quote a fare, see the drivers and the booking-window curve."""
import json
import os
from typing import Any, Dict

import pandas as pd
import requests
import streamlit as st

st.set_page_config(page_title="VoyageRail Fare Desk", page_icon="🚆", layout="wide", initial_sidebar_state="expanded")

st.markdown(
    """
    <style>
        .hero-card { padding: 1.4rem 1.6rem; border-radius: 20px; background: linear-gradient(135deg, #0f172a, #1e293b);
                     color: white; margin-bottom: 1rem; }
        .soft-card { padding: 1rem 1.2rem; border-radius: 18px; background: #11182710;
                     border: 1px solid rgba(120,120,120,0.15); margin-bottom: 1rem; }
    </style>
    """,
    unsafe_allow_html=True,
)


def api_get(base: str, path: str) -> Dict[str, Any]:
    r = requests.get(f"{base.rstrip('/')}{path}", timeout=15)
    r.raise_for_status()
    return r.json()


def api_post(base: str, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.post(f"{base.rstrip('/')}{path}", json=payload, timeout=30)
    r.raise_for_status()
    return r.json()


# ---------------- Sidebar ----------------
st.sidebar.title("⚙️ API settings")
base_url = st.sidebar.text_input("FastAPI base URL", value=os.getenv("API_URL", "http://backend:8000"))

try:
    opts = api_get(base_url, "/options")
    health = api_get(base_url, "/")
    st.sidebar.success(f"Connected · {health['model']}")
except Exception as e:  # the app still renders, so the user can fix the URL
    st.sidebar.error(f"API not reachable: {e}")
    st.stop()

routes = opts["routes"]
origins = sorted({r["origin"] for r in routes})
cats = opts["categories"]
d_lo, d_hi = opts["ranges"]["demand_index"]

presets = {
    "Custom": None,
    "Business traveller, short notice": {"origin": "Manchester", "destination": "London", "seat_class": "First",
        "booking_channel": "Agent", "customer_segment": "Business", "loyalty_status": "Gold", "days_before_travel": 2, "demand_index": 1.3},
    "Leisure, booked ahead": {"origin": "Exeter", "destination": "York", "seat_class": "Standard",
        "booking_channel": "Mobile", "customer_segment": "Leisure", "loyalty_status": "None", "days_before_travel": 30, "demand_index": 0.9},
    "Student, same day": {"origin": "Birmingham", "destination": "Liverpool", "seat_class": "Standard",
        "booking_channel": "Web", "customer_segment": "Student", "loyalty_status": "Silver", "days_before_travel": 0, "demand_index": 1.05},
}
choice = st.sidebar.selectbox("Sample scenario", list(presets))
p = presets[choice] or {"origin": "Manchester", "destination": "London", "seat_class": "Standard", "booking_channel": "Web",
                        "customer_segment": "Business", "loyalty_status": "Silver", "days_before_travel": 7,
                        "demand_index": opts["ranges"]["demand_index_median"]}

# ---------------- Hero ----------------
st.markdown(
    """<div class="hero-card"><h1 style="margin-bottom:0.2rem;">🚆 VoyageRail Fare Desk</h1>
    <p style="margin-top:0.3rem;font-size:1.05rem;">Quote a fare from what the desk knows at booking time,
    see why it landed there, and see how it moves across the booking window.</p></div>""",
    unsafe_allow_html=True,
)

# ---------------- Form ----------------
with st.form("quote"):
    c1, c2, c3 = st.columns(3)
    with c1:
        origin = st.selectbox("Origin", origins, index=origins.index(p["origin"]))
        dests = sorted(r["destination"] for r in routes if r["origin"] == origin)
        destination = st.selectbox("Destination", dests, index=dests.index(p["destination"]) if p["destination"] in dests else 0)
        seat_class = st.selectbox("Seat class", cats["Seat_Class"], index=cats["Seat_Class"].index(p["seat_class"]))
    with c2:
        booking_channel = st.selectbox("Channel", cats["Booking_Channel"], index=cats["Booking_Channel"].index(p["booking_channel"]))
        customer_segment = st.selectbox("Customer segment", cats["Customer_Segment"],
                                        index=cats["Customer_Segment"].index(p["customer_segment"]))
        loyalty_status = st.selectbox("Loyalty tier", cats["Loyalty_Status"], index=cats["Loyalty_Status"].index(p["loyalty_status"]))
    with c3:
        days_before_travel = st.slider("Days before travel", 0, 89, int(p["days_before_travel"]))
        demand_index = st.slider("Demand forecast", float(d_lo), float(d_hi), float(min(max(p["demand_index"], d_lo), d_hi)), 0.01)
    submitted = st.form_submit_button("Quote fare", use_container_width=True)

payload = {"origin": origin, "destination": destination, "seat_class": seat_class, "booking_channel": booking_channel,
           "customer_segment": customer_segment, "loyalty_status": loyalty_status,
           "days_before_travel": days_before_travel, "demand_index": round(demand_index, 3)}

# ---------------- Result ----------------
if submitted:
    try:
        with st.spinner("Quoting..."):
            q = api_post(base_url, "/predict", payload)
            c = api_post(base_url, "/curve", payload)
    except requests.exceptions.HTTPError as e:
        st.error(f"API error: {e.response.text if e.response is not None else e}")
        st.stop()

    r1, r2, r3 = st.columns(3)
    r1.metric("Quoted fare", f"£{q['fare_gbp']:,.2f}")
    r2.metric("Linear baseline", f"£{q['baseline_fare_gbp']:,.2f}",
              delta=f"£{q['fare_gbp'] - q['baseline_fare_gbp']:+,.2f} from the model", delta_color="off")
    r3.metric("Fare band", q["fare_band"])

    tab1, tab2, tab3, tab4 = st.tabs(["📈 Price curve", "🔍 Why this fare", "🧾 API response", "🧪 cURL"])
    with tab1:
        curve = pd.DataFrame(c["points"]).set_index("days_before_travel")
        st.line_chart(curve.rename(columns={"fare_gbp": "gradient boosting", "baseline_fare_gbp": "linear baseline"}))
        st.caption("Predicted fare for the same booking at every lead time from 0 to 89 days.")
    with tab2:
        drivers = pd.DataFrame(q["drivers"]).set_index("feature")
        st.bar_chart(drivers["gbp"])
        st.caption(f"SHAP contributions in pounds. They start from £{q['base_value_gbp']:,.2f} and add up to the quoted fare.")
    with tab3:
        st.json(q)
    with tab4:
        st.code(f"""curl -X POST "{base_url.rstrip('/')}/predict" \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(payload)}'""", language="bash")
