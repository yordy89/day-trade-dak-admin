'use client'

import React from 'react'
import { Box, Typography, useTheme, alpha } from '@mui/material'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'
import { RevenueChartData } from '@/services/analytics.service'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data?: RevenueChartData
  height?: number
}

export function RevenueChart({ data, height = 350 }: RevenueChartProps) {
  const theme = useTheme()

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No revenue data available for the selected period</Typography>
      </Box>
    )
  }

  // Transform data for recharts
  const chartData = data.labels.map((label, index) => {
    const dataPoint: any = { date: label }
    data.datasets.forEach(dataset => {
      dataPoint[dataset.name] = dataset.data[index]
    })
    return dataPoint
  })

  const colors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main
  ]

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {data.datasets.map((dataset, index) => (
              <linearGradient key={dataset.name} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={colors[index]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={alpha(theme.palette.divider, 0.5)}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[3]
            }}
            formatter={(value: any) => formatCurrency(value)}
            labelStyle={{ color: theme.palette.text.primary }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>}
          />
          {data.datasets.map((dataset, index) => (
            <Area
              key={dataset.name}
              type="monotone"
              dataKey={dataset.name}
              stroke={colors[index]}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient${index})`}
              name={dataset.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}