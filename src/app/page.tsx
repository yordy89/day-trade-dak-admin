'use client'

import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid } from '@mui/material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { UserGrowthChart } from '@/components/dashboard/user-growth-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <AdminLayout>
      <Box>
        {/* Page Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('overview.title', 'Dashboard Overview')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('overview.welcome', 'Welcome back! Here\'s what\'s happening with your platform today.')}
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box mb={4}>
          <StatsOverview />
        </Box>

        {/* Charts Grid */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} lg={6}>
            <RevenueChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <UserGrowthChart />
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <RecentActivity />
          </Grid>
          <Grid item xs={12} lg={4}>
            <QuickActions />
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  )
}