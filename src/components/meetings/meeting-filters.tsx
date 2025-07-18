'use client'

import { useTranslation } from 'react-i18next'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material'
import { Clear } from '@mui/icons-material'

interface MeetingFiltersProps {
  filters: {
    status: string
    type: string
    host: string
    dateRange: string
  }
  onFilterChange: (filters: any) => void
  onClose: () => void
}

export function MeetingFilters({ filters, onFilterChange, onClose }: MeetingFiltersProps) {
  const { t } = useTranslation('meetings')

  const handleChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const handleClear = () => {
    onFilterChange({
      status: 'all',
      type: 'all',
      host: 'all',
      dateRange: 'all',
    })
  }

  return (
    <Box p={2}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.status', 'Status')}</InputLabel>
          <Select
            value={filters.status}
            label={t('filters.status', 'Status')}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <MenuItem value="all">{t('filters.allStatuses', 'All Statuses')}</MenuItem>
            <MenuItem value="scheduled">{t('status.scheduled', 'Scheduled')}</MenuItem>
            <MenuItem value="live">{t('status.live', 'Live')}</MenuItem>
            <MenuItem value="completed">{t('status.completed', 'Completed')}</MenuItem>
            <MenuItem value="cancelled">{t('status.cancelled', 'Cancelled')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.type', 'Type')}</InputLabel>
          <Select
            value={filters.type}
            label={t('filters.type', 'Type')}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <MenuItem value="all">{t('filters.allTypes', 'All Types')}</MenuItem>
            <MenuItem value="oneTime">{t('types.oneTime', 'One-time')}</MenuItem>
            <MenuItem value="recurring">{t('types.recurring', 'Recurring')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.dateRange', 'Date Range')}</InputLabel>
          <Select
            value={filters.dateRange}
            label={t('filters.dateRange', 'Date Range')}
            onChange={(e) => handleChange('dateRange', e.target.value)}
          >
            <MenuItem value="all">{t('filters.allTime', 'All Time')}</MenuItem>
            <MenuItem value="today">{t('filters.today', 'Today')}</MenuItem>
            <MenuItem value="tomorrow">{t('filters.tomorrow', 'Tomorrow')}</MenuItem>
            <MenuItem value="thisWeek">{t('filters.thisWeek', 'This Week')}</MenuItem>
            <MenuItem value="nextWeek">{t('filters.nextWeek', 'Next Week')}</MenuItem>
            <MenuItem value="thisMonth">{t('filters.thisMonth', 'This Month')}</MenuItem>
            <MenuItem value="nextMonth">{t('filters.nextMonth', 'Next Month')}</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Clear />}
          onClick={handleClear}
        >
          {t('actions.clearFilters', 'Clear Filters')}
        </Button>
      </Box>
    </Box>
  )
}