'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp,
  People,
  Receipt,
  CheckCircle,
  Warning,
  AttachMoney,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/auth-store'
import { useSnackbar } from '@/hooks/use-snackbar'
import axios from 'axios'

interface Analytics {
  totalPlans: number
  activePlans: number
  completedPlans: number
  defaultedPlans: number
  defaultRate: string
  totalFinanced: number
  approvedUsers: number
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}.100`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function FinancingAnalytics() {
  const { t } = useTranslation('financing')
  const { token } = useAuthStore()
  const { showError } = useSnackbar()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnalytics(response.data)
    } catch (error) {
      showError(t('errors.fetch_analytics', 'Failed to fetch analytics'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('analytics.title', 'Financing Analytics')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title={t('analytics.total_financed', 'Total Financed')}
            value={`$${analytics.totalFinanced.toLocaleString()}`}
            subtitle={t('analytics.all_time', 'All time')}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title={t('analytics.active_plans', 'Active Plans')}
            value={analytics.activePlans}
            subtitle={`${t('analytics.of', 'of')} ${analytics.totalPlans} ${t('analytics.total', 'total')}`}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title={t('analytics.completed_plans', 'Completed Plans')}
            value={analytics.completedPlans}
            subtitle={`${((analytics.completedPlans / analytics.totalPlans) * 100).toFixed(1)}% ${t('analytics.completion_rate', 'completion rate')}`}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title={t('analytics.default_rate', 'Default Rate')}
            value={analytics.defaultRate}
            subtitle={`${analytics.defaultedPlans} ${t('analytics.defaulted_plans', 'defaulted plans')}`}
            icon={<Warning />}
            color="error"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.user_approvals', 'User Approvals')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <People sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {analytics.approvedUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('analytics.approved_for_financing', 'Users approved for local financing')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.plan_distribution', 'Plan Distribution')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('status.active', 'Active')}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {analytics.activePlans}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('status.completed', 'Completed')}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {analytics.completedPlans}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('status.defaulted', 'Defaulted')}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {analytics.defaultedPlans}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{t('analytics.total', 'Total')}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {analytics.totalPlans}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.insights_title', 'Key Insights')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                {t('analytics.success_rate', 'Success Rate')}
              </Typography>
              <Typography variant="body2">
                {t(
                  'analytics.success_rate_desc',
                  `${((analytics.completedPlans / (analytics.totalPlans || 1)) * 100).toFixed(1)}% of financing plans are successfully completed`
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                {t('analytics.avg_plan_value', 'Average Plan Value')}
              </Typography>
              <Typography variant="body2">
                {t(
                  'analytics.avg_plan_value_desc',
                  `$${(analytics.totalFinanced / (analytics.totalPlans || 1)).toFixed(2)} average financing amount per plan`
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}