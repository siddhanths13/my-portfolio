"""
Flask API server for the Spam SMS Classifier.
Serves the trained ML pipeline (spam_model.pkl).

Run:
    python app.py
Then open http://127.0.0.1:5000
"""

import os
import joblib
from flask import Flask, request, jsonify, render_template

from train_model import clean_text

app = Flask(__name__)

# Load the trained pipeline once on startup
MODEL_PATH = "spam_model.pkl"

pipeline = None

if os.path.exists(MODEL_PATH):
    pipeline = joblib.load(MODEL_PATH)
    print("Loaded trained model ✔")
else:
    print("Model file not found. Run train_model.py first to train the model.")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict_api():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    if pipeline is None:
        return (
            jsonify({"error": "Model not trained. Run train_model.py first."}),
            500,
        )

    text = data["message"]
    clean = clean_text(text)

    # Use predict_proba if available, otherwise fall back to predict
    if hasattr(pipeline, "predict_proba"):
        proba = pipeline.predict_proba([clean])[0]
        label = "SPAM" if proba[1] > 0.5 else "HAM"
        confidence = float(max(proba))
        spam_prob = float(proba[1])
    else:
        pred = pipeline.predict([clean])[0]
        label = "SPAM" if pred == 1 else "HAM"
        confidence = float(pred)
        spam_prob = float(pred)

    return jsonify(
        {
            "message": text,
            "prediction": label,
            "confidence": round(confidence, 4),
            "spam_probability": round(spam_prob, 4),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
