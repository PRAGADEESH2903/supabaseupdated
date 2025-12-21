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
# HEALTH CHECK
# =====================================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

# =====================================================
# CUSTOMERS (FIXES "Failed to load customers")
# =====================================================
@app.route("/api/customers", methods=["GET"])
def list_customers():
    try:
        customers = execute(
            sb().table(TABLE_CUSTOMERS).select("*")
        )
        return jsonify(customers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =====================================================
# DASHBOARD APIs
# =====================================================
@app.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary():
    purchases = execute(
        sb().table(TABLE_PURCHASES).select("id, delivery_date")
    )
    services = execute(
        sb().table(TABLE_SERVICES).select("status")
    )
    dealers = execute(
        sb().table(TABLE_SUB_DEALERS).select("id")
    )

    return jsonify({
        "totalVehiclesSold": len(purchases),
        "totalRevenue": len(purchases),
        "pendingDeliveries": sum(1 for p in purchases if not p.get("delivery_date")),
        "activeSubDealers": len(dealers),
        "pendingMaintenance": sum(
            1 for s in services if s.get("status") != "Completed"
        )
    })

@app.route("/api/dashboard/inventory", methods=["GET"])
def dashboard_inventory():
    vehicles = execute(
        sb().table(TABLE_VEHICLES).select("id")
    )
    return jsonify({"totalVehiclesInStock": len(vehicles)})

@app.route("/api/dashboard/bookings", methods=["GET"])
def dashboard_bookings():
    purchases = execute(
        sb().table(TABLE_PURCHASES).select("purchase_date")
    )

    today = datetime.utcnow().date()

    def within(days, d):
        if not d:
            return False
        return datetime.fromisoformat(d).date() >= today - timedelta(days=days)

    return jsonify({
        "daily": sum(1 for p in purchases if p.get("purchase_date") == today.isoformat()),
        "weekly": sum(1 for p in purchases if within(7, p.get("purchase_date"))),
        "monthly": sum(1 for p in purchases if within(30, p.get("purchase_date")))
    })

@app.route("/api/dashboard/service-status", methods=["GET"])
def dashboard_service_status():
    services = execute(
        sb().table(TABLE_SERVICES).select("status")
    )

    result = {"Pending": 0, "In Progress": 0, "Completed": 0}
    for s in services:
        status = s.get("status") or "Pending"
        if status not in result:
            status = "Pending"
        result[status] += 1

    return jsonify(result)

@app.route("/api/dashboard/alerts", methods=["GET"])
def dashboard_alerts():
    vehicles = execute(
        sb().table(TABLE_VEHICLES).select("created_at")
    )

    threshold = datetime.utcnow() - timedelta(days=60)
    unsold = 0

    for v in vehicles:
        if v.get("created_at"):
            created = datetime.fromisoformat(v["created_at"].replace("Z", ""))
            if created < threshold:
                unsold += 1

    return jsonify({"unsoldOver60Days": unsold})

# =====================================================
# GLOBAL SEARCH
# =====================================================
@app.route("/api/search", methods=["GET"])
def global_search():
    q = (request.args.get("q") or "").strip()

    if len(q) < 2:
        return jsonify({"customers": [], "vehicles": [], "dealers": []})

    customers = execute(
        sb().table(TABLE_CUSTOMERS)
        .select("id, name")
        .ilike("name", f"%{q}%")
    )

    vehicles = execute(
        sb().table(TABLE_VEHICLES)
        .select("id, name, model")
        .or_(f"name.ilike.%{q}%,model.ilike.%{q}%")
    )

    dealers = execute(
        sb().table(TABLE_SUB_DEALERS)
        .select("id, name")
        .ilike("name", f"%{q}%")
    )

    return jsonify({
        "customers": customers,
        "vehicles": vehicles,
        "dealers": dealers
    })

# =====================================================
# CUSTOMER → VEHICLE → SERVICE DETAILS
# =====================================================
@app.route("/api/customers/<int:customer_id>/full-details", methods=["GET"])
def customer_full_details(customer_id):
    try:
        customers = execute(
            sb().table(TABLE_CUSTOMERS)
            .select("id, name, contact, email")
            .eq("id", customer_id)
        )

        if not customers:
            return jsonify({"error": "Customer not found"}), 404

        customer = customers[0]
        owner_name = customer["name"]

        purchases = execute(
            sb().table(TABLE_PURCHASES)
            .select("vehicle_id")
            .eq("owner_name", owner_name)
        )

        vehicle_ids = [p["vehicle_id"] for p in purchases if p.get("vehicle_id")]

        vehicles = []
        if vehicle_ids:
            vehicles = execute(
                sb().table(TABLE_VEHICLES)
                .select("id, name, model, engine_no")
                .in_("id", vehicle_ids)
            )

            for v in vehicles:
                services = execute(
                    sb().table(TABLE_SERVICES)
                    .select("id, service_count, status, service_type, date")
                    .eq("vehicle_id", v["id"])
                )
                v["services"] = services

        return jsonify({
            "customer": customer,
            "vehicles": vehicles
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =====================================================
# BASIC ENDPOINTS FOR FORMS
# =====================================================
@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    return jsonify(execute(sb().table(TABLE_VEHICLES).select("*")))

@app.route("/api/sub-dealers", methods=["GET"])
def list_sub_dealers():
    return jsonify(execute(sb().table(TABLE_SUB_DEALERS).select("*")))

@app.route("/api/purchases", methods=["POST"])
def create_purchase():
    payload = request.get_json(silent=True) or {}

    payload["purchase_date"] = parse_date(payload.get("purchase_date"))
    payload["delivery_date"] = parse_date(payload.get("delivery_date"))
    payload["insurance_start"] = parse_date(payload.get("insurance_start"))
    payload["insurance_end"] = parse_date(payload.get("insurance_end"))

    execute(sb().table(TABLE_PURCHASES).insert(payload))
    return jsonify({"message": "Purchase created"}), 201

# =====================================================
# EMAIL TEST
# =====================================================
@app.route("/api/send-insurance-test/<email>", methods=["GET"])
def send_insurance_test(email):
    send_email(
        email,
        "Insurance Expiry Reminder",
        "Your vehicle insurance will expire soon."
    )
    return jsonify({"message": "Email sent"}), 200

# =====================================================
# RUN SERVER
# =====================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=get_backend_port(),
        debug=True
    )
