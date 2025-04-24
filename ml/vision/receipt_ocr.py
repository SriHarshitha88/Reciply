import tensorflow as tf
from tensorflow.keras import layers, models
import cv2
import numpy as np

class ReceiptOCR:
    def __init__(self):
        self.model = self._build_model()
        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

    def _build_model(self):
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(256, 256, 3)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dense(128, activation='relu'),
            layers.Dense(64, activation='relu'),
            layers.Dense(32, activation='relu'),
            layers.Dense(10, activation='softmax')
        ])
        return model

    def preprocess_image(self, image):
        image = cv2.resize(image, (256, 256))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image / 255.0
        return np.expand_dims(image, axis=0)

    def predict(self, image):
        processed_image = self.preprocess_image(image)
        prediction = self.model.predict(processed_image)
        return prediction

    def train(self, train_data, validation_data, epochs=10):
        self.model.fit(
            train_data,
            validation_data=validation_data,
            epochs=epochs
        )

    def save_model(self, path):
        self.model.save(path)

    def load_model(self, path):
        self.model = tf.keras.models.load_model(path) 