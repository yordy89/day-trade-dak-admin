'use client'

import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/utils'

// Mock data - will be replaced with real API data
const data = [
  { month: 'Jan', revenue: 65000, subscriptions: 450 },
  { month: 'Feb', revenue: 75000, subscriptions: 520 },
  { month: 'Mar', revenue: 82000, subscriptions: 580 },
  { month: 'Apr', revenue: 91000, subscriptions: 650 },
  { month: 'May', revenue: 98000, subscriptions: 720 },
  { month: 'Jun', revenue: 105000, subscriptions: 800 },
  { month: 'Jul', revenue: 112000, subscriptions: 870 },
  { month: 'Aug', revenue: 118000, subscriptions: 920 },
  { month: 'Sep', revenue: 125000, subscriptions: 980 },
  { month: 'Oct', revenue: 132000, subscriptions: 1050 },
  { month: 'Nov', revenue: 138000, subscriptions: 1100 },
  { month: 'Dec', revenue: 145000, subscriptions: 1150 },
]

export function RevenueChart() {
  const { t } = useTranslation('dashboard')
  const theme = useTheme()

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('charts.revenue.title', 'Revenue Overview')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('charts.revenue.subtitle', 'Monthly revenue and subscription growth')}
        </Typography>
        
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={alpha(theme.palette.divider, 0.5)}
              />
              <XAxis 
                dataKey="month" 
                stroke={theme.palette.text.secondary}
                style={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="revenue"
                orientation="left"
                stroke={theme.palette.primary.main}
                tickFormatter={(value) => `$${value / 1000}k`}
                style={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="subscriptions"
                orientation="right"
                stroke={theme.palette.secondary.main}
                style={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') {
                    return [formatCurrency(value), t('charts.revenue.revenue', 'Revenue')]
                  }
                  return [value, t('charts.revenue.subscriptions', 'Subscriptions')]
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                yAxisId="revenue"
                type="monotone" 
                dataKey="revenue" 
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4, fill: theme.palette.primary.main }}
                name={t('charts.revenue.revenue', 'Revenue')}
              />
              <Line 
                yAxisId="subscriptions"
                type="monotone" 
                dataKey="subscriptions" 
                stroke={theme.palette.secondary.main}
                strokeWidth={3}
                dot={{ r: 4, fill: theme.palette.secondary.main }}
                name={t('charts.revenue.subscriptions', 'Subscriptions')}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}