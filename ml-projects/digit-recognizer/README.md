# Handwritten Digit Recognizer (Machine Learning)

A computer vision project that recognizes handwritten digits (0-9) using a **Convolutional Neural Network (CNN)** trained on the MNIST dataset.

## Model Highlights

- **Approach:** Deep learning with a Convolutional Neural Network (CNN)
- **Dataset:** MNIST - 70,000 labeled 28x28 grayscale handwritten digit images
- **Architecture:** Conv2D + MaxPooling + Dropout + Dense layers
- **Activation:** ReLU for hidden layers, Softmax for output (10 classes)
- **Optimizer:** Adam with sparse categorical cross-entropy loss
- **Accuracy:** **~99%** on the MNIST test set
- **Preprocessing:** Normalization (pixel / 255.0) + reshaping to (28, 28, 1)

## Project Structure

```
digit-recognizer/
├── train_model.py      # Train & evaluate the CNN, saves digit_model.keras
├── app.py              # Flask API server using the trained model
├── requirements.txt    # Python dependencies
├── demo/
│   ├── index.html      # Interactive drawing canvas demo (no backend)
│   └── demo.js         # Simple pixel-density heuristic classifier + examples
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

### 2. Train the model

```bash
python train_model.py
```

This downloads the MNIST dataset, trains the CNN, evaluates it, and saves the model to `digit_model.keras`.

### 3. Run the web app

```bash
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

You can also test a single prediction in Python:

```python
from train_model import predict_digit
# Provide a 28x28 grayscale image array
print(predict(image_array))
# -> {'prediction': 3, 'confidence': 0.99, ...}
```

## Interactive Demo (no backend)

The `demo/` folder contains a standalone HTML/JS demo that works instantly in the browser. Draw a digit on the canvas and the demo predicts it using a pixel-density heuristic. To open it, just double-click `demo/index.html`.

---

**Author:** Siddhanth S
