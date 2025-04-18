import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { supabase } from './lib/supabaseClient';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceiptScanner from './pages/ReceiptScanner';
import ExpenseHistory from './pages/ExpenseHistory';
import BudgetSetup from './pages/BudgetSetup';
import Insights from './pages/Insights';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ReceiptScanner />} />
          <Route path="/history" element={<ExpenseHistory />} />
          <Route path="/budget" element={<BudgetSetup />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 