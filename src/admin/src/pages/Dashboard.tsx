import { Grid, Paper, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '../services/api';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats
  });

  const StatCard = ({ title, value, subtitle }: { title: string; value: number | string; subtitle?: string }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="h3" component="div">{value}</Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography>
      )}
    </Paper>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="Total Users"
              value={stats?.data.users.total || 0}
              subtitle={`${stats?.data.users.new} new in last 30 days`}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="Active Users"
              value={stats?.data.users.active || 0}
              subtitle="Active in last 30 days"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%' }}>
            <StatCard
              title="Success Rate"
              value={`${((stats?.data.names.successRate || 0) * 100).toFixed(1)}%`}
              subtitle="Name generation success rate"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Name Generation Stats</Typography>
            <Box>
              <Typography variant="body1">
                Total Names: {stats?.data.names.total || 0}
              </Typography>
              <Typography variant="body1">
                Generated Names: {stats?.data.names.totalGenerated || 0}
              </Typography>
              <Typography variant="body1">
                Average Generation Time: {(stats?.data.names.averageGenerationTime || 0).toFixed(2)}s
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Payment Stats</Typography>
            <Box>
              {stats?.data.payments.map((payment) => (
                <Typography key={payment._id} variant="body1">
                  {payment._id}: {payment.totalAmount} ({payment.count} transactions)
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 
 