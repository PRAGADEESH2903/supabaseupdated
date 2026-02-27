from __future__ import annotations

from datetime import datetime
from typing import Optional

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client
from werkzeug.exceptions import HTTPException

from supabase_client import get_backend_port, get_supabase_client

# =====================================================
# APP INIT
# =====================================================
app = Flask(__name__)
CORS(app)

# =====================================================
# TABLE NAMES
# =====================================================
TABLE_CUSTOMERS = "customers"
TABLE_VEHICLES = "vehicles"
TABLE_SERVICES = "services"
TABLE_PURCHASES = "purchases"
TABLE_SUB_DEALERS = "sub_dealers"

# =====================================================
# SUPABASE HELPERS
# =====================================================
def sb() -> Client:
    return get_supabase_client()


def execute(query):
    try:
        response = query.execute()
        if hasattr(response, "error") and response.error:
            raise Exception(response.error.message)
        return response.data or []
    except Exception as e:
        print("SUPABASE ERROR:", str(e))
        raise Exception(str(e))


def parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
    except Exception:
        return None


def to_int(value):
    if value in [None, ""]:
        return None
    return int(value)


def to_float(value):
    if value in [None, ""]:
        return None
    return float(value)


# =====================================================
# ROOT
# =====================================================
@app.route("/")
def home():
    return jsonify({"message": "Showroom API is live"})


# =====================================================
# HEALTH
# =====================================================
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# =====================================================
# CUSTOMERS
# =====================================================
@app.route("/api/customers", methods=["GET", "POST"])
def customers():
    if request.method == "GET":
        return jsonify(
            execute(
                sb().table(TABLE_CUSTOMERS)
                .select("id,name,contact,email,address,city")
            )
        )

    data = request.get_json() or {}
    required = ["name", "contact", "email", "address", "city"]

    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    execute(sb().table(TABLE_CUSTOMERS).insert(data))
    return jsonify({"message": "Customer created"}), 201


# =====================================================
# VEHICLES
# =====================================================
@app.route("/api/vehicles", methods=["GET", "POST"])
def vehicles():
    if request.method == "GET":
        return jsonify(
            execute(
                sb().table(TABLE_VEHICLES)
                .select("*")
            )
        )

    data = request.get_json() or {}
    required = ["name", "model", "year", "engine_no", "price", "customer_id"]

    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    payload = {
        "name": data["name"],
        "model": data["model"],
        "year": to_int(data["year"]),
        "engine_no": data["engine_no"],
        "chassis_no": data.get("chassis_no"),
        "gearbox_no": data.get("gearbox_no"),
        "battery_no": data.get("battery_no"),
        "tire_front": data.get("tire_front"),
        "tire_rear_left": data.get("tire_rear_left"),
        "tire_rear_right": data.get("tire_rear_right"),
        "tire_stepney": data.get("tire_stepney"),
        "price": to_float(data["price"]),
        "customer_id": to_int(data["customer_id"]),
    }

    execute(sb().table(TABLE_VEHICLES).insert(payload))
    return jsonify({"message": "Vehicle added"}), 201


# =====================================================
# SUB DEALERS
# =====================================================
@app.route("/api/sub-dealers", methods=["GET", "POST"])
def sub_dealers():

    if request.method == "GET":
        return jsonify(
            execute(
                sb().table(TABLE_SUB_DEALERS)
                .select("*")
            )
        )

    data = request.get_json() or {}

    required = ["dealer_code", "name", "contact", "location"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    execute(
        sb().table(TABLE_SUB_DEALERS).insert({
            "dealer_code": data["dealer_code"],
            "name": data["name"],
            "contact": data["contact"],
            "location": data["location"],
        })
    )

    return jsonify({"message": "Dealer added"}), 201


# =====================================================
# PURCHASES
# =====================================================
@app.route("/api/purchases", methods=["GET", "POST"])
def purchases():

    if request.method == "GET":
        return jsonify(
            execute(
                sb().table(TABLE_PURCHASES).select("*")
            )
        )

    data = request.get_json() or {}

    required = ["vehicle_id", "payment_method", "owner_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    payload = {
        "vehicle_id": to_int(data.get("vehicle_id")),
        "payment_method": data.get("payment_method"),
        "owner_name": data.get("owner_name"),
        "delivery_address": data.get("delivery_address"),
        "purchase_date": parse_date(data.get("purchase_date")),
        "delivery_date": parse_date(data.get("delivery_date")),
        "insurance_start": parse_date(data.get("insurance_start")),
        "insurance_end": parse_date(data.get("insurance_end")),
        "dealer_id": to_int(data.get("dealer_id")),
    }

    if data.get("payment_method") == "loan":
        payload.update({
            "bank_name": data.get("bank_name") or None,
            "loan_amount": to_float(data.get("loan_amount")),
            "loan_tenure": to_int(data.get("loan_tenure")),
            "interest_rate": to_float(data.get("interest_rate")),
            "emi_amount": to_float(data.get("emi_amount")),
            "down_payment": to_float(data.get("down_payment")),
        })
    else:
        payload.update({
            "bank_name": None,
            "loan_amount": None,
            "loan_tenure": None,
            "interest_rate": None,
            "emi_amount": None,
            "down_payment": None,
        })

    execute(sb().table(TABLE_PURCHASES).insert(payload))
    return jsonify({"message": "Purchase created"}), 201


# =====================================================
# SERVICES
# =====================================================
@app.route("/api/services", methods=["GET", "POST"])
def services():

    if request.method == "GET":
        return jsonify(
            execute(
                sb().table(TABLE_SERVICES).select("*")
            )
        )

    data = request.get_json() or {}

    required = ["vehicle_id", "service_count"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    payload = {
        "vehicle_id": to_int(data.get("vehicle_id")),
        "service_count": to_int(data.get("service_count")),
        "status": data.get("status", "Pending"),
        "service_date": parse_date(data.get("service_date")),
        "remarks": data.get("remarks"),
    }

    execute(sb().table(TABLE_SERVICES).insert(payload))
    return jsonify({"message": "Service added"}), 201


# =====================================================
# SEARCH
# =====================================================
@app.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"customers": []})

    customers = execute(
        sb().table(TABLE_CUSTOMERS)
        .select("id,name,contact,email")
        .ilike("name", f"%{query}%")
    )

    return jsonify({"customers": customers})


# =====================================================
# CUSTOMER FULL DETAILS
# =====================================================
@app.route("/api/customers/<int:customer_id>/full-details", methods=["GET"])
def customer_full_details(customer_id):

    customer_list = execute(
        sb().table(TABLE_CUSTOMERS)
        .select("*")
        .eq("id", customer_id)
    )

    if not customer_list:
        return jsonify({"error": "Customer not found"}), 404

    customer = customer_list[0]

    vehicles = execute(
        sb().table(TABLE_VEHICLES)
        .select("*")
        .eq("customer_id", customer_id)
    )

    for v in vehicles:
        services = execute(
            sb().table(TABLE_SERVICES)
            .select("*")
            .eq("vehicle_id", v["id"])
        )
        v["services"] = services

    return jsonify({
        "customer": customer,
        "vehicles": vehicles
    })


# =====================================================
# ERROR HANDLER
# =====================================================
@app.errorhandler(Exception)
def handle_error(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code

    print("SERVER ERROR:", str(e))
    return jsonify({"error": str(e)}), 500


# =====================================================
# RUN
# =====================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=get_backend_port(),
        debug=False
    )
