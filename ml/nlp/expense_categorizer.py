from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np

class ExpenseCategorizer:
    def __init__(self):
        self.model_name = "distilbert-base-uncased"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name,
            num_labels=10
        )
        self.categories = [
            "Food & Dining",
            "Shopping",
            "Transportation",
            "Entertainment",
            "Health & Medical",
            "Bills & Utilities",
            "Travel",
            "Education",
            "Personal Care",
            "Other"
        ]

    def preprocess_text(self, text):
        inputs = self.tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
        return inputs

    def predict(self, text):
        inputs = self.preprocess_text(text)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1)
            confidence = probabilities[0][predicted_class].item()
        
        return {
            "category": self.categories[predicted_class.item()],
            "confidence": confidence
        }

    def train(self, train_dataset, validation_dataset, epochs=3):
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=5e-5)
        for epoch in range(epochs):
            self.model.train()
            for batch in train_dataset:
                optimizer.zero_grad()
                outputs = self.model(**batch)
                loss = outputs.loss
                loss.backward()
                optimizer.step()

            self.model.eval()
            val_loss = 0
            for batch in validation_dataset:
                with torch.no_grad():
                    outputs = self.model(**batch)
                    val_loss += outputs.loss.item()
            print(f"Epoch {epoch+1}, Validation Loss: {val_loss/len(validation_dataset)}")

    def save_model(self, path):
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)

    def load_model(self, path):
        self.model = AutoModelForSequenceClassification.from_pretrained(path)
        self.tokenizer = AutoTokenizer.from_pretrained(path) 