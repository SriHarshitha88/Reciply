import axios from 'axios';
import { OCR_SERVICE_URL, CATEGORIZATION_MODEL_URL, INSIGHTS_GENERATOR_URL } from '../config';

// OCR Service
export const scanReceipt = async (imageFile) => {
  const formData = new FormData();
  formData.append('receipt', imageFile);
  
  try {
    const response = await axios.post(`${OCR_SERVICE_URL}/scan-receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return {
        ...response.data,
        confidence: response.data.extractedData.overallConfidence
      };
    }
    throw new Error('Failed to process receipt');
  } catch (error) {
    console.error('Error scanning receipt:', error);
    throw error;
  }
};

// Categorization Model
export const categorizeExpense = async (merchantName, itemDescription = '') => {
  try {
    const response = await axios.post(CATEGORIZATION_MODEL_URL, {
      merchant_name: merchantName,
      item_description: itemDescription,
      model_version: 'transformer-v2',
      confidence_threshold: 0.85
    });
    
    if (response.data && response.data.categories) {
      return response.data.categories.map(cat => ({
        ...cat,
        confidence: parseFloat(cat.confidence),
        model_version: response.data.model_version
      }));
    }
    throw new Error('Invalid categorization response');
  } catch (error) {
    console.error('Error categorizing expense:', error);
    throw error;
  }
};

// Insights Generator
export const generateInsights = async (spendingData) => {
  try {
    const response = await axios.post(INSIGHTS_GENERATOR_URL, {
      spending_data: spendingData,
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
      include_visualization: true
    });
    
    if (response.data && response.data.insights) {
      return {
        text: response.data.insights,
        visualization: response.data.visualization,
        model_version: response.data.model_version
      };
    }
    throw new Error('Invalid insights response');
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

// Natural Language Query
export const answerSpendingQuestion = async (spendingData, question) => {
  try {
    const response = await axios.post(`${INSIGHTS_GENERATOR_URL}/answer`, {
      spending_data: spendingData,
      question: question,
      model: 'gpt-4',
      temperature: 0.5,
      max_tokens: 300,
      include_sources: true
    });
    
    if (response.data && response.data.answer) {
      return {
        answer: response.data.answer,
        sources: response.data.sources,
        confidence: response.data.confidence,
        model_version: response.data.model_version
      };
    }
    throw new Error('Invalid answer response');
  } catch (error) {
    console.error('Error answering spending question:', error);
    throw error;
  }
};

// Model Performance Metrics
export const getModelMetrics = async () => {
  try {
    const [ocrMetrics, catMetrics, insightsMetrics] = await Promise.all([
      axios.get(`${OCR_SERVICE_URL}/metrics`),
      axios.get(`${CATEGORIZATION_MODEL_URL}/metrics`),
      axios.get(`${INSIGHTS_GENERATOR_URL}/metrics`)
    ]);
    
    return {
      ocr: {
        accuracy: ocrMetrics.data.accuracy,
        processing_time: ocrMetrics.data.avg_processing_time,
        model_version: ocrMetrics.data.model_version
      },
      categorization: {
        accuracy: catMetrics.data.accuracy,
        categories: catMetrics.data.categories,
        model_version: catMetrics.data.model_version
      },
      insights: {
        accuracy: insightsMetrics.data.accuracy,
        response_time: insightsMetrics.data.avg_response_time,
        model_version: insightsMetrics.data.model_version
      }
    };
  } catch (error) {
    console.error('Error fetching model metrics:', error);
    throw error;
  }
}; 