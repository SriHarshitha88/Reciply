import React, { useState } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Grid,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { scanReceipt, categorizeExpense } from '../services/api';
import { supabase } from '../lib/supabaseClient';

function ReceiptScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [categories, setCategories] = useState({});

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Scan receipt with OCR
      const scanResult = await scanReceipt(selectedFile);
      setExtractedData(scanResult.extractedData);

      // Step 2: Categorize each item
      const categorizedItems = await Promise.all(
        scanResult.extractedData.items.map(async (item) => {
          const categoryResult = await categorizeExpense(
            scanResult.extractedData.merchantName,
            item.description
          );
          return {
            ...item,
            category: categoryResult[0].category,
            confidence: categoryResult[0].confidence,
          };
        })
      );

      setCategories(categorizedItems);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData || !categories) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Save receipt data to Supabase
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          merchant_name: extractedData.merchantName,
          date: extractedData.date,
          total_amount: extractedData.totalAmount,
          processed_text: extractedData.text,
          status: 'processed',
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Save receipt items
      const itemsToInsert = categories.map((item) => ({
        receipt_id: receipt.id,
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.amount,
        total_price: item.amount,
        category_id: item.category,
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Show success message or redirect
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Scan Receipt
        </Typography>

        <Box sx={{ mt: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="receipt-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="receipt-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCamera />}
            >
              Select Receipt Image
            </Button>
          </label>

          {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <img
                src={previewUrl}
                alt="Receipt preview"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleScan}
              disabled={!selectedFile || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Scan Receipt'}
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {extractedData && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Extracted Data
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Merchant Name"
                    value={extractedData.merchantName}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    value={extractedData.date}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    value={extractedData.totalAmount}
                    disabled
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Items
              </Typography>
              {categories.map((item, index) => (
                <Box key={index} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={item.description}
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Amount"
                    value={item.amount}
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Category"
                    value={`${item.category} (${(item.confidence * 100).toFixed(2)}% confidence)`}
                    disabled
                  />
                </Box>
              ))}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Save Receipt
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default ReceiptScanner; 