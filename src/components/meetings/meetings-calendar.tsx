'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  AvatarGroup,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Today,
  VideoCall,
  Schedule,
  People,
  AccessTime,
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useMeetings } from '@/hooks/use-meetings'
import { 
  format,
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'

interface MeetingsCalendarProps {
  searchQuery: string
  filters: any
}

export function MeetingsCalendar({ searchQuery, filters }: MeetingsCalendarProps) {
  const { t } = useTranslation('meetings')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const { data, isLoading } = useMeetings({
    search: searchQuery,
    ...filters,
    startDate: monthStart,
    endDate: monthEnd,
    limit: 1000, // Get all meetings for the month
  })

  const getMeetingsForDay = (date: Date) => {
    return data?.meetings?.filter((meeting: any) => 
      isSameDay(new Date(meeting.scheduledAt), date)
    ) || []
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const meetings = getMeetingsForDay(date)
    if (meetings.length > 0) {
      setDetailsOpen(true)
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Box p={3}>
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Today />}
          onClick={handleToday}
        >
          {t('actions.today', 'Today')}
        </Button>
      </Box>

      {/* Calendar Grid */}
      <Box>
        {/* Week Days Header */}
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1} mb={1}>
          {weekDays.map(day => (
            <Box key={day} textAlign="center" py={1}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Days */}
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
          {days.map(day => {
            const meetings = getMeetingsForDay(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            
            return (
              <Paper
                key={day.toISOString()}
                sx={{
                  p: 1,
                  minHeight: 100,
                  cursor: 'pointer',
                  border: 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  backgroundColor: isCurrentDay ? 'primary.50' : 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => handleDateClick(day)}
              >
                <Typography
                  variant="body2"
                  fontWeight={isCurrentDay ? 600 : 400}
                  color={isCurrentDay ? 'primary.main' : 'text.primary'}
                  gutterBottom
                >
                  {format(day, 'd')}
                </Typography>
                
                {meetings.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {meetings.slice(0, 3).map((meeting: any, index: number) => (
                      <Chip
                        key={meeting._id}
                        label={`${format(new Date(meeting.scheduledAt), 'HH:mm')} ${meeting.title}`}
                        size="small"
                        color={meeting.status === 'live' ? 'success' : 'primary'}
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          '& .MuiChip-label': {
                            px: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    ))}
                    {meetings.length > 3 && (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        +{meetings.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            )
          })}
        </Box>
      </Box>

      {/* Meeting Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {selectedDate && getMeetingsForDay(selectedDate).map((meeting: any) => (
              <ListItem key={meeting._id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: meeting.status === 'live' ? 'success.main' : 'primary.main' }}>
                    <VideoCall />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {meeting.title}
                      </Typography>
                      <Chip 
                        label={meeting.status} 
                        size="small" 
                        color={meeting.status === 'live' ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">
                            {format(new Date(meeting.scheduledAt), 'HH:mm')} - 
                            {meeting.duration} min
                          </Typography>
                        </Box>
                        {meeting.isRecurring && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Schedule fontSize="small" />
                            <Typography variant="body2">
                              {t('types.recurring', 'Recurring')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {meeting.participants?.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <People fontSize="small" />
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                            {meeting.participants.map((p: any) => (
                              <Avatar key={p._id} src={p.profileImage} sx={{ width: 24, height: 24 }}>
                                {p.firstName?.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                          <Typography variant="caption" color="text.secondary">
                            {meeting.participants.length} participants
                          </Typography>
                        </Box>
                      )}
                      {meeting.description && (
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          {meeting.description}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VideoCall />}
                        sx={{ mt: 1 }}
                        onClick={() => window.open(meeting.roomUrl, '_blank')}
                      >
                        {meeting.status === 'live' ? t('actions.join', 'Join') : t('actions.start', 'Start')}
                      </Button>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            {t('common.close', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}