import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

function BudgetSetup() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [spending, setSpending] = useState({});
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly',
  });

  useEffect(() => {
    fetchBudgets();
    fetchSpendingData();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBudgets(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpendingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get spending for the current period
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select(`
          id,
          date,
          receipt_items (
            category_id,
            total_price
          )
        `)
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (receiptsError) throw receiptsError;

      // Calculate spending by category
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

      setSpending(categorySpending);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: newBudget.category,
          amount: parseFloat(newBudget.amount),
          period: newBudget.period,
        });

      if (error) throw error;

      // Refresh budgets
      await fetchBudgets();
      
      // Reset form
      setNewBudget({
        category: '',
        amount: '',
        period: 'monthly',
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      // Refresh budgets
      await fetchBudgets();
    } catch (error) {
      setError(error.message);
    }
  };

  const getProgressPercentage = (category, budgetAmount) => {
    const spent = spending[category] || 0;
    return Math.min((spent / budgetAmount) * 100, 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Budget Setup
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Add New Budget Form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Budget
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Category"
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Category</option>
                <option value="groceries">Groceries</option>
                <option value="restaurants">Restaurants</option>
                <option value="transportation">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Period"
                value={newBudget.period}
                onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddBudget}
                disabled={!newBudget.category || !newBudget.amount}
              >
                Add Budget
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Budget Cards */}
        <Grid container spacing={3}>
          {budgets.map((budget) => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {budget.category_id}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    ${budget.amount} per {budget.period}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(budget.category_id, budget.amount)}
                      color={
                        getProgressPercentage(budget.category_id, budget.amount) > 90
                          ? 'error'
                          : getProgressPercentage(budget.category_id, budget.amount) > 75
                          ? 'warning'
                          : 'primary'
                      }
                    />
                  </Box>
                  <Typography variant="body2">
                    Spent: ${spending[budget.category_id]?.toFixed(2) || '0.00'} of ${budget.amount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getProgressPercentage(budget.category_id, budget.amount).toFixed(1)}% of budget used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}

export default BudgetSetup; 