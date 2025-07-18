'use client'

import React from 'react'
import { Box, useTheme, Typography } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PaymentMethodDistribution } from '@/services/analytics.service'
import { formatCurrency } from '@/lib/utils'

interface PaymentMethodChartProps {
  data?: PaymentMethodDistribution[]
  height?: number
}

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  card: '#16a34a',
  klarna: '#ffb3d9',
  afterpay: '#b2f1e8',
  affirm: '#7c3aed',
  bank_transfer: '#0ea5e9'
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Credit/Debit Card',
  klarna: 'Klarna',
  afterpay: 'Afterpay',
  affirm: 'Affirm',
  bank_transfer: 'Bank Transfer'
}

export function PaymentMethodChart({ data, height = 350 }: PaymentMethodChartProps) {
  const theme = useTheme()

  if (!data || data.length === 0) {
    return (
      <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No payment method data available</Typography>
      </Box>
    )
  }

  // Transform data for recharts
  const chartData = data.map(item => ({
    name: PAYMENT_METHOD_LABELS[item.method] || item.method,
    value: item.amount,
    count: item.count,
    percentage: item.percentage
  }))

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
          <Typography variant="subtitle2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.payload.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {data.payload.percentage.toFixed(1)}%
          </Typography>
        </Box>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percentage < 5) return null // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={PAYMENT_METHOD_COLORS[Object.keys(PAYMENT_METHOD_LABELS)[index]] || theme.palette.primary.main} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}