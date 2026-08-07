"""
Password Strength Checker - ML training script
Trains a Random Forest classifier on password features
and saves the trained pipeline to password_model.pkl
"""
import re
import string
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "password1",
    "123456789", "111111", "1234567", "iloveyou", "admin", "welcome",
    "monkey", "dragon", "letmein", "baseball", "sunshine", "princess"
}

def extract_features(password):
    """Extract a feature vector from a password string."""
    if not isinstance(password, str):
        password = ""
    length = len(password)
    digits = sum(c.isdigit() for c in password)
    lower = sum(c.islower() for c in password)
    upper = sum(c.isupper() for c in password)
    symbols = sum(c in string.punctuation for c in password)
    unique_ratio = len(set(password)) / max(length, 1)

    # Sequential patterns (e.g. "abc", "123")
    sequential = 0
    for i in range(length - 2):
        if ord(password[i+1]) == ord(password[i]) + 1 and ord(password[i+2]) == ord(password[i+1]) + 1:
            sequential += 1
        elif ord(password[i+1]) == ord(password[i]) - 1 and ord(password[i+2]) == ord(password[i+1]) - 1:
            sequential += 1

    # Consecutive repeated chars (e.g. "aaa")
    repeated = sum(1 for i in range(length - 1) if password[i] == password[i+1])

    is_common = int(password.lower() in COMMON_PASSWORDS)

    return [
        length,
        digits,
        lower,
        upper,
        symbols,
        unique_ratio,
        sequential,
        repeated,
        is_common,
    ]

FEATURE_NAMES = [
    "length", "digits", "lower", "upper", "symbols",
    "unique_ratio", "sequential", "repeated", "is_common"
]

def load_and_prepare(csv_path="data.csv"):
    """Load dataset and build feature matrix."""
    df = pd.read_csv(csv_path)
    df = df.dropna()
    X = np.array([extract_features(p) for p in df["password"]])
    y = df["strength"].values  # 0=Weak, 1=Medium, 2=Strong
    return X, y

def train():
    """Train and evaluate the model."""
    X, y = load_and_prepare()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=30,
        random_state=42,
        n_jobs=-1
    )
    print("Training Random Forest...")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print(f"Test accuracy: {accuracy_score(y_test, preds):.4f}")
    print(classification_report(y_test, preds, target_names=["Weak", "Medium", "Strong"]))

    # Save pipeline
    with open("password_model.pkl", "wb") as f:
        pickle.dump({"model": model, "features": FEATURE_NAMES}, f)
    print("Model saved to password_model.pkl")

def predict(password):
    """Predict password strength (0=Weak, 1=Medium, 2=Strong)."""
    with open("password_model.pkl", "rb") as f:
        data = pickle.load(f)
    model = data["model"]
    X = np.array([extract_features(password)])
    probs = model.predict_proba(X)[0]
    pred = int(np.argmax(probs))
    labels = {0: "WEAK", 1: "MEDIUM", 2: "STRONG"}
    return {
        "prediction": labels[pred],
        "confidence": round(float(probs[pred]), 4),
        "score": pred + 1,
    }

if __name__ == "__main__":
    train()
