import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, refundPayment, type Payment } from '../services/api';
import { format } from 'date-fns';

interface RefundDialogData {
  paymentId: string;
  amount: number;
}

export default function Payments() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [refundDialog, setRefundDialog] = useState<RefundDialogData | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments', { page: page + 1, limit: rowsPerPage, status, userId }],
    queryFn: () => getPayments({ page: page + 1, limit: rowsPerPage, status, userId })
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string; amount?: number } }) => refundPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setRefundDialog(null);
      setRefundReason('');
    }
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefund = () => {
    if (refundDialog && refundReason) {
      refundMutation.mutate({
        id: refundDialog.paymentId,
        data: {
          reason: refundReason,
          amount: refundDialog.amount,
        },
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Payments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="User ID"
            variant="outlined"
            size="small"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(0);
            }}
            sx={{ width: 200 }}
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.payments.map((payment: Payment) => (
              <TableRow key={payment._id}>
                <TableCell>
                  {payment.userId.username} ({payment.userId.telegramId})
                </TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.currency}</TableCell>
                <TableCell>{payment.credits}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(payment.createdAt), 'PPpp')}
                </TableCell>
                <TableCell>
                  {payment.status === 'completed' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setRefundDialog({
                          paymentId: payment._id,
                          amount: payment.amount,
                        })
                      }
                    >
                      Refund
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={!!refundDialog} onClose={() => setRefundDialog(null)}>
        <DialogTitle>Refund Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(null)}>Cancel</Button>
          <Button
            onClick={handleRefund}
            color="error"
            disabled={!refundReason || refundMutation.isLoading}
          >
            {refundMutation.isLoading ? 'Processing...' : 'Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 