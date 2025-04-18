import axios from 'axios';
import { OCR_SERVICE_URL, CATEGORIZATION_MODEL_URL, INSIGHTS_GENERATOR_URL } from '../config';

export const scanReceipt = async (imageFile) => {
  const formData = new FormData();
  formData.append('receipt', imageFile);
  
  try {
    const response = await axios.post(`${OCR_SERVICE_URL}/scan-receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning receipt:', error);
    throw error;
  }
};

export const categorizeExpense = async (merchantName, itemDescription = '') => {
  try {
    const response = await axios.post(CATEGORIZATION_MODEL_URL, {
      merchant_name: merchantName,
      item_description: itemDescription,
    });
    return response.data;
  } catch (error) {
    console.error('Error categorizing expense:', error);
    throw error;
  }
};

export const generateInsights = async (spendingData) => {
  try {
    const response = await axios.post(INSIGHTS_GENERATOR_URL, {
      spending_data: spendingData,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

export const answerSpendingQuestion = async (spendingData, question) => {
  try {
    const response = await axios.post(`${INSIGHTS_GENERATOR_URL}/answer`, {
      spending_data: spendingData,
      question: question,
    });
    return response.data;
  } catch (error) {
    console.error('Error answering spending question:', error);
    throw error;
  }
}; 