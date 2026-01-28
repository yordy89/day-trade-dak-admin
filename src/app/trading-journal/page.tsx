'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/page-header'
import { StudentsTable } from '@/components/trading-journal/students-table'
import { StudentWithJournal } from '@/types/trading-journal'
import { tradingJournalService } from '@/services/trading-journal.service'
import { eventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import {
  People,
  TrendingUp,
  TrendingDown,
  Warning,
  Assessment,
  FilterList,
  Clear,
} from '@mui/icons-material'

type StudentFilter = 'all' | 'pendingReview' | 'profitable' | 'unprofitable' | 'highWinRate' | 'lowWinRate' | 'recentlyActive' | 'inactive'

export default function TradingJournalPage() {
  const { t } = useTranslation('trading-journal')
  const { showError } = useSnackbar()
  const searchParams = useSearchParams()
  const initialEventId = searchParams.get('eventId') || ''

  const [students, setStudents] = useState<StudentWithJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId)
  const [studentFilter, setStudentFilter] = useState<StudentFilter>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [selectedEventId])

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents({ limit: 1000 })
      setEvents(data.events || [])
    } catch (error: any) {
      console.error('Failed to load events:', error)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await tradingJournalService.getStudentsWithJournals(
        selectedEventId || undefined
      )
      setStudents(data)
    } catch (error: any) {
      showError(error.response?.data?.message || t('students.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilter = () => {
    setSelectedEventId('')
    setStudentFilter('all')
  }

  // Filter students based on selected filter
  const filteredStudents = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return students.filter((student) => {
      switch (studentFilter) {
        case 'pendingReview':
          return (student.needsReview || 0) > 0
        case 'profitable':
          return (student.totalPnl || 0) > 0
        case 'unprofitable':
          return (student.totalPnl || 0) <= 0
        case 'highWinRate':
          return (student.winRate || 0) > 60
        case 'lowWinRate':
          return (student.winRate || 0) < 40
        case 'recentlyActive':
          return student.lastTradeDate && new Date(student.lastTradeDate) >= sevenDaysAgo
        case 'inactive':
          return !student.lastTradeDate || new Date(student.lastTradeDate) < sevenDaysAgo
        default:
          return true
      }
    })
  }, [students, studentFilter])

  // Calculate overview stats (from all students, not filtered)
  const totalStudents = students.length
  const totalTrades = students.reduce((sum, s) => sum + (s.totalTrades || 0), 0)
  const profitableStudents = students.filter((s) => (s.totalPnl || 0) > 0).length
  const needsReview = students.reduce((sum, s) => sum + (s.needsReview || 0), 0)
  const avgWinRate = students.length > 0
    ? students.reduce((sum, s) => sum + (s.winRate || 0), 0) / students.length
    : 0

  return (
    <AdminLayout>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <FilterList color="action" />
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>{t('students.filterByEvent')}</InputLabel>
              <Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                label={t('students.filterByEvent')}
                size="small"
              >
                <MenuItem value="">
                  <em>{t('students.allEvents')}</em>
                </MenuItem>
                {events.map((event) => (
                  <MenuItem key={event._id} value={event._id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{t('students.filterByStatus')}</InputLabel>
              <Select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value as StudentFilter)}
                label={t('students.filterByStatus')}
                size="small"
              >
                <MenuItem value="all">{t('students.allStudents')}</MenuItem>
                <MenuItem value="pendingReview">{t('students.pendingReview')}</MenuItem>
                <MenuItem value="profitable">{t('students.profitable')}</MenuItem>
                <MenuItem value="unprofitable">{t('students.unprofitable')}</MenuItem>
                <MenuItem value="highWinRate">{t('students.highWinRate')}</MenuItem>
                <MenuItem value="lowWinRate">{t('students.lowWinRate')}</MenuItem>
                <MenuItem value="recentlyActive">{t('students.recentlyActive')}</MenuItem>
                <MenuItem value="inactive">{t('students.inactive')}</MenuItem>
              </Select>
            </FormControl>
            {(selectedEventId || studentFilter !== 'all') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilter}
              >
                Clear Filters
              </Button>
            )}
            {studentFilter !== 'all' && (
              <Chip
                label={`${filteredStudents.length} / ${totalStudents}`}
                color="primary"
                size="small"
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <People color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.totalStudents')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Assessment color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalTrades}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.totalTrades')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {avgWinRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.avgWinRate')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Warning color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {needsReview}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.needsReview')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('students.profitableStudents')}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUp color="success" fontSize="small" />
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {profitableStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {totalStudents}
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('students.unprofitableStudents')}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingDown color="error" fontSize="small" />
                <Typography variant="h6" fontWeight={600} color="error.main">
                  {totalStudents - profitableStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {totalStudents}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Students Table */}
      <StudentsTable students={filteredStudents} loading={loading} eventId={selectedEventId} />
    </AdminLayout>
  )
}
