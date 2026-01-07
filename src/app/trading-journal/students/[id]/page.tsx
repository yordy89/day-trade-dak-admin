'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Button,
  Divider,
} from '@mui/material'
import {
  Email,
  TrendingUp,
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
import { TradesTable } from '@/components/trading-journal/trades-table'

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
  const { t } = useTranslation('trading-journal')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const studentId = params.id as string
  const eventId = searchParams.get('eventId')
  const { showError, showSuccess } = useSnackbar()

  const [activeTab, setActiveTab] = useState(0)
  const [student, setStudent] = useState<any>(null)
  const [statistics, setStatistics] = useState<TradeStatistics | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [totalTrades, setTotalTrades] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (studentId) {
      loadStudentData()
    }
  }, [studentId])

  useEffect(() => {
    if (studentId) {
      loadTrades()
    }
  }, [studentId, page, rowsPerPage])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      const [userData, statsData] = await Promise.all([
        userService.getUserById(studentId),
        tradingJournalService.getStudentStatistics(studentId),
      ])

      setStudent(userData)
      setStatistics(statsData)
    } catch (error: any) {
      showError(error.response?.data?.message || t('studentDetail.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const loadTrades = async () => {
    try {
      const tradesData = await tradingJournalService.getStudentTrades(studentId, {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'tradeDate',
        sortOrder: 'desc',
      })
      setTrades(tradesData.trades)
      setTotalTrades(tradesData.total)
    } catch (error: any) {
      showError(error.response?.data?.message || t('studentDetail.loadFailed'))
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleFeedbackCreated = () => {
    loadTrades()
    loadStudentData()
  }

  const handleExport = async () => {
    try {
      const blob = await tradingJournalService.exportStudentTrades(studentId, {})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${student?.firstName}_${student?.lastName}_trades_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showSuccess(t('studentDetail.exportSuccess'))
    } catch (error: any) {
      showError(error.response?.data?.message || t('studentDetail.exportFailed'))
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (loading || !student || !statistics) {
    return (
      <AdminLayout>
        <Typography>{t('studentDetail.loading')}</Typography>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            const backUrl = eventId
              ? `/trading-journal?eventId=${eventId}`
              : '/trading-journal'
            router.push(backUrl)
          }}
          sx={{ mb: 2 }}
        >
          {t('studentDetail.backToStudents')}
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
                {t('studentDetail.export')}
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
                {t('statistics.totalTrades')}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {statistics.totalTrades}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('statistics.winRate')}
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
                {t('statistics.totalPnl')}
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
                {t('statistics.profitFactor')}
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
            <Tab label={t('studentDetail.analytics')} icon={<Assessment />} iconPosition="start" />
            <Tab label={t('studentDetail.recentTrades')} icon={<TrendingUp />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <StatisticsDashboard statistics={statistics} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TradesTable
            trades={trades}
            totalTrades={totalTrades}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onFeedbackCreated={handleFeedbackCreated}
          />
        </TabPanel>
      </Card>
    </AdminLayout>
  )
}
