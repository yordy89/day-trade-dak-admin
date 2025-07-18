'use client'

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  FileText
} from '@phosphor-icons/react'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { format } from 'date-fns'

interface ReportPreviewProps {
  reportName: string
  dateRange: {
    start: Date
    end: Date
  }
  data: any // This would be the actual report data
}

export function ReportPreview({ reportName, dateRange, data }: ReportPreviewProps) {
  // Mock data for preview
  const mockData = {
    summary: {
      totalRevenue: 125780,
      revenueChange: 15.3,
      totalTransactions: 980,
      transactionsChange: 12.5,
      activeSubscriptions: 450,
      subscriptionsChange: 8.2,
      averageTransactionValue: 128.35,
      atvChange: 2.4
    },
    revenueByPlan: [
      { plan: 'Live Weekly Manual', revenue: 45000, count: 226 },
      { plan: 'Master Classes', revenue: 35000, count: 100 },
      { plan: 'Live Recorded', revenue: 25000, count: 100 },
      { plan: 'PsicoTrading', revenue: 15000, count: 50 },
      { plan: 'One-time Classes', revenue: 5780, count: 24 }
    ],
    topCustomers: [
      { name: 'John Doe', email: 'john@example.com', revenue: 2450, transactions: 12 },
      { name: 'Jane Smith', email: 'jane@example.com', revenue: 1890, transactions: 8 },
      { name: 'Mike Johnson', email: 'mike@example.com', revenue: 1650, transactions: 7 },
      { name: 'Sarah Williams', email: 'sarah@example.com', revenue: 1420, transactions: 6 },
      { name: 'Tom Brown', email: 'tom@example.com', revenue: 1200, transactions: 5 }
    ]
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} />
    if (change < 0) return <TrendingDown size={16} />
    return <Minus size={16} />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success.main'
    if (change < 0) return 'error.main'
    return 'text.secondary'
  }

  return (
    <Paper sx={{ p: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {reportName}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<Calendar size={16} />}
              label={`${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              Generated on {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2
          }}
        >
          <FileText size={40} />
        </Box>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {/* Summary Metrics */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Executive Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(mockData.summary.totalRevenue)}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Box color={getChangeColor(mockData.summary.revenueChange)}>
                  {getChangeIcon(mockData.summary.revenueChange)}
                </Box>
                <Typography 
                  variant="body2" 
                  color={getChangeColor(mockData.summary.revenueChange)}
                  fontWeight="medium"
                >
                  {mockData.summary.revenueChange > 0 ? '+' : ''}{mockData.summary.revenueChange}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(mockData.summary.totalTransactions)}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Box color={getChangeColor(mockData.summary.transactionsChange)}>
                  {getChangeIcon(mockData.summary.transactionsChange)}
                </Box>
                <Typography 
                  variant="body2" 
                  color={getChangeColor(mockData.summary.transactionsChange)}
                  fontWeight="medium"
                >
                  {mockData.summary.transactionsChange > 0 ? '+' : ''}{mockData.summary.transactionsChange}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Subscriptions
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(mockData.summary.activeSubscriptions)}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Box color={getChangeColor(mockData.summary.subscriptionsChange)}>
                  {getChangeIcon(mockData.summary.subscriptionsChange)}
                </Box>
                <Typography 
                  variant="body2" 
                  color={getChangeColor(mockData.summary.subscriptionsChange)}
                  fontWeight="medium"
                >
                  {mockData.summary.subscriptionsChange > 0 ? '+' : ''}{mockData.summary.subscriptionsChange}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Transaction
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(mockData.summary.averageTransactionValue)}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Box color={getChangeColor(mockData.summary.atvChange)}>
                  {getChangeIcon(mockData.summary.atvChange)}
                </Box>
                <Typography 
                  variant="body2" 
                  color={getChangeColor(mockData.summary.atvChange)}
                  fontWeight="medium"
                >
                  {mockData.summary.atvChange > 0 ? '+' : ''}{mockData.summary.atvChange}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Revenue by Plan */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Revenue by Subscription Plan
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Subscribers</TableCell>
                <TableCell align="right">% of Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.revenueByPlan.map((row) => (
                <TableRow key={row.plan}>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell align="right">{formatNumber(row.count)}</TableCell>
                  <TableCell align="right">
                    {formatPercentage((row.revenue / mockData.summary.totalRevenue) * 100)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Top Customers */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Top Customers by Revenue
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Transactions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.topCustomers.map((customer, index) => (
                <TableRow key={customer.email}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell align="right">{formatCurrency(customer.revenue)}</TableCell>
                  <TableCell align="right">{customer.transactions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Box mt={6} pt={3} borderTop={1} borderColor="divider">
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          This report was automatically generated by DayTradeDak Analytics. 
          For questions or custom reports, please contact support@daytradedak.com
        </Typography>
      </Box>
    </Paper>
  )
}