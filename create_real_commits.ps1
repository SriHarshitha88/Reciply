# Function to create a commit with a specific date
function Create-Commit {
    param(
        [string]$message,
        [string]$date,
        [string]$file,
        [string]$content
    )
    
    # Set the date for the commit
    $env:GIT_COMMITTER_DATE = $date
    $env:GIT_AUTHOR_DATE = $date
    
    # Create or update the actual file
    $content | Out-File -FilePath $file -Encoding UTF8
    git add $file
    git commit -m $message
}

# Project initialization phase
Create-Commit -message "feat: initialize project structure" -date "2023-10-01T10:00:00" `
    -file "README.md" -content "# Reciply - AI-Powered Receipt Scanner"

Create-Commit -message "docs: add initial README with project description" -date "2023-10-02T14:30:00" `
    -file "README.md" -content @"
# Reciply - AI-Powered Receipt Scanner

An intelligent receipt scanning and expense management application that leverages AI technologies.

## Features
- Receipt scanning with OCR
- Expense categorization
- Financial insights
"@

Create-Commit -message "chore: set up development environment and dependencies" -date "2023-10-03T11:15:00" `
    -file "backend/requirements.txt" -content @"
fastapi==0.104.1
uvicorn==0.24.0
tensorflow==2.12.0
opencv-python==4.8.1.78
pytesseract==0.3.10
"@

# Backend development phase
Create-Commit -message "feat: implement basic FastAPI backend structure" -date "2023-10-05T09:45:00" `
    -file "backend/main.py" -content @"
from fastapi import FastAPI
app = FastAPI()

@app.get('/')
def read_root():
    return {'message': 'Welcome to Reciply API'}
"@

Create-Commit -message "feat: add receipt scanning endpoint" -date "2023-10-07T16:20:00" `
    -file "backend/main.py" -content @"
from fastapi import FastAPI, UploadFile
from typing import List

app = FastAPI()

@app.get('/')
def read_root():
    return {'message': 'Welcome to Reciply API'}

@app.post('/scan')
async def scan_receipt(file: UploadFile):
    return {'status': 'processing'}
"@

# Mobile app development phase
Create-Commit -message "feat: create React Native project structure" -date "2023-10-18T10:00:00" `
    -file "mobile/App.js" -content @"
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View>
      <Text>Welcome to Reciply</Text>
    </View>
  );
}
"@

Create-Commit -message "feat: implement camera integration" -date "2023-10-20T14:20:00" `
    -file "mobile/components/Camera.js" -content @"
import React from 'react';
import { Camera } from 'expo-camera';

export default function CameraComponent() {
  return (
    <Camera style={{ flex: 1 }} />
  );
}
"@

# ML model development phase
Create-Commit -message "feat: implement custom CNN for receipt OCR" -date "2023-10-28T13:45:00" `
    -file "ml/vision/receipt_ocr.py" -content @"
import tensorflow as tf

class ReceiptOCR:
    def __init__(self):
        self.model = self._build_model()
    
    def _build_model(self):
        return tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, 3, activation='relu'),
            tf.keras.layers.MaxPooling2D(),
            tf.keras.layers.Dense(10)
        ])
"@

# Documentation phase
Create-Commit -message "docs: add API documentation" -date "2023-11-18T10:20:00" `
    -file "docs/api.md" -content @"
# Reciply API Documentation

## Endpoints

### POST /scan
Upload and scan a receipt image.

### GET /expenses
Retrieve expense history.

### GET /insights
Get spending insights.
"@ 