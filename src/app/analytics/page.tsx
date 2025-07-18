'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Grid, 
  Typography, 
  Paper,
  Tabs,
  Tab,
  Stack,
  Button,
  CircularProgress
} from '@mui/material'
import { 
  CurrencyDollar, 
  Users, 
  ChartLineUp, 
  ShoppingCart,
  Download,
  Calendar
} from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import { MetricCard } from '@/components/analytics/metric-card'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { PaymentMethodChart } from '@/components/analytics/payment-method-chart'
import { SubscriptionDistributionChart } from '@/components/analytics/subscription-distribution-chart'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslation } from 'react-i18next'
import { 
  format, 
  subDays, 
  startOfDay, 
  endOfDay, 
  subMonths, 
  subYears 
} from 'date-fns'

type PeriodType = 'day' | 'week' | 'month' | 'year'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<PeriodType>('month')
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  })

  // Fetch financial metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['financialMetrics', period],
    queryFn: async () => {
      const data = await analyticsService.getFinancialMetrics(period)
      console.log('Financial metrics data:', data)
      return data
    },
    refetchInterval: 60000 // Refresh every minute
  })

  // Fetch revenue chart data
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['revenueChart', dateRange],
    queryFn: async () => {
      const data = await analyticsService.getRevenueChart(dateRange, period === 'year' ? 'month' : 'day')
      console.log('Revenue chart data:', data)
      return data
    }
  })

  // Fetch payment method distribution
  const { data: paymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError } = useQuery({
    queryKey: ['paymentMethods', dateRange],
    queryFn: async () => {
      const data = await analyticsService.getPaymentMethodDistribution(dateRange)
      console.log('Payment methods data:', data)
      return data
    }
  })

  // Fetch revenue by plan
  const { data: revenueByPlan, isLoading: revenueByPlanLoading, error: revenueByPlanError } = useQuery({
    queryKey: ['revenueByPlan', dateRange],
    queryFn: async () => {
      const data = await analyticsService.getRevenueByPlan(dateRange)
      console.log('Revenue by plan data:', data)
      return data
    }
  })
  
  // Log any errors
  useEffect(() => {
    if (metricsError) console.error('Metrics error:', metricsError)
    if (revenueError) console.error('Revenue error:', revenueError)
    if (paymentMethodsError) console.error('Payment methods error:', paymentMethodsError)
    if (revenueByPlanError) console.error('Revenue by plan error:', revenueByPlanError)
  }, [metricsError, revenueError, paymentMethodsError, revenueByPlanError])

  const handlePeriodChange = (_: React.SyntheticEvent, newValue: PeriodType) => {
    setPeriod(newValue)
    const now = new Date()
    // Update date range based on period
    switch (newValue) {
      case 'day':
        setDateRange({
          start: startOfDay(now),
          end: endOfDay(now)
        })
        break
      case 'week':
        setDateRange({
          start: subDays(now, 7),
          end: now
        })
        break
      case 'month':
        setDateRange({
          start: subDays(now, 30),
          end: now
        })
        break
      case 'year':
        setDateRange({
          start: subYears(now, 1),
          end: now
        })
        break
    }
  }

  const handleExportReport = async () => {
    try {
      const blob = await analyticsService.exportAnalyticsReport({
        type: 'revenue',
        format: 'pdf',
        startDate: dateRange.start,
        endDate: dateRange.end
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            {t('Financial Analytics')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download size={20} />}
            onClick={handleExportReport}
          >
            {t('Export Report')}
          </Button>
        </Stack>

        {/* Period Selector */}
        <Paper sx={{ px: 2, py: 1 }}>
          <Tabs value={period} onChange={handlePeriodChange}>
            <Tab label={t('Today')} value="day" />
            <Tab label={t('This Week')} value="week" />
            <Tab label={t('This Month')} value="month" />
            <Tab label={t('This Year')} value="year" />
          </Tabs>
        </Paper>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title={t('Total Revenue')}
            value={metrics?.totalRevenue || 0}
            change={metrics?.totalRevenueChange}
            changeLabel={`vs last ${period}`}
            format="currency"
            loading={metricsLoading}
            icon={<CurrencyDollar size={24} />}
            color="primary"
            decimals={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title={t('Active Subscriptions')}
            value={metrics?.activeSubscriptions || 0}
            change={metrics?.activeSubscriptionsChange}
            changeLabel={`vs last ${period}`}
            format="number"
            loading={metricsLoading}
            icon={<Users size={24} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title={t('Monthly Recurring Revenue')}
            value={metrics?.monthlyRecurringRevenue || 0}
            change={metrics?.mrrChange}
            changeLabel={`vs last ${period}`}
            format="currency"
            loading={metricsLoading}
            icon={<ChartLineUp size={24} />}
            color="info"
            decimals={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title={t('Average Transaction')}
            value={metrics?.averageTransactionValue || 0}
            change={metrics?.atvChange}
            changeLabel={`vs last ${period}`}
            format="currency"
            loading={metricsLoading}
            icon={<ShoppingCart size={24} />}
            color="warning"
            decimals={2}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('Revenue Trend')}
            </Typography>
            {revenueLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                <CircularProgress />
              </Box>
            ) : (
              <RevenueChart data={revenueData} height={350} />
            )}
          </Paper>
        </Grid>

        {/* Payment Methods Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('Payment Methods')}
            </Typography>
            {paymentMethodsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                <CircularProgress />
              </Box>
            ) : (
              <PaymentMethodChart data={paymentMethods} height={350} />
            )}
          </Paper>
        </Grid>

        {/* Subscription Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('Revenue by Subscription Plan')}
            </Typography>
            {revenueByPlanLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                <CircularProgress />
              </Box>
            ) : (
              <SubscriptionDistributionChart data={revenueByPlan} height={350} />
            )}
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </AdminLayout>
  )
}