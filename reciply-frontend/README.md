# Reciply - AI-Powered Receipt Scanner and Expense Tracker

Reciply is a modern web application that uses AI to scan receipts, categorize expenses, and provide insights into your spending habits.

## Features

- 📸 Receipt scanning with OCR
- 🤖 AI-powered expense categorization
- 📊 Spending insights and analytics
- 💬 Natural language queries about your spending
- 🔒 Secure user authentication
- 📱 Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account
- Hugging Face account with deployed spaces

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reciply.git
   cd reciply/reciply-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OCR_SERVICE_URL=your_ocr_service_url
   REACT_APP_CATEGORIZATION_MODEL_URL=your_categorization_model_url
   REACT_APP_INSIGHTS_GENERATOR_URL=your_insights_generator_url
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
reciply-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── lib/          # Utility functions and configurations
│   ├── App.js        # Main application component
│   └── index.js      # Application entry point
├── public/           # Static assets
└── package.json      # Project dependencies and scripts
```

## API Integration

The application integrates with several services:

1. **Supabase**: Database and authentication
2. **OCR Service**: Receipt scanning and text extraction
3. **Hugging Face Spaces**:
   - Categorization model for expense classification
   - Insights generator for spending analysis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 