from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client

from supabase_client import get_backend_port, get_supabase_client
from email_utils import send_email

# =====================================================
# APP INIT
# =====================================================
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

def execute(q):
    res = q.execute()
    if getattr(res, "error", None):
        raise RuntimeError(res.error.message)
    return res.data or []

def parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date().isoformat()

# =====================================================
# HEALTH
# =====================================================
@app.route("/api/health", methods=["GET"])
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
    data = request.get_json(silent=True) or {}

    required = ["name", "contact", "email", "address", "city"]
    for r in required:
        if not data.get(r):
            return jsonify({"error": f"{r} is required"}), 400

    execute(
        sb().table(TABLE_CUSTOMERS).insert({
            "name": data["name"],
            "contact": data["contact"],
            "email": data["email"],
            "address": data["address"],
            "city": data["city"],
        })
    )
    return jsonify({"message": "Customer created"}), 201

# =====================================================
# VEHICLES
# =====================================================
@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    return jsonify(
        execute(
            sb().table(TABLE_VEHICLES)
            .select("id,name,model")
        )
    )

@app.route("/api/vehicles", methods=["POST"])
def create_vehicle():
    data = request.get_json(silent=True) or {}

    payload = {
        "name": data["name"],
        "model": data["model"],
        "year": int(data["year"]),
        "engine_no": data["engine_no"],
        "chassis_no": data["chassis_no"],
        "gearbox_no": data["gearbox_no"],
        "battery_no": data["battery_no"],
        "tire_front": data["tire_front"],
        "tire_rear_left": data["tire_rear_left"],
        "tire_rear_right": data["tire_rear_right"],
        "tire_stepney": data["tire_stepney"],
        "price": float(data["price"]),
        "customer_id": int(data["customer_id"]),
    }

    execute(sb().table(TABLE_VEHICLES).insert(payload))
    return jsonify({"message": "Vehicle added"}), 201

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
    data = request.get_json(silent=True) or {}

    payload = {
        "vehicle_id": int(data["vehicle_id"]),
        "payment_method": data["payment_method"],
        "owner_name": data["owner_name"],
        "delivery_address": data["delivery_address"],
        "purchase_date": parse_date(data.get("purchase_date")),
        "delivery_date": parse_date(data.get("delivery_date")),
        "insurance_start": parse_date(data.get("insurance_start")),
        "insurance_end": parse_date(data.get("insurance_end")),
        "dealer_id": int(data["dealer_id"]) if data.get("dealer_id") else None,
        "bank_name": data.get("bank_name"),
        "loan_amount": data.get("loan_amount"),
        "loan_tenure": data.get("loan_tenure"),
        "interest_rate": data.get("interest_rate"),
        "emi_amount": data.get("emi_amount"),
        "down_payment": data.get("down_payment"),
    }

    execute(sb().table(TABLE_PURCHASES).insert(payload))
    return jsonify({"message": "Purchase created"}), 201

# =====================================================
# SERVICES
# =====================================================
@app.route("/api/services", methods=["GET"])
def list_services():
    return jsonify(execute(sb().table(TABLE_SERVICES).select("*")))

@app.route("/api/services", methods=["POST"])
def create_service():
    data = request.get_json(silent=True) or {}

    payload = {
        "vehicle_id": int(data["vehicle_id"]),
        "service_count": int(data["service_count"]),
        "status": data.get("status", "Pending"),
        "service_date": parse_date(data.get("service_date")),
        "remarks": data.get("remarks"),
    }

    execute(sb().table(TABLE_SERVICES).insert(payload))
    return jsonify({"message": "Service added"}), 201

# =====================================================
# CUSTOMER → VEHICLE → SERVICE DETAILS
# =====================================================
@app.route("/api/customers/<int:customer_id>/full-details", methods=["GET"])
def customer_full_details(customer_id):
    customers = execute(
        sb().table(TABLE_CUSTOMERS)
        .select("id,name,contact,email")
        .eq("id", customer_id)
    )

    if not customers:
        return jsonify({"error": "Customer not found"}), 404

    vehicles = execute(
        sb().table(TABLE_VEHICLES)
        .select("*")
        .eq("customer_id", customer_id)
    )

    for v in vehicles:
        v["services"] = execute(
            sb().table(TABLE_SERVICES)
            .select("*")
            .eq("vehicle_id", v["id"])
        )

    return jsonify({"customer": customers[0], "vehicles": vehicles})

# =====================================================
# DASHBOARD
# =====================================================
@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    purchases = execute(sb().table(TABLE_PURCHASES).select("id"))
    services = execute(sb().table(TABLE_SERVICES).select("status"))
    dealers = execute(sb().table(TABLE_SUB_DEALERS).select("id"))

    return jsonify({
        "totalVehiclesSold": len(purchases),
        "totalRevenue": len(purchases),
        "pendingDeliveries": 0,
        "activeSubDealers": len(dealers),
        "pendingMaintenance": sum(
            1 for s in services if s.get("status") != "Completed"
        ),
    })

@app.route("/api/dashboard/inventory", methods=["GET"])
def dashboard_inventory():
    vehicles = execute(sb().table(TABLE_VEHICLES).select("id"))
    return jsonify({"totalVehiclesInStock": len(vehicles)})

@app.route("/api/dashboard/bookings", methods=["GET"])
def dashboard_bookings():
    purchases = execute(sb().table(TABLE_PURCHASES).select("purchase_date"))
    today = datetime.utcnow().date()

    def within(days, d):
        return d and datetime.fromisoformat(d).date() >= today - timedelta(days=days)

    return jsonify({
        "daily": sum(1 for p in purchases if p.get("purchase_date") == today.isoformat()),
        "weekly": sum(1 for p in purchases if within(7, p.get("purchase_date"))),
        "monthly": sum(1 for p in purchases if within(30, p.get("purchase_date"))),
    })

@app.route("/api/dashboard/service-status", methods=["GET"])
def dashboard_service_status():
    services = execute(sb().table(TABLE_SERVICES).select("status"))
    result = {"Pending": 0, "In Progress": 0, "Completed": 0}

    for s in services:
        status = s.get("status") or "Pending"
        if status not in result:
            status = "Pending"
        result[status] += 1

    return jsonify(result)

@app.route("/api/dashboard/alerts", methods=["GET"])
def dashboard_alerts():
    vehicles = execute(sb().table(TABLE_VEHICLES).select("created_at"))
    threshold = datetime.utcnow() - timedelta(days=60)

    unsold = sum(
        1 for v in vehicles
        if v.get("created_at") and
        datetime.fromisoformat(v["created_at"].replace("Z", "")) < threshold
    )

    return jsonify({"unsoldOver60Days": unsold})

# =====================================================
# SEARCH
# =====================================================
@app.route("/api/search", methods=["GET"])
def global_search():
    q = (request.args.get("q") or "").strip()

    if len(q) < 2:
        return jsonify({"customers": [], "vehicles": [], "dealers": []})

    return jsonify({
        "customers": execute(
            sb().table(TABLE_CUSTOMERS)
            .select("id,name")
            .ilike("name", f"%{q}%")
        ),
        "vehicles": execute(
            sb().table(TABLE_VEHICLES)
            .select("id,name,model")
            .or_(f"name.ilike.%{q}%,model.ilike.%{q}%")
        ),
        "dealers": execute(
            sb().table(TABLE_SUB_DEALERS)
            .select("id,name")
            .ilike("name", f"%{q}%")
        ),
    })

# =====================================================
# EMAIL
# =====================================================
@app.route("/api/send-insurance-test/<email>", methods=["GET"])
def send_insurance_test(email):
    send_email(
        email,
        "Insurance Expiry Reminder",
        "Your vehicle insurance will expire soon."
    )
    return jsonify({"message": "Email sent"})

# =====================================================
# ERROR HANDLER
# =====================================================
@app.errorhandler(Exception)
def handle_error(e):
    print("SERVER ERROR:", e)
    return jsonify({"error": str(e)}), 500

# =====================================================
# RUN
# =====================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=get_backend_port(),
        debug=True,
    )
