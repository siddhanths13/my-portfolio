"""
Handwritten Digit Recognizer - CNN training script
Trains a Convolutional Neural Network on the MNIST dataset
and saves the trained model to digit_model.keras
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

def load_data():
    """Load and preprocess MNIST dataset."""
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
    # Normalize pixel values to [0, 1]
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0
    # Reshape to (28, 28, 1) for CNN input
    x_train = x_train.reshape(-1, 28, 28, 1)
    x_test = x_test.reshape(-1, 28, 28, 1)
    return (x_train, y_train), (x_test, y_test)

def build_model():
    """Build the CNN architecture."""
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation="relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation="relu"),
        layers.Flatten(),
        layers.Dense(64, activation="relu"),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax")
    ])
    return model

def train():
    """Train and evaluate the CNN."""
    (x_train, y_train), (x_test, y_test) = load_data()

    model = build_model()
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    print("Training CNN on MNIST...")
    model.fit(
        x_train, y_train,
        epochs=5,
        batch_size=128,
        validation_split=0.1
    )

    test_loss, test_acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"\nTest accuracy: {test_acc:.4f}")

    model.save("digit_model.keras")
    print("Model saved to digit_model.keras")

def predict_digit(image_array):
    """Predict a digit from a 28x28 grayscale image array."""
    model = models.load_model("digit_model.keras")
    img = np.array(image_array, dtype="float32") / 255.0
    img = img.reshape(1, 28, 28, 1)
    probs = model.predict(img, verbose=0)[0]
    pred = int(np.argmax(probs))
    confidence = float(probs[pred])
    return {
        "prediction": pred,
        "confidence": round(confidence, 4),
        "probabilities": [round(float(p), 4) for p in probs]
    }

if __name__ == "__main__":
    train()
