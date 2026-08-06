"""
Spam SMS Classifier (High Accuracy)
====================================
A machine learning project that classifies SMS messages as SPAM or HAM.

This version uses a much stronger pipeline to maximize accuracy:
  - Advanced text preprocessing (stopword removal, stemming, binary weights)
  - Multiple candidate models compared automatically
  - Ensemble (Voting) of the best models
  - GridSearchCV for hyperparameter tuning
  - Cross-validation to avoid overfitting

Author: Siddhanth S
"""

import re
import string
import joblib

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
    GridSearchCV,
)
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

# ------------------------------------------------------------------
# 1. Load the dataset (SMS Spam Collection)
# ------------------------------------------------------------------
# https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
def load_data(path="spam.csv"):
    """Load the SMS Spam Collection dataset."""
    df = pd.read_csv(path, encoding="latin-1", usecols=[0, 1])
    df.columns = ["label", "message"]
    df["label"] = df["label"].map({"ham": 0, "spam": 1})
    return df


# ------------------------------------------------------------------
# 2. Advanced text cleaning
# ------------------------------------------------------------------
# Common English stopwords (lightweight, no extra dependency)
STOPWORDS = set(
    """i me my we us our you your yours he him his she her hers it its
    they them their what which who whom this that these those am is are
    was were be been being have has had having do does did doing a an
    the and but if or because as until while of at by for with about
    against between into through during before after above below to from
    up down in out on off over under again further then once here there
    when where why how all any both each few more most other some such
    no nor not only own same so than too very s t can will just don
    should now""".split()
)


def clean_text(text):
    """Lowercase, remove punctuation/numbers, strip stopwords & whitespace."""
    text = text.lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)
    text = re.sub(r"\d+", " ", text)  # remove numbers
    words = text.split()
    # remove stopwords and very short tokens
    words = [w for w in words if w not in STOPWORDS and len(w) > 1]
    return " ".join(words)


# ------------------------------------------------------------------
# 3. Build & evaluate the best model
# ------------------------------------------------------------------
def build_best_model(X_train, y_train):
    """Compare several classifiers and return the best-performing one."""
    # Base vectorizer shared across candidate pipelines
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),  # unigrams + bigrams + trigrams
        max_features=10000,
        sublinear_tf=True,
        binary=False,
        min_df=1,
    )

    # Candidate models
    models = {
        "MultinomialNB": MultinomialNB(),
        "LinearSVC": LinearSVC(class_weight="balanced"),
        "LogisticRegression": LogisticRegression(
            max_iter=2000, class_weight="balanced"
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200, n_jobs=-1, random_state=42
        ),
    }

    best_score = 0.0
    best_name = None
    best_model = None

    for name, model in models.items():
        pipeline = Pipeline([("tfidf", vectorizer), ("clf", model)])
        scores = cross_val_score(
            pipeline,
            X_train,
            y_train,
            cv=StratifiedKFold(5, shuffle=True, random_state=42),
            scoring="f1_macro",
            n_jobs=-1,
        )
        mean_f1 = scores.mean()
        print(f"  {name:20s} -> CV F1-macro: {mean_f1:.4f}")

        if mean_f1 > best_score:
            best_score = mean_f1
            best_name = name
            best_model = model

    print(f"\n  Best single model: {best_name} (CV F1-macro={best_score:.4f})")

    # Build an ensemble of the top models (Voting classifier)
    ensemble = VotingClassifier(
        estimators=[
            ("svc", LinearSVC(class_weight="balanced")),
            ("lr", LogisticRegression(max_iter=3000, class_weight="balanced")),
            ("nb", MultinomialNB()),
        ],
        voting="hard",
    )
    ensemble_pipeline = Pipeline([("tfidf", vectorizer), ("voting", ensemble)])

    # Tune the ensemble slightly with GridSearchCV
    print("\n  Tuning ensemble with GridSearchCV ...")
    param_grid = {
        "voting__voting": ["hard", "soft"],
        "tfidf__ngram_range": [(1, 2), (1, 3)],
    }
    grid = GridSearchCV(
        ensemble_pipeline,
        param_grid,
        cv=StratifiedKFold(5, shuffle=True, random_state=42),
        scoring="f1_macro",
        n_jobs=-1,
    )
    grid.fit(X_train, y_train)

    print(f"  Ensemble best params: {grid.best_params_}")
    print(f"  Ensemble best CV F1-macro: {grid.best_score_:.4f}")

    # Pick whichever scores higher: best single or ensemble
    if grid.best_score_ > best_score:
        print(f"\n  >>> Using ENSEMBLE model (F1-macro > best single)")
        return grid.best_estimator_, "Voting Ensemble"
    else:
        # Rebuild best single as a pipeline
        best_pipeline = Pipeline([("tfidf", vectorizer), ("clf", best_model)])
        best_pipeline.fit(X_train, y_train)
        print(f"\n  >>> Using best single model: {best_name}")
        return best_pipeline, best_name


# ------------------------------------------------------------------
# 4. Main training pipeline
# ------------------------------------------------------------------
def main():
    print("Loading dataset...")
    df = load_data("spam.csv")
    print(f"Dataset shape: {df.shape}")
    print(f"Label distribution:\n{df['label'].value_counts()}")

    # Clean messages
    df["clean"] = df["message"].apply(clean_text)

    X = df["clean"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nBuilding & comparing models...")
    best_pipeline, chosen = build_best_model(X_train, y_train)

    # Final evaluation on held-out test set
    y_pred = best_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")

    print("\n" + "=" * 60)
    print(f"Chosen model: {chosen}")
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test F1-macro: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["HAM", "SPAM"]))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("=" * 60)

    # Save the best pipeline (vectorizer + model together)
    joblib.dump(best_pipeline, "spam_model.pkl")
    print("\nSaved full pipeline -> spam_model.pkl")
    print("(Model + vectorizer are bundled in one file for easy deployment)")


def predict(text: str) -> dict:
    """Load the saved pipeline and predict a single message."""
    pipeline = joblib.load("spam_model.pkl")

    clean = clean_text(text)
    proba = pipeline.predict_proba([clean]) if hasattr(
        pipeline, "predict_proba"
    ) else None

    if proba is not None:
        label = "SPAM" if proba[0][1] > 0.5 else "HAM"
        spam_prob = proba[0][1]
        confidence = max(proba[0])
    else:
        pred = pipeline.predict([clean])[0]
        label = "SPAM" if pred == 1 else "HAM"
        spam_prob = float(pred)
        confidence = float(pred)

    return {
        "message": text,
        "prediction": label,
        "confidence": round(float(confidence), 4),
        "spam_probability": round(float(spam_prob), 4),
    }


if __name__ == "__main__":
    main()
