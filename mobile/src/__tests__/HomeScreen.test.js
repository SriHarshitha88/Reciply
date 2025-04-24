import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import * as ImagePicker from 'expo-image-picker';
import secureProcessor from '../utils/secureProcessing';

// Mock the ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

// Mock the secure processor
jest.mock('../utils/secureProcessing', () => ({
  processReceiptLocally: jest.fn(),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Reciply')).toBeTruthy();
    expect(getByText('Smart Receipt Scanner')).toBeTruthy();
  });

  it('handles receipt scanning', async () => {
    const mockImageResult = {
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }],
    };

    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);
    secureProcessor.processReceiptLocally.mockResolvedValue({
      items: [],
      total: 0,
      merchant: 'Test Store',
      date: new Date().toISOString(),
      confidence: 0.95,
    });

    const { getByText } = render(<HomeScreen />);
    const scanButton = getByText('Scan Receipt');

    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(secureProcessor.processReceiptLocally).toHaveBeenCalledWith('mock-image-uri');
    });
  });

  it('handles canceled image picker', async () => {
    const mockImageResult = {
      canceled: true,
    };

    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);

    const { getByText } = render(<HomeScreen />);
    const scanButton = getByText('Scan Receipt');

    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(secureProcessor.processReceiptLocally).not.toHaveBeenCalled();
    });
  });

  it('displays loading state', async () => {
    const mockImageResult = {
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }],
    };

    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);
    secureProcessor.processReceiptLocally.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText } = render(<HomeScreen />);
    const scanButton = getByText('Scan Receipt');

    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(getByText('Processing...')).toBeTruthy();
    });
  });

  it('handles processing errors', async () => {
    const mockImageResult = {
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }],
    };

    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);
    secureProcessor.processReceiptLocally.mockRejectedValue(new Error('Processing failed'));

    const { getByText } = render(<HomeScreen />);
    const scanButton = getByText('Scan Receipt');

    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error processing receipt:', expect.any(Error));
    });
  });

  it('displays scanned receipts', async () => {
    const mockReceipt = {
      items: [],
      total: 29.99,
      merchant: 'Test Store',
      date: new Date().toISOString(),
      confidence: 0.95,
    };

    const mockImageResult = {
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }],
    };

    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);
    secureProcessor.processReceiptLocally.mockResolvedValue(mockReceipt);

    const { getByText } = render(<HomeScreen />);
    const scanButton = getByText('Scan Receipt');

    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(getByText('Test Store')).toBeTruthy();
      expect(getByText('Total: $29.99')).toBeTruthy();
    });
  });
}); 