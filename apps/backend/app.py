import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow CORS requests from web frontend (http://localhost:3000)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Flask backend is running smoothly!"
    })

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({
        "message": "Hello from the Flask backend!"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    print(f"🚀 Starting Flask server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
