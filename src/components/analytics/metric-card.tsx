'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, Skeleton, Stack } from '@mui/material'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  format?: 'currency' | 'number' | 'percentage'
  currency?: string
  loading?: boolean
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  decimals?: number
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  format = 'number',
  currency = 'USD',
  loading = false,
  icon,
  color = 'primary',
  decimals = 0
}: MetricCardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(val)
      case 'percentage':
        return `${val.toFixed(decimals)}%`
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(val)
    }
  }

  const getTrendIcon = () => {
    if (!change || change === 0) return <Minus size={16} />
    return change > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />
  }

  const getTrendColor = () => {
    if (!change || change === 0) return 'text.secondary'
    return change > 0 ? 'success.main' : 'error.main'
  }

  return (
    <Card
      sx={{
        height: '100%',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${theme.palette.grey[50]} 100%)`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out',
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: (theme) => `${theme.palette[color].main}10`,
          pointerEvents: 'none'
        }}
      />

      <CardContent sx={{ position: 'relative' }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  color: `${color}.main`,
                  backgroundColor: (theme) => `${theme.palette[color].main}15`,
                  borderRadius: 1,
                  padding: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {icon}
              </Box>
            )}
          </Box>

          {/* Value */}
          {loading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textFillColor: 'transparent'
              }}
            >
              {formatValue(value)}
            </Typography>
          )}

          {/* Change */}
          {change !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {loading ? (
                <Skeleton variant="text" width="40%" height={20} />
              ) : (
                <>
                  <Box color={getTrendColor()} display="flex" alignItems="center">
                    {getTrendIcon()}
                  </Box>
                  <Typography variant="body2" color={getTrendColor()} fontWeight="medium">
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </Typography>
                  {changeLabel && (
                    <Typography variant="body2" color="text.secondary">
                      {changeLabel}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}