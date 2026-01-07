'use client'

import { useEffect, useState } from 'react'
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

export default function TradingJournalPage() {
  const { t } = useTranslation('trading-journal')
  const { showError } = useSnackbar()
  const searchParams = useSearchParams()
  const initialEventId = searchParams.get('eventId') || ''

  const [students, setStudents] = useState<StudentWithJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId)

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
  }

  // Calculate overview stats
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

      {/* Event Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <FilterList color="action" />
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>{t('students.filterByEvent')}</InputLabel>
              <Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                label={t('students.filterByEvent')}
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
            {selectedEventId && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilter}
              >
                {t('students.clearFilter')}
              </Button>
            )}
            {selectedEventId && (
              <Typography variant="body2" color="text.secondary">
                {t('students.filterMessage')}
              </Typography>
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
      <StudentsTable students={students} loading={loading} eventId={selectedEventId} />
    </AdminLayout>
  )
}
