'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingService } from '@/services/meeting.service'
import { toast } from 'react-hot-toast'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tab,
  Tabs,
  Paper,
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  CalendarMonth,
  VideoCall,
  Schedule,
  Event,
  ViewList,
  GridView,
  CleaningServices,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { MeetingsList } from '@/components/meetings/meetings-list'
import { MeetingsGrid } from '@/components/meetings/meetings-grid'
import { MeetingsCalendar } from '@/components/meetings/meetings-calendar'
import { CreateMeetingDialog } from '@/components/meetings/create-meeting-dialog'
import { MeetingFilters } from '@/components/meetings/meeting-filters'

export default function MeetingsPage() {
  const { t } = useTranslation('meetings')
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list')
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    host: 'all',
    dateRange: 'all',
  })

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await meetingService.triggerCleanup()
      return response
    },
    onSuccess: (data) => {
      toast.success(`Cleanup completed! Deleted ${data.result.deletedMeetingsCount} meetings.`)
      if (data.result.dailyMeetingCreated) {
        toast.success('Daily meeting created for tomorrow.')
      }
      // Refresh the meetings list
      queryClient.invalidateQueries({ queryKey: ['admin', 'meetings'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to run cleanup')
    },
  })

  const stats = {
    total: 156,
    upcoming: 23,
    inProgress: 2,
    completed: 131,
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {t('title', 'Meetings')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('subtitle', 'Manage and schedule video meetings')}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<CleaningServices />}
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
          >
            {cleanupMutation.isPending ? t('actions.cleaning', 'Cleaning...') : t('actions.cleanup', 'Run Cleanup')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => {
              setCreateDialogOpen(true)
              // Set recurring flag
            }}
          >
            {t('actions.createRecurring', 'Create Recurring')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t('actions.createMeeting', 'Create Meeting')}
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={3} mb={4}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Event color="primary" />
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.totalMeetings', 'Total Meetings')}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Schedule color="info" />
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {stats.upcoming}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.upcoming', 'Upcoming')}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <VideoCall color="success" />
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.inProgress', 'In Progress')}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Event color="action" />
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.completed', 'Completed')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
              <Tab icon={<ViewList />} iconPosition="start" label={t('views.list', 'List')} value="list" />
              <Tab icon={<GridView />} iconPosition="start" label={t('views.grid', 'Grid')} value="grid" />
              <Tab icon={<CalendarMonth />} iconPosition="start" label={t('views.calendar', 'Calendar')} value="calendar" />
            </Tabs>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder={t('search.placeholder', 'Search meetings...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                {t('actions.filters', 'Filters')}
                {Object.values(filters).filter(v => v !== 'all').length > 0 && (
                  <Chip 
                    label={Object.values(filters).filter(v => v !== 'all').length} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {filtersOpen && (
          <MeetingFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        {/* Content */}
        <Box sx={{ p: 2, minWidth: 0 }}>
          {viewMode === 'list' && (
            <MeetingsList searchQuery={searchQuery} filters={filters} />
          )}
          {viewMode === 'grid' && (
            <MeetingsGrid searchQuery={searchQuery} filters={filters} />
          )}
          {viewMode === 'calendar' && (
            <MeetingsCalendar searchQuery={searchQuery} filters={filters} />
          )}
        </Box>
      </Paper>

        {/* Create Meeting Dialog */}
        <CreateMeetingDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </Box>
    </AdminLayout>
  )
}