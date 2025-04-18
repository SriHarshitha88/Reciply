import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Sort as SortIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';

function ExpenseHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          id,
          merchant_name,
          date,
          total_amount,
          status,
          receipt_items (
            description,
            total_price,
            category_id
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setReceipts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receipt_items.some((item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'date') {
      return multiplier * (new Date(aValue) - new Date(bValue));
    }
    if (sortField === 'total_amount') {
      return multiplier * (parseFloat(aValue) - parseFloat(bValue));
    }
    return multiplier * aValue.localeCompare(bValue);
  });

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
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Expense History
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by merchant or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    Date
                    <IconButton size="small" onClick={() => handleSort('date')}>
                      <SortIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    Merchant
                    <IconButton size="small" onClick={() => handleSort('merchant_name')}>
                      <SortIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    Amount
                    <IconButton size="small" onClick={() => handleSort('total_amount')}>
                      <SortIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedReceipts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      {new Date(receipt.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{receipt.merchant_name}</TableCell>
                    <TableCell>${parseFloat(receipt.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Box>
                        {receipt.receipt_items.map((item, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {item.description}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ${parseFloat(item.total_price).toFixed(2)} • {item.category_id}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={receipt.status}
                        color={receipt.status === 'processed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedReceipts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}

export default ExpenseHistory; 