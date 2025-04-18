import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabaseClient';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spendingData, setSpendingData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const navigate = useNavigate();

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
          total_amount,
          receipt_items (
            description,
            total_price,
            category_id
          )
        `)
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (receiptsError) throw receiptsError;

      // Process spending data
      let total = 0;
      const categoryTotals = {};

      receipts.forEach(receipt => {
        total += parseFloat(receipt.total_amount);
        receipt.receipt_items.forEach(item => {
          const category = item.category_id;
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
          }
          categoryTotals[category] += parseFloat(item.total_price);
        });
      });

      // Convert category totals to array for chart
      const breakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
      }));

      setTotalSpent(total);
      setCategoryBreakdown(breakdown);
      setSpendingData(receipts);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Total Spending Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Spent (Last 30 Days)
                </Typography>
                <Typography variant="h4">
                  ${totalSpent.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Number of Receipts Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Number of Receipts
                </Typography>
                <Typography variant="h4">
                  {spendingData.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Average Daily Spending Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Daily Spending
                </Typography>
                <Typography variant="h4">
                  ${(totalSpent / 30).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#2196f3" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {spendingData.slice(0, 5).map((receipt) => (
                <Box key={receipt.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1">
                        {receipt.merchant_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(receipt.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1" align="right">
                        ${parseFloat(receipt.total_amount).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard; 