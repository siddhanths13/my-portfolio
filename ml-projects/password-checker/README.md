# Password Strength Checker (Machine Learning)

A machine learning project that **classifies the strength of a password** as **WEAK, MEDIUM, or STRONG** based on its features.

## Model Highlights

- **Approach:** Multi-class classification (Weak / Medium / Strong)
- **Best model:** Random Forest Classifier (with feature engineering)
- **Features:** length, digit count, uppercase count, lowercase count, symbol count, unique-character ratio, consecutive/sequential patterns, common-password detection
- **Dataset:** Real-world breached password dataset (approx. 670,000 passwords labeled by strength)
- **Validation:** 5-fold stratified cross-validation
- **Accuracy:** **~90%+** on the held-out test set

## Project Structure

```
password-checker/
├── train_model.py      # Train & evaluate the classifier, saves password_model.pkl
├── app.py              # Flask API server using the trained model
├── requirements.txt    # Python dependencies
├── demo/
│   ├── index.html      # Standalone interactive demo (no backend)
│   └── demo.js         # Heuristic strength-scoring classifier + examples
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

The project uses the [Kaggle Password Strength dataset](https://www.kaggle.com/datasets/bhavikbb/password-strength-classifier-dataset).
Place `data.csv` (columns: `password`, `strength`) in the `password-checker/` folder.

### 3. Train the model

```bash
python train_model.py
```

This engineers features, trains a Random Forest, evaluates it, and saves the pipeline to `password_model.pkl` (model + feature names bundled together).

### 4. Run the web app

```bash
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

You can also test a single prediction in Python:

```python
from train_model import predict
print(predict("pass123"))
# -> {'prediction': 'WEAK', 'confidence': 0.95, ...}
print(predict("Tr0ub4dor&3!xK#p"))
# -> {'prediction': 'STRONG', ...}
```

## Interactive Demo (no backend)

The `demo/` folder contains a standalone HTML/JS demo that works instantly in the browser using an enhanced heuristic strength-scoring algorithm. To open it, just double-click `demo/index.html`.

---

**Author:** Siddhanth S
