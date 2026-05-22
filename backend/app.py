"""
LitterBot Dashboard - Python Flask Backend
Wraps pylitterbot to expose a REST API consumed by the React frontend.
"""

import asyncio
import os
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from pylitterbot import Account

app = Flask(__name__)
CORS(app)  # Allow requests from React dev server

# ── CONFIGURE YOUR CREDENTIALS HERE ─────────────────────────────────────────
USERNAME = "your_email@example.com"   # <-- replace with your Whisker account email
PASSWORD = "your_password_here"        # <-- replace with your Whisker account password
# ─────────────────────────────────────────────────────────────────────────────


def run_async(coro):
    """Run an async coroutine synchronously (Flask is sync, pylitterbot is async)."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def get_litter_robot_5():
    """Authenticate and return the first Litter-Robot 5 found on the account."""
    account = Account()
    await account.connect(username=USERNAME, password=PASSWORD, load_robots=True)
    robots = account.robots
    await account.disconnect()
    return robots


@app.route("/api/robots", methods=["GET"])
def list_robots():
    """List all robots on the account (name, serial, model)."""
    try:
        robots = run_async(get_litter_robot_5())
        result = []
        for r in robots:
            result.append({
                "id": r.serial,
                "name": r.name,
                "model": getattr(r, "model", "Unknown"),
                "serial": r.serial,
            })
        return jsonify({"robots": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/robot/<serial>/status", methods=["GET"])
def robot_status(serial):
    """Get current status and weight data for a specific robot."""
    async def _fetch():
        account = Account()
        await account.connect(username=USERNAME, password=PASSWORD, load_robots=True)
        robot = next((r for r in account.robots if r.serial == serial), None)
        if robot is None:
            await account.disconnect()
            return None

        # Gather all available fields safely
        data = {
            "serial": robot.serial,
            "name": robot.name,
            "status": str(robot.status) if hasattr(robot, "status") else "Unknown",
            "status_code": robot.status_code if hasattr(robot, "status_code") else None,
            "is_sleeping": robot.is_sleeping if hasattr(robot, "is_sleeping") else False,
            "sleep_mode_enabled": robot.sleep_mode_enabled if hasattr(robot, "sleep_mode_enabled") else False,
            # Weight / cat data
            "last_seen": robot.last_seen.isoformat() if hasattr(robot, "last_seen") and robot.last_seen else None,
            "cat_weight": robot.cat_weight if hasattr(robot, "cat_weight") else None,
            "avg_cat_weight": robot.avg_cat_weight if hasattr(robot, "avg_cat_weight") else None,
            # Cycle counts
            "clean_cycle_count": robot.clean_cycle_count if hasattr(robot, "clean_cycle_count") else None,
            "waste_drawer_level": robot.waste_drawer_level if hasattr(robot, "waste_drawer_level") else None,
            "drawer_full_indicator_cycles": robot.drawer_full_indicator_cycles if hasattr(robot, "drawer_full_indicator_cycles") else None,
        }
        await account.disconnect()
        return data

    try:
        data = run_async(_fetch())
        if data is None:
            return jsonify({"error": "Robot not found"}), 404
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/robot/<serial>/activity", methods=["GET"])
def robot_activity(serial):
    """Get activity history for a specific robot."""
    async def _fetch():
        account = Account()
        await account.connect(username=USERNAME, password=PASSWORD, load_robots=True)
        robot = next((r for r in account.robots if r.serial == serial), None)
        if robot is None:
            await account.disconnect()
            return None

        history = []
        # pylitterbot exposes activity via get_activity_history()
        if hasattr(robot, "get_activity_history"):
            raw = await robot.get_activity_history(limit=50)
            for entry in raw:
                history.append({
                    "timestamp": entry.timestamp.isoformat() if hasattr(entry, "timestamp") else None,
                    "action": str(entry.action) if hasattr(entry, "action") else str(entry),
                    "action_value": entry.value if hasattr(entry, "value") else None,
                    "weight": entry.weight if hasattr(entry, "weight") else None,
                    "duration": entry.duration if hasattr(entry, "duration") else None,
                })

        await account.disconnect()
        return history

    try:
        history = run_async(_fetch())
        if history is None:
            return jsonify({"error": "Robot not found"}), 404
        return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/robot/<serial>/insights", methods=["GET"])
def robot_insights(serial):
    """Get weight insights / cat visit data."""
    async def _fetch():
        account = Account()
        await account.connect(username=USERNAME, password=PASSWORD, load_robots=True)
        robot = next((r for r in account.robots if r.serial == serial), None)
        if robot is None:
            await account.disconnect()
            return None

        insights = []
        if hasattr(robot, "get_insight"):
            raw = await robot.get_insight(days=30)
            for entry in raw:
                insights.append({
                    "date": entry.date.isoformat() if hasattr(entry, "date") else None,
                    "total_cycles": entry.total_cycles if hasattr(entry, "total_cycles") else None,
                    "average_weight": entry.average_weight if hasattr(entry, "average_weight") else None,
                    "min_weight": entry.min_weight if hasattr(entry, "min_weight") else None,
                    "max_weight": entry.max_weight if hasattr(entry, "max_weight") else None,
                })

        await account.disconnect()
        return insights

    try:
        insights = run_async(_fetch())
        if insights is None:
            return jsonify({"error": "Robot not found"}), 404
        return jsonify({"insights": insights})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
