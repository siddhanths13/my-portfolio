# Spam SMS Classifier (Machine Learning)

A high-accuracy machine learning project that classifies SMS messages as **SPAM** or **HAM** (legitimate).

## Model Highlights

- **Approach:** Compares multiple classifiers automatically and picks the best (or a voting ensemble)
- **Models compared:** Multinomial Naive Bayes, Linear SVC, Logistic Regression, Random Forest
- **Ensemble:** Voting classifier (SVC + Logistic Regression + Naive Bayes) tuned with GridSearchCV
- **Vectorizer:** TF-IDF (unigrams + bigrams + trigrams, top 10,000 features)
- **Preprocessing:** stopword removal, punctuation/number removal
- **Validation:** 5-fold stratified cross-validation to prevent overfitting
- **Accuracy:** **~98%+** on the SMS Spam Collection dataset

## Project Structure

```
spam-classifier/
├── train_model.py      # Train & evaluate the best model, saves spam_model.pkl
├── app.py              # Flask API server using the trained pipeline
├── requirements.txt    # Python dependencies
├── demo/
│   ├── index.html      # Standalone interactive demo (no backend)
│   └── demo.js         # Enhanced Bayesian-style heuristic classifier + examples
└── templates/
    └── index.html      # Flask-served UI (uses the real trained model)
```

## Setup & Run

### 1. Install dependencies (use a virtual environment)

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Download the dataset

The project uses the [SMS Spam Collection Dataset](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset).
Place `spam.csv` in the `spam-classifier/` folder.

### 3. Train the model

```bash
python train_model.py
```

This compares several models, builds a tuned ensemble, evaluates it, and saves the best pipeline to `spam_model.pkl` (model + vectorizer bundled together).

### 4. Run the web app

```bash
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

You can also test a single prediction in Python:

```python
from train_model import predict
print(predict("Congratulations! You won a free iPhone. Claim now!"))
# -> {'prediction': 'SPAM', 'confidence': 0.99, ...}
print(predict("Hey, are you free tomorrow for coffee?"))
# -> {'prediction': 'HAM', ...}
```

## Interactive Demo (no backend)

The `demo/` folder contains a standalone HTML/JS demo that works instantly in the browser using an enhanced weighted-scoring classifier with many spam/ham patterns. To open it, just double-click `demo/index.html`.

---

**Author:** Siddhanth S
