'use client'

import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'
import { useUserStats } from '@/hooks/use-admin-stats'
import { useMemo } from 'react'

export function UserGrowthChart() {
  const { t } = useTranslation('dashboard')
  const theme = useTheme()
  const { data: userStats } = useUserStats()

  // Generate mock data based on actual stats
  const data = useMemo(() => {
    if (!userStats) {
      return []
    }

    // Mock historical data - in production, this would come from API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const baseUsers = userStats.total - (userStats.growth.thisMonth * 12) // Rough estimate
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const growthRate = 0.05 + (Math.random() * 0.03) // 5-8% monthly growth
      const monthlyNewUsers = Math.floor(baseUsers * growthRate * (index + 1) / currentMonth)
      const totalUsers = Math.floor(baseUsers + (baseUsers * growthRate * index))
      
      return {
        month,
        newUsers: monthlyNewUsers,
        activeUsers: Math.floor(totalUsers * 0.7), // 70% active rate
        totalUsers,
      }
    })
  }, [userStats])

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
          {t('charts.userGrowth.title', 'User Growth')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('charts.userGrowth.subtitle', 'Monthly user acquisition and retention')}
        </Typography>
        
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
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
                stroke={theme.palette.text.secondary}
                style={{ fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stackId="1"
                stroke={theme.palette.warning.main}
                fill={theme.palette.warning.main}
                fillOpacity={0.6}
                name={t('charts.userGrowth.newUsers', 'New Users')}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stackId="2"
                stroke={theme.palette.success.main}
                fill={theme.palette.success.main}
                fillOpacity={0.6}
                name={t('charts.userGrowth.activeUsers', 'Active Users')}
              />
              <Area
                type="monotone"
                dataKey="totalUsers"
                stackId="3"
                stroke={theme.palette.info.main}
                fill={theme.palette.info.main}
                fillOpacity={0.6}
                name={t('charts.userGrowth.totalUsers', 'Total Users')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}