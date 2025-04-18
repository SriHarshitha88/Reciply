import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { generateInsights, answerSpendingQuestion } from '../services/api';
import { supabase } from '../lib/supabaseClient';

function Insights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [spendingData, setSpendingData] = useState(null);

  useEffect(() => {
    fetchSpendingData();
  }, []);

  const fetchSpendingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch receipts and items for the last 30 days
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select(`
          id,
          date,
          receipt_items (
            description,
            total_price,
            category_id
          )
        `)
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (receiptsError) throw receiptsError;

      // Process spending data by category
      const categorySpending = {};
      receipts.forEach(receipt => {
        receipt.receipt_items.forEach(item => {
          const category = item.category_id;
          if (!categorySpending[category]) {
            categorySpending[category] = 0;
          }
          categorySpending[category] += parseFloat(item.total_price);
        });
      });

      setSpendingData(categorySpending);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGenerateInsights = async () => {
    if (!spendingData) return;

    setLoading(true);
    setError(null);

    try {
      const insightsResult = await generateInsights(spendingData);
      setInsights(insightsResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!spendingData || !question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const answerResult = await answerSpendingQuestion(spendingData, question);
      setAnswer(answerResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Spending Insights
        </Typography>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateInsights}
            disabled={!spendingData || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Insights'}
          </Button>
        </Box>

        {insights && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI-Generated Insights
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {insights}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Ask Questions About Your Spending
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Your Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How much did I spend on groceries this month?"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleAskQuestion}
                disabled={!question.trim() || loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Ask Question'}
              </Button>
            </Grid>
          </Grid>

          {answer && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Answer
                </Typography>
                <Typography variant="body1">
                  {answer}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Insights; 