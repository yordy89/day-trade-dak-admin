'use client'

import { Grid, Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { 
  AttachMoney, 
  TrendingUp, 
  Receipt, 
  CreditCard,
  AccountBalance,
  ShowChart
} from '@mui/icons-material'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { usePaymentStats } from '@/hooks/use-payment-stats'

interface RevenueOverviewProps {
  startDate: Date | null
  endDate: Date | null
  currency: string
}

export function RevenueOverview({ startDate, endDate, currency }: RevenueOverviewProps) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const { data: stats, isLoading, error } = usePaymentStats({ startDate, endDate, currency })

  // Debug logging
  console.log('RevenueOverview - Props:', { startDate, endDate, currency })
  console.log('RevenueOverview - Stats data:', stats)
  console.log('RevenueOverview - Loading:', isLoading)
  console.log('RevenueOverview - Error:', error)

  const metrics = [
    {
      title: t('metrics.totalRevenue', 'Total Revenue'),
      value: stats?.totalRevenue || 0,
      change: stats?.revenueChange || 0,
      icon: AttachMoney,
      color: 'primary',
      isCurrency: true,
    },
    {
      title: t('metrics.averageOrderValue', 'Average Order Value'),
      value: stats?.averageOrderValue || 0,
      change: stats?.aovChange || 0,
      icon: ShowChart,
      color: 'success',
      isCurrency: true,
    },
    {
      title: t('metrics.totalTransactions', 'Total Transactions'),
      value: stats?.totalTransactions || 0,
      change: stats?.transactionsChange || 0,
      icon: Receipt,
      color: 'warning',
    },
    {
      title: t('metrics.activeSubscriptions', 'Active Subscriptions'),
      value: stats?.activeSubscriptions || 0,
      change: stats?.subscriptionsChange || 0,
      icon: CreditCard,
      color: 'info',
    },
    {
      title: t('metrics.recurringRevenue', 'Recurring Revenue'),
      value: stats?.recurringRevenue || 0,
      change: stats?.recurringChange || 0,
      icon: AccountBalance,
      color: 'secondary',
      isCurrency: true,
    },
    {
      title: t('metrics.churnRate', 'Churn Rate'),
      value: stats?.churnRate || 0,
      change: stats?.churnChange || 0,
      icon: TrendingUp,
      color: 'error',
      isPercentage: true,
    },
  ]

  // Sample data for charts - replace with real data from API
  // TODO: Replace with actual data from stats when API returns revenue trend data
  const revenueData = [
    { date: 'Jan 1', revenue: 12500, transactions: 45 },
    { date: 'Jan 7', revenue: 15300, transactions: 52 },
    { date: 'Jan 14', revenue: 18200, transactions: 61 },
    { date: 'Jan 21', revenue: 16800, transactions: 58 },
    { date: 'Jan 28', revenue: 21000, transactions: 72 },
  ]

  // TODO: Replace with actual data from stats when API returns plan distribution
  const planDistribution = [
    { name: 'Basic', value: 450, color: theme.palette.primary.main },
    { name: 'Pro', value: 320, color: theme.palette.secondary.main },
    { name: 'Enterprise', value: 180, color: theme.palette.success.main },
  ]

  // TODO: Replace with actual data from stats when API returns payment method distribution
  const paymentMethods = [
    { method: 'Credit Card', amount: 65000, percentage: 65 },
    { method: 'PayPal', amount: 25000, percentage: 25 },
    { method: 'Bank Transfer', amount: 10000, percentage: 10 },
  ]

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading revenue overview...</Typography>
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">Error loading revenue overview. Please try again.</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Metrics Grid */}
      <Grid container spacing={3} mb={4}>
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.change >= 0

          return (
            <Grid item xs={12} sm={6} md={4} key={metric.title}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        {metric.isCurrency 
                          ? formatCurrency(metric.value)
                          : metric.isPercentage 
                          ? `${metric.value}%`
                          : metric.value.toLocaleString()
                        }
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingUp 
                          sx={{ 
                            fontSize: 16,
                            color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                            transform: isPositive ? 'none' : 'rotate(180deg)',
                          }} 
                        />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={isPositive ? 'success.main' : 'error.main'}
                        >
                          {isPositive ? '+' : ''}{metric.change}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('fromLastPeriod', 'from last period')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(
                          (theme.palette[metric.color as keyof typeof theme.palette] as any)?.main || 
                          theme.palette.grey[500], 
                          0.1
                        ),
                        color: (theme.palette[metric.color as keyof typeof theme.palette] as any)?.main || 
                          theme.palette.grey[500],
                      }}
                    >
                      <Icon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('charts.revenueTrend', 'Revenue Trend')}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      stroke={theme.palette.primary.main}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <YAxis 
                      yAxisId="transactions"
                      orientation="right"
                      stroke={theme.palette.secondary.main}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name={t('revenue', 'Revenue')}
                    />
                    <Line 
                      yAxisId="transactions"
                      type="monotone" 
                      dataKey="transactions" 
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name={t('transactions', 'Transactions')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Distribution */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('charts.planDistribution', 'Plan Distribution')}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('charts.paymentMethods', 'Payment Methods')}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={paymentMethods}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="method" stroke={theme.palette.text.secondary} />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Bar dataKey="amount" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}