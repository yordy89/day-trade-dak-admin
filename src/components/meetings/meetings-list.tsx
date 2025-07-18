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
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useMeetings, useStartMeeting, useEndMeeting } from '@/hooks/use-meetings'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface MeetingsListProps {
  searchQuery: string
  filters: {
    status: string
    type: string
    host: string
    dateRange: string
  }
}

export function MeetingsList({ searchQuery, filters }: MeetingsListProps) {
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
    limit: 10,
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

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'scheduled': return 'info'
      case 'live': return 'error'
      case 'completed': return 'default'
      case 'cancelled': return 'error'
      default: return 'default'
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
      <Stack spacing={2}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="rectangular" height={120} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        {data?.meetings.map((meeting: any) => (
          <Card
            key={meeting._id}
            sx={{
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Meeting Info */}
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(getMeetingTypeColor(meeting.meetingType), 0.1),
                        color: getMeetingTypeColor(meeting.meetingType),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getMeetingTypeIcon(meeting.meetingType)}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {meeting.title}
                      </Typography>
                      {meeting.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {meeting.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={meeting.meetingType.replace(/_/g, ' ').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: alpha(getMeetingTypeColor(meeting.meetingType), 0.1),
                            color: getMeetingTypeColor(meeting.meetingType),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                        {meeting.isRecurring && (
                          <Chip
                            label="Recurring"
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>

                {/* Schedule & Duration */}
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(new Date(meeting.scheduledAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(new Date(meeting.scheduledAt), 'h:mm a')} ({meeting.duration} min)
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Host & Participants */}
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={meeting.host?.profileImage}
                        sx={{ width: 32, height: 32 }}
                      >
                        {meeting.host?.firstName?.charAt(0) || meeting.host?.email?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {meeting.host?.firstName} {meeting.host?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Host
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <People sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {meeting.participants?.length || 0} / {meeting.maxParticipants} participants
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Status & Actions */}
                <Grid item xs={12} md={2}>
                  <Stack spacing={2} alignItems="flex-end">
                    <Chip
                      label={meeting.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(meeting.status)}
                      sx={{
                        fontWeight: 600,
                        ...(meeting.status === 'live' && {
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}` },
                            '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}` },
                            '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                          },
                        }),
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      {(meeting.status === 'scheduled' || meeting.status === 'live') && (
                        <Button
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
                          {meeting.status === 'live' ? 'Join' : 'Start'}
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget)
                          setSelectedMeeting(meeting)
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Pagination */}
      {data && data.total > 10 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(data.total / 10)}
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