"""Flask API server for the Handwritten Digit Recognizer."""
from flask import Flask, request, jsonify, render_template
from train_model import predict_digit

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    pixels = data.get("pixels")
    if pixels is None:
        return jsonify({"error": "No pixel data provided"}), 400
    result = predict_digit(pixels)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
