"""Flask API server for the Password Strength Checker."""
from flask import Flask, request, jsonify, render_template
from train_model import predict

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict_route():
    data = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "No password provided"}), 400
    result = predict(password)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
