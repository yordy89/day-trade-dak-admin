'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack,
  Chip,
  Avatar,
  Button,
  Divider,
} from '@mui/material'
import {
  Person,
  Email,
  TrendingUp,
  TrendingDown,
  Assessment,
  ArrowBack,
  Download,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/page-header'
import { TradeStatistics, Trade } from '@/types/trading-journal'
import { tradingJournalService } from '@/services/trading-journal.service'
import { userService } from '@/services/user.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { StatisticsDashboard } from '@/components/trading-journal/statistics-dashboard'
import { TradeReviewCard } from '@/components/trading-journal/trade-review-card'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const { showError, showSuccess } = useSnackbar()

  const [activeTab, setActiveTab] = useState(0)
  const [student, setStudent] = useState<any>(null)
  const [statistics, setStatistics] = useState<TradeStatistics | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      loadStudentData()
    }
  }, [studentId])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      const [userData, statsData, tradesData] = await Promise.all([
        userService.getUserById(studentId),
        tradingJournalService.getStudentStatistics(studentId),
        tradingJournalService.getStudentTrades(studentId, {
          page: 1,
          limit: 20,
          sortBy: 'tradeDate',
          sortOrder: 'desc',
        }),
      ])

      setStudent(userData)
      setStatistics(statsData)
      setTrades(tradesData.trades)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load student data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await tradingJournalService.exportStudentTrades(studentId, {}, 'csv')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${student?.firstName}_${student?.lastName}_trades_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showSuccess('Trades exported successfully')
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to export trades')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (loading || !student || !statistics) {
    return (
      <AdminLayout>
        <Typography>Loading student data...</Typography>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/trading-journal')}
          sx={{ mb: 2 }}
        >
          Back to Students
        </Button>

        <PageHeader
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {getInitials(student.firstName, student.lastName)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {student.firstName} {student.lastName}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {student.email}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          }
          action={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
              >
                Export Trades
              </Button>
            </Stack>
          }
        />
      </Box>

      {/* Quick Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={4}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Trades
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {statistics.totalTrades}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Win Rate
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                color={(statistics.winRate || 0) >= 50 ? 'success.main' : 'error.main'}
              >
                {(statistics.winRate || 0).toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total P&L
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                color={(statistics.totalPnl || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                ${(statistics.totalPnl || 0).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Profit Factor
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {(statistics.profitFactor || 0).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
            <Tab label="Recent Trades" icon={<TrendingUp />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <StatisticsDashboard statistics={statistics} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            {trades.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No trades found
              </Typography>
            ) : (
              trades.map((trade) => (
                <TradeReviewCard
                  key={trade._id}
                  trade={trade}
                  onFeedbackCreated={loadStudentData}
                />
              ))
            )}
          </Stack>
        </TabPanel>
      </Card>
    </AdminLayout>
  )
}
