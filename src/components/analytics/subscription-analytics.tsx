'use client'

import { Grid, Card, CardContent, Typography, Box, useTheme, alpha, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  People,
  Cancel,
  Update
} from '@mui/icons-material'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useSubscriptionStats } from '@/hooks/use-subscription-stats'

interface SubscriptionAnalyticsProps {
  startDate: Date | null
  endDate: Date | null
  currency: string
}

export function SubscriptionAnalytics({ startDate, endDate, currency }: SubscriptionAnalyticsProps) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const { data: stats, isLoading, error } = useSubscriptionStats({ startDate, endDate })

  // Debug logging
  console.log('SubscriptionAnalytics - Props:', { startDate, endDate, currency })
  console.log('SubscriptionAnalytics - Stats data:', stats)
  console.log('SubscriptionAnalytics - Loading:', isLoading)
  console.log('SubscriptionAnalytics - Error:', error)

  // Sample data - replace with real data from API
  // TODO: Replace with actual data from stats when API returns growth data
  const growthData = stats?.growthData || [
    { month: 'Jan', newSubscriptions: 120, cancellations: 15, netGrowth: 105 },
    { month: 'Feb', newSubscriptions: 145, cancellations: 22, netGrowth: 123 },
    { month: 'Mar', newSubscriptions: 168, cancellations: 18, netGrowth: 150 },
    { month: 'Apr', newSubscriptions: 190, cancellations: 25, netGrowth: 165 },
    { month: 'May', newSubscriptions: 210, cancellations: 30, netGrowth: 180 },
    { month: 'Jun', newSubscriptions: 235, cancellations: 28, netGrowth: 207 },
  ]

  // TODO: Replace with actual data from stats when API returns MRR trend data
  const mrrData = stats?.mrrData || [
    { month: 'Jan', mrr: 45000, growth: 5.2 },
    { month: 'Feb', mrr: 52000, growth: 15.6 },
    { month: 'Mar', mrr: 58000, growth: 11.5 },
    { month: 'Apr', mrr: 65000, growth: 12.1 },
    { month: 'May', mrr: 73000, growth: 12.3 },
    { month: 'Jun', mrr: 82000, growth: 12.3 },
  ]

  const planMetrics = [
    { 
      plan: 'Basic',
      subscribers: stats?.planBreakdown?.basic?.count || 450,
      mrr: stats?.planBreakdown?.basic?.mrr || 13500,
      avgLifetime: 8.5,
      churn: 2.8,
      color: theme.palette.primary.main,
    },
    { 
      plan: 'Pro',
      subscribers: stats?.planBreakdown?.pro?.count || 320,
      mrr: stats?.planBreakdown?.pro?.mrr || 32000,
      avgLifetime: 12.3,
      churn: 1.5,
      color: theme.palette.secondary.main,
    },
    { 
      plan: 'Enterprise',
      subscribers: stats?.planBreakdown?.enterprise?.count || 180,
      mrr: stats?.planBreakdown?.enterprise?.mrr || 36000,
      avgLifetime: 18.2,
      churn: 0.8,
      color: theme.palette.success.main,
    },
  ]

  const kpiCards = [
    {
      title: t('subscriptions.totalMRR', 'Monthly Recurring Revenue'),
      value: stats?.totalMRR || 82000,
      change: stats?.mrrGrowth || 12.3,
      icon: CreditCard,
      color: 'primary',
      isCurrency: true,
    },
    {
      title: t('subscriptions.totalSubscribers', 'Total Subscribers'),
      value: stats?.totalSubscribers || 950,
      change: stats?.subscriberGrowth || 8.5,
      icon: People,
      color: 'success',
    },
    {
      title: t('subscriptions.churnRate', 'Churn Rate'),
      value: stats?.churnRate || 2.1,
      change: stats?.churnChange || -0.3,
      icon: Cancel,
      color: 'error',
      isPercentage: true,
      invertChange: true,
    },
    {
      title: t('subscriptions.ltv', 'Average LTV'),
      value: stats?.averageLTV || 1250,
      change: stats?.ltvGrowth || 5.2,
      icon: Update,
      color: 'warning',
      isCurrency: true,
    },
  ]

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading subscription analytics...</Typography>
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">Error loading subscription analytics. Please try again.</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.invertChange ? kpi.change <= 0 : kpi.change >= 0

          return (
            <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        {kpi.isCurrency 
                          ? formatCurrency(kpi.value)
                          : kpi.isPercentage 
                          ? `${kpi.value}%`
                          : kpi.value.toLocaleString()
                        }
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {isPositive ? (
                          <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                        )}
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={isPositive ? 'success.main' : 'error.main'}
                        >
                          {isPositive && !kpi.invertChange ? '+' : ''}{kpi.change}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(
                          theme.palette[kpi.color as any]?.main || 
                          theme.palette[kpi.color as any]?.[500] || 
                          theme.palette.grey[500], 
                          0.1
                        ),
                        color: theme.palette[kpi.color as any]?.main || 
                          theme.palette[kpi.color as any]?.[500] || 
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

      {/* Charts */}
      <Grid container spacing={3}>
        {/* MRR Growth Chart */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('charts.mrrGrowth', 'MRR Growth')}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={mrrData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'mrr') return [formatCurrency(value), 'MRR']
                        return [`${value}%`, 'Growth']
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Growth Chart */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('charts.subscriptionGrowth', 'Subscription Growth')}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="newSubscriptions" 
                      fill={theme.palette.success.main} 
                      name={t('newSubscriptions', 'New Subscriptions')}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="cancellations" 
                      fill={theme.palette.error.main} 
                      name={t('cancellations', 'Cancellations')}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Breakdown */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('planBreakdown', 'Plan Breakdown')}
              </Typography>
              <Grid container spacing={3} mt={1}>
                {planMetrics.map((plan, index) => (
                  <Grid item xs={12} md={4} key={plan.plan}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: alpha(plan.color, 0.08),
                        border: 1,
                        borderColor: alpha(plan.color, 0.2),
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} color={plan.color} gutterBottom>
                        {plan.plan}
                      </Typography>
                      <Box mt={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            {t('subscribers', 'Subscribers')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {plan.subscribers}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            {t('mrr', 'MRR')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(plan.mrr)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            {t('avgLifetime', 'Avg Lifetime')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {plan.avgLifetime} {t('months', 'months')}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {t('churnRate', 'Churn Rate')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color={plan.churn > 2 ? 'error.main' : 'success.main'}>
                            {plan.churn}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}