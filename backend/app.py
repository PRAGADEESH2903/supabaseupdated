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
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

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
@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Showroom backend running"})

@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({"status": "ok"})

# =====================================================
# CUSTOMERS
# =====================================================
@app.route("/api/customers", methods=["GET"])
def list_customers():
    return jsonify(execute(sb().table(TABLE_CUSTOMERS).select("*")))

@app.route("/api/customers", methods=["POST"])
def create_customer():
    payload = request.get_json(silent=True) or {}

    required = ["name", "contact_no", "email", "address", "city"]
    for r in required:
        if not payload.get(r):
            return jsonify({"error": f"{r} is required"}), 400

    execute(
        sb().table(TABLE_CUSTOMERS).insert({
            "name": payload["name"],
            "contact": payload["contact_no"],
            "email": payload["email"],
            "address": payload["address"],
            "city": payload["city"],
        })
    )

    return jsonify({"message": "Customer created"}), 201

# =====================================================
# VEHICLES
# =====================================================
@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    return jsonify(execute(sb().table(TABLE_VEHICLES).select("*")))

@app.route("/api/vehicles", methods=["POST"])
def create_vehicle():
    payload = request.get_json(silent=True) or {}

    payload["customer_id"] = int(payload["customer_id"])
    payload["year"] = int(payload["year"])
    payload["price"] = float(payload["price"])

    execute(sb().table(TABLE_VEHICLES).insert(payload))
    return jsonify({"message": "Vehicle added"}), 201

# =====================================================
# SUB DEALERS
# =====================================================
@app.route("/api/sub-dealers", methods=["GET"])
def list_sub_dealers():
    return jsonify(execute(sb().table(TABLE_SUB_DEALERS).select("*")))

@app.route("/api/sub-dealers", methods=["POST"])
def create_sub_dealer():
    payload = request.get_json(silent=True) or {}

    required = ["dealer_code", "name", "contact", "location"]
    for r in required:
        if not payload.get(r):
            return jsonify({"error": f"{r} is required"}), 400

    execute(
        sb().table(TABLE_SUB_DEALERS).insert({
            "dealer_code": payload["dealer_code"],
            "name": payload["name"],
            "contact": payload["contact"],
            "location": payload["location"],
        })
    )

    return jsonify({"message": "Sub dealer added"}), 201

# =====================================================
# PURCHASES (FIXED)
# =====================================================
@app.route("/api/purchases", methods=["POST"])
def create_purchase():
    try:
        payload = request.get_json(silent=True) or {}

        payload["vehicle_id"] = int(payload["vehicle_id"])
        payload["purchase_date"] = parse_date(payload.get("purchase_date"))
        payload["delivery_date"] = parse_date(payload.get("delivery_date"))

        if payload["payment_method"] == "loan":
            payload["insurance_start"] = parse_date(payload.get("insurance_start"))
            payload["insurance_end"] = parse_date(payload.get("insurance_end"))
        else:
            payload["insurance_start"] = payload["purchase_date"]
            payload["insurance_end"] = payload["purchase_date"]

        if payload.get("dealer_id"):
            payload["dealer_id"] = int(payload["dealer_id"])
        else:
            payload.pop("dealer_id", None)

        execute(sb().table(TABLE_PURCHASES).insert(payload))
        return jsonify({"message": "Purchase created"}), 201

    except Exception as e:
        print("PURCHASE ERROR:", e)
        return jsonify({"error": str(e)}), 500

# =====================================================
# SERVICES
# =====================================================
@app.route("/api/services", methods=["GET"])
def list_services():
    return jsonify(execute(sb().table(TABLE_SERVICES).select("*")))

@app.route("/api/services", methods=["POST"])
def create_service():
    payload = request.get_json(silent=True) or {}

    payload["vehicle_id"] = int(payload["vehicle_id"])
    payload["service_count"] = int(payload["service_count"])

    execute(sb().table(TABLE_SERVICES).insert(payload))
    return jsonify({"message": "Service added"}), 201

# =====================================================
# CUSTOMER → VEHICLE → SERVICE DETAILS
# =====================================================
@app.route("/api/customers/<int:customer_id>/full-details", methods=["GET"])
def customer_full_details(customer_id):
    customers = execute(
        sb().table(TABLE_CUSTOMERS)
        .select("id, name, contact, email")
        .eq("id", customer_id)
    )

    if not customers:
        return jsonify({"error": "Customer not found"}), 404

    customer = customers[0]

    purchases = execute(
        sb().table(TABLE_PURCHASES)
        .select("vehicle_id")
        .eq("owner_name", customer["name"])
    )

    vehicle_ids = [p["vehicle_id"] for p in purchases if p.get("vehicle_id")]

    vehicles = []
    if vehicle_ids:
        vehicles = execute(
            sb().table(TABLE_VEHICLES)
            .select("*")
            .in_("id", vehicle_ids)
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
        "vehicles": vehicles,
    })

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

    customers = execute(
        sb().table(TABLE_CUSTOMERS).select("id, name").ilike("name", f"%{q}%")
    )
    vehicles = execute(
        sb().table(TABLE_VEHICLES)
        .select("id, name, model")
        .or_(f"name.ilike.%{q}%,model.ilike.%{q}%")
    )
    dealers = execute(
        sb().table(TABLE_SUB_DEALERS).select("id, name").ilike("name", f"%{q}%")
    )

    return jsonify({
        "customers": customers,
        "vehicles": vehicles,
        "dealers": dealers,
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
# RUN
# =====================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=get_backend_port(),
        debug=True,
    )
