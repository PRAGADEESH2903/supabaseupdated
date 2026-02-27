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
@app.route("/api/customers", methods=["GET"])
def list_customers():
    return jsonify(
        execute(
            sb().table(TABLE_CUSTOMERS)
            .select("id,name,contact,email,address,city")
        )
    )


@app.route("/api/customers", methods=["POST"])
def create_customer():
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
@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    return jsonify(
        execute(
            sb().table(TABLE_VEHICLES)
            .select("id,name,model,year,price,customer_id")
        )
    )


@app.route("/api/vehicles", methods=["POST"])
def create_vehicle():
    data = request.get_json() or {}

    required = ["name", "model", "year", "engine_no", "price", "customer_id"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    try:
        payload = {
            "name": data["name"],
            "model": data["model"],
            "year": int(data["year"]),
            "engine_no": data["engine_no"],
            "chassis_no": data.get("chassis_no"),
            "gearbox_no": data.get("gearbox_no"),
            "battery_no": data.get("battery_no"),
            "tire_front": data.get("tire_front"),
            "tire_rear_left": data.get("tire_rear_left"),
            "tire_rear_right": data.get("tire_rear_right"),
            "tire_stepney": data.get("tire_stepney"),
            "price": float(data["price"]),
            "customer_id": int(data["customer_id"]),
        }

        execute(sb().table(TABLE_VEHICLES).insert(payload))
        return jsonify({"message": "Vehicle added"}), 201

    except ValueError:
        return jsonify({"error": "Invalid numeric value"}), 400


# =====================================================
# SUB DEALERS
# =====================================================
@app.route("/api/sub-dealers", methods=["GET"])
def list_sub_dealers():
    return jsonify(
        execute(
            sb().table(TABLE_SUB_DEALERS)
            .select("id,name")
        )
    )


# =====================================================
# PURCHASES
# =====================================================
@app.route("/api/purchases", methods=["POST"])
def create_purchase():
    data = request.get_json() or {}

    required = ["vehicle_id", "payment_method", "owner_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    try:
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

    except ValueError:
        return jsonify({"error": "Invalid numeric value provided"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
# SERVICES
# =====================================================
@app.route("/api/services", methods=["GET"])
def list_services():
    return jsonify(
        execute(
            sb().table(TABLE_SERVICES).select("*")
        )
    )


@app.route("/api/services", methods=["POST"])
def create_service():
    data = request.get_json() or {}

    required = ["vehicle_id", "service_count"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    try:
        payload = {
            "vehicle_id": to_int(data.get("vehicle_id")),
            "service_count": to_int(data.get("service_count")),
            "status": data.get("status", "Pending"),
            "service_date": parse_date(data.get("service_date")),
            "remarks": data.get("remarks"),
        }

        execute(sb().table(TABLE_SERVICES).insert(payload))
        return jsonify({"message": "Service added"}), 201

    except ValueError:
        return jsonify({"error": "Invalid numeric value"}), 400


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
