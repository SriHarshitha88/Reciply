# Reciply - AI-Powered Receipt Scanner & Expense Manager

Reciply is an intelligent receipt scanning and expense management application that leverages cutting-edge AI technologies to automate expense tracking and provide personalized financial insights.

## Features

- 📸 Advanced OCR with custom CNN architecture for receipt text extraction
- 🤖 Transformer-based NLP for smart expense categorization
- 💡 Generative AI for personalized spending insights
- 🗣️ Natural language interface for expense queries
- 🔒 Privacy-focused on-device processing
- 📱 Cross-platform mobile app (iOS/Android)

## Architecture

```
reciply/
├── backend/                 # FastAPI backend with TensorFlow Serving
├── mobile/                  # React Native mobile app
├── ml/                      # Machine Learning models and training
│   ├── vision/             # Computer vision and OCR models
│   ├── nlp/                # NLP and categorization models
│   └── genai/              # Generative AI components
├── data/                    # Data processing and augmentation
└── docs/                    # Documentation and API specs
```

## Technology Stack

- **Backend**: FastAPI, TensorFlow Serving, PostgreSQL
- **Mobile**: React Native, Expo
- **ML/AI**: TensorFlow, PyTorch, Hugging Face Transformers
- **Computer Vision**: OpenCV, Tesseract
- **DevOps**: Docker, GitHub Actions, AWS

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker
- TensorFlow 2.12+
- React Native development environment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reciply.git
cd reciply
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the mobile app:
```bash
cd mobile
npm install
```

4. Start the development servers:
```bash
# Backend
cd backend
uvicorn main:app --reload

# Mobile
cd mobile
npm start
```

## Development Status

This is an ongoing project with active development. Current focus areas:

- [ ] Improving OCR accuracy for low-quality images
- [ ] Enhancing expense categorization model
- [ ] Implementing on-device processing
- [ ] Developing natural language query interface

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- TensorFlow team for the ML framework
- Hugging Face for transformer models
- OpenCV community for computer vision tools