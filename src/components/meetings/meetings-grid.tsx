'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  Divider,
  Skeleton,
  Pagination,
  useTheme,
  alpha,
  Tooltip,
  Grid,
  Badge,
} from '@mui/material'
import {
  MoreVert,
  VideoCall,
  Edit,
  Delete,
  ContentCopy,
  Link,
  Schedule,
  CalendarToday,
  AccessTime,
  LiveTv,
  Groups,
  Support,
  Event,
  People,
  Circle,
} from '@mui/icons-material'
import { formatDateTime, formatDuration } from '@/lib/utils'
import { useMeetings, useStartMeeting, useEndMeeting } from '@/hooks/use-meetings'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface MeetingsGridProps {
  searchQuery: string
  filters: {
    status: string
    type: string
    host: string
    dateRange: string
  }
}

export function MeetingsGrid({ searchQuery, filters }: MeetingsGridProps) {
  const { t } = useTranslation('meetings')
  const router = useRouter()
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  
  const startMeetingMutation = useStartMeeting()
  const endMeetingMutation = useEndMeeting()

  const { data, isLoading, deleteMeeting } = useMeetings({
    page,
    limit: 12,
    search: searchQuery,
    ...filters,
  })

  const handleAction = async (action: string, meeting: any) => {
    setAnchorEl(null)

    switch (action) {
      case 'start':
        try {
          await startMeetingMutation.mutateAsync(meeting._id)
          toast.success(t('messages.meetingStarted', 'Meeting started successfully'))
          setTimeout(() => {
            window.open(meeting.roomUrl, '_blank')
          }, 500)
        } catch (error) {
          toast.error(t('messages.error', 'Failed to start meeting'))
        }
        break
      case 'join':
        window.open(meeting.roomUrl, '_blank')
        break
      case 'end':
        if (confirm(t('dialogs.confirmEnd', 'Are you sure you want to end this meeting?'))) {
          try {
            await endMeetingMutation.mutateAsync(meeting._id)
            toast.success(t('messages.meetingEnded', 'Meeting ended successfully'))
          } catch (error) {
            toast.error(t('messages.error', 'Failed to end meeting'))
          }
        }
        break
      case 'edit':
        router.push(`/meetings/${meeting._id}/edit`)
        break
      case 'copy':
        navigator.clipboard.writeText(meeting.roomUrl)
        toast.success(t('messages.linkCopied', 'Meeting link copied to clipboard'))
        break
      case 'delete':
        if (confirm(t('dialogs.confirmDelete', 'Are you sure you want to delete this meeting?'))) {
          try {
            await deleteMeeting(meeting._id)
            toast.success(t('messages.meetingDeleted', 'Meeting deleted successfully'))
          } catch (error) {
            toast.error(t('messages.error', 'Failed to delete meeting'))
          }
        }
        break
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return theme.palette.info.main
      case 'live': return theme.palette.error.main
      case 'completed': return theme.palette.success.main
      case 'cancelled': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_live': return <LiveTv />
      case 'mentorship': return <Groups />
      case 'support': return <Support />
      case 'special_event': return <Event />
      default: return <VideoCall />
    }
  }

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'daily_live': return theme.palette.error.main
      case 'mentorship': return theme.palette.primary.main
      case 'support': return theme.palette.info.main
      case 'special_event': return theme.palette.warning.main
      default: return theme.palette.text.secondary
    }
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {data?.meetings.map((meeting: any) => (
          <Grid item xs={12} sm={6} md={4} key={meeting._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 1,
                }}
              >
                <Badge
                  badgeContent={
                    <Circle
                      sx={{
                        fontSize: 12,
                        color: getStatusColor(meeting.status),
                        ...(meeting.status === 'live' && {
                          animation: 'blink 1s infinite',
                          '@keyframes blink': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.3 },
                          },
                        }),
                      }}
                    />
                  }
                >
                  <Chip
                    label={meeting.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(meeting.status), 0.1),
                      color: getStatusColor(meeting.status),
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}
                  />
                </Badge>
              </Box>

              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(getMeetingTypeColor(meeting.meetingType), 0.1),
                      color: getMeetingTypeColor(meeting.meetingType),
                    }}
                  >
                    {getMeetingTypeIcon(meeting.meetingType)}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {meeting.title}
                    </Typography>
                    <Chip
                      label={meeting.meetingType.replace(/_/g, ' ').toUpperCase()}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                </Stack>

                {/* Meeting Details */}
                <Stack spacing={1.5} flex={1}>
                  {/* Time */}
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <CalendarToday sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" fontWeight={500}>
                        {format(new Date(meeting.scheduledAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(meeting.scheduledAt), 'h:mm a')} • {meeting.duration} min
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Host */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={meeting.host?.profileImage}
                      sx={{ width: 24, height: 24 }}
                    >
                      {meeting.host?.firstName?.charAt(0) || meeting.host?.email?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={500}>
                        {meeting.host?.firstName} {meeting.host?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Host
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Participants */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <People sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary">
                      {meeting.participants?.length || 0} / {meeting.maxParticipants} participants
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                  {(meeting.status === 'scheduled' || meeting.status === 'live') ? (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      color={meeting.status === 'live' ? 'error' : 'primary'}
                      startIcon={<VideoCall />}
                      onClick={() => handleAction(meeting.status === 'live' ? 'join' : 'start', meeting)}
                      sx={{
                        fontWeight: 600,
                        ...(meeting.status === 'live' && {
                          animation: 'pulse 2s infinite',
                        }),
                      }}
                    >
                      {meeting.status === 'live' ? 'Join Now' : 'Start Meeting'}
                    </Button>
                  ) : (
                    <Box />
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget)
                      setSelectedMeeting(meeting)
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {data && data.total > 12 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(data.total / 12)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('copy', selectedMeeting)}>
          <Link sx={{ mr: 1.5, fontSize: 18 }} />
          Copy Link
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit', selectedMeeting)}>
          <Edit sx={{ mr: 1.5, fontSize: 18 }} />
          Edit
        </MenuItem>
        {selectedMeeting?.status === 'live' && (
          <MenuItem onClick={() => handleAction('end', selectedMeeting)}>
            <VideoCall sx={{ mr: 1.5, fontSize: 18, color: theme.palette.error.main }} />
            End Meeting
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => handleAction('delete', selectedMeeting)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1.5, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>
    </Stack>
  )
}