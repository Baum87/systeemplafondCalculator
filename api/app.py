from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime 
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

print("\n" + "="*60)
print("SYSTEEMPLAFOND REKENMACHINE - BACKEND")
print("="*60)


# ============================================================================
# CONFIGURATIE
# ============================================================================

MATERIALS = {
    "600x600": {
        "naam": "600x600 systeem",
        "hoofdprofiel": 0.28,
        "tussenprofiel_1200": 1.39,
        "tussenprofiel_600": 1.39,
        "plafondplaat": 2.78,
        "hoeklijn": 1/3,
        "kantlat": 1/3,
    },
    "600x1200": {
        "naam": "600x1200 systeem",
        "hoofdprofiel": 0.28,
        "tussenprofiel_1200": 1.39,
        "plafondplaat": 1.39,
        "hoeklijn": 1/3,
        "kantlat": 1/3,
    }
}


# ============================================================================
# ROUTES
# ============================================================================

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        "message": "Systeemplafond Rekenmachine API",
        "version": "1.0",
        "status": "OK"
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "OK", "message": "Backend is running on port 8080"})


@app.route('/api/bereken', methods=['POST', 'OPTIONS'])
def bereken():
    """Calculate materials"""
    
    # Handle OPTIONS request (preflight)
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get data from request
        data = request.get_json()
        print(f"\n📥 Received data: {data}")
        
        if not data:
            return jsonify({"error": "No data received"}), 400
        
        # Extract values
        vierkante_meters = float(data.get('vierkante_meters', 0))
        strekkende_meters = float(data.get('strekkende_meters', 0))
        systeem = data.get('systeem', '')
        
        print(f"   vierkante_meters: {vierkante_meters}")
        print(f"   strekkende_meters: {strekkende_meters}")
        print(f"   systeem: {systeem}")
        
        # Validate
        if vierkante_meters <= 0 or strekkende_meters <= 0:
            return jsonify({"error": "Values must be > 0"}), 400
        
        if systeem not in MATERIALS:
            return jsonify({"error": f"Unknown system: {systeem}"}), 400
        
        # Get material factors
        mat = MATERIALS[systeem]
        
        # Calculate
        results = {
            "hoofdprofielen": math.ceil(vierkante_meters * mat["hoofdprofiel"]),
            "tussenprofiel_1200": math.ceil(vierkante_meters * mat["tussenprofiel_1200"]),
            "plafondplaten": math.ceil(vierkante_meters * mat["plafondplaat"]),
            "hoeklijn": math.ceil(strekkende_meters * mat["hoeklijn"]),
            "kantlat": math.ceil(strekkende_meters * mat["kantlat"]),
        }
        
        # Add tussenprofiel_600 only for 600x600
        if systeem == "600x600":
            results["tussenprofiel_600"] = math.ceil(vierkante_meters * mat["tussenprofiel_600"])
        
        print(f"\n📤 Sending response: {results}")
        return jsonify(results), 200
    
    except ValueError as e:
        print(f"✗ ValueError: {e}")
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except Exception as e:
        print(f"✗ Exception: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/api/bereken-afmetingen', methods=['POST', 'OPTIONS'])
def bereken_afmetingen():
    """Calculate m² from dimensions"""
    
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        lengte = float(data.get('lengte', 0))
        breedte = float(data.get('breedte', 0))
        
        if lengte <= 0 or breedte <= 0:
            return jsonify({"error": "Values must be > 0"}), 400
        
        vierkante_meters = lengte * breedte
        
        return jsonify({
            "vierkante_meters": vierkante_meters,
            "lengte": lengte,
            "breedte": breedte
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error"}), 500


@app.route('/api/keepalive', methods=['GET', 'POST', 'HEAD'])
def keepalive():
    """
    Keepalive endpoint voor cron-job.org
    Voorkomt dat Render app slaapt na 15 min inactiviteit.
    """
    return jsonify({
        "status": "OK",
        "message": "App is alive!",
        "timestamp": datetime.now().isoformat()
    }), 200


# ============================================================================
# START
# ============================================================================

if __name__ == '__main__':
    print("\n✓ CORS enabled")
    print("✓ Routes registered:")
    print("  - GET  /")
    print("  - GET  /api/health")
    print("  - POST /api/bereken")
    print("  - POST /api/bereken-afmetingen")
    print("\n" + "="*60)
    print("Starting server on http://localhost:8080")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=False,
        use_reloader=False
    )
