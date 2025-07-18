'use client'

import React from 'react'
import { Box, Typography, useTheme, alpha } from '@mui/material'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/payment'

interface SubscriptionDistributionChartProps {
  data?: any
  height?: number
}

export function SubscriptionDistributionChart({ data, height = 350 }: SubscriptionDistributionChartProps) {
  const theme = useTheme()

  if (!data || !data.planBreakdown || Object.keys(data.planBreakdown).length === 0) {
    return (
      <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No subscription data available</Typography>
      </Box>
    )
  }

  // Transform data for recharts
  const chartData = Object.entries(data.planBreakdown).map(([plan, details]: [string, any]) => ({
    name: SUBSCRIPTION_PLANS[plan as SubscriptionPlan]?.name || plan,
    revenue: details.revenue,
    count: details.count,
    color: SUBSCRIPTION_PLANS[plan as SubscriptionPlan]?.color || theme.palette.primary.main
  })).sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[3]
          }}
        >
          <Box sx={{ color: data.payload.color, fontWeight: 'bold', mb: 0.5 }}>
            {data.payload.name}
          </Box>
          <Box sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
            Revenue: {formatCurrency(data.value)}
          </Box>
          <Box sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
            Subscribers: {data.payload.count}
          </Box>
        </Box>
      )
    }
    return null
  }

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props
    return (
      <g>
        <defs>
          <linearGradient id={`gradient-${x}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.9}/>
            <stop offset="95%" stopColor={fill} stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={`url(#gradient-${x})`} rx={4} />
      </g>
    )
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={alpha(theme.palette.divider, 0.5)}
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
          />
          <Bar 
            dataKey="revenue" 
            shape={<CustomBar />}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}