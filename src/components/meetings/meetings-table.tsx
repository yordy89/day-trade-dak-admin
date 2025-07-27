'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid'
import { 
  Box, 
  Chip, 
  Avatar, 
  Typography,
  IconButton,
  Menu,
  MenuItem,
  AvatarGroup,
  Tooltip,
  Button,
  Stack,
  useTheme,
  alpha,
  Divider,
} from '@mui/material'
import { 
  MoreVert, 
  VideoCall,
  Edit,
  Delete,
  ContentCopy,
  Link,
  People,
  Schedule,
  CalendarToday,
  AccessTime,
  LiveTv,
  Groups,
  Support,
  Event,
} from '@mui/icons-material'
import { formatDateTime, formatDuration } from '@/lib/utils'
import { useMeetings, useStartMeeting, useEndMeeting } from '@/hooks/use-meetings'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface MeetingsTableProps {
  searchQuery: string
  filters: {
    status: string
    type: string
    host: string
    dateRange: string
  }
}

export function MeetingsTable({ searchQuery, filters }: MeetingsTableProps) {
  const { t } = useTranslation('meetings')
  const router = useRouter()
  const theme = useTheme()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  
  const startMeetingMutation = useStartMeeting()
  const endMeetingMutation = useEndMeeting()

  const { data, isLoading, deleteMeeting } = useMeetings({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery,
    ...filters,
    sortBy: sortModel[0]?.field,
    sortOrder: sortModel[0]?.sort as 'asc' | 'desc' | undefined,
  })

  const handleAction = async (action: string, meeting: any) => {
    setAnchorEl(null)

    switch (action) {
      case 'start':
        try {
          // First update the meeting status to live
          await startMeetingMutation.mutateAsync(meeting._id)
          toast.success(t('messages.meetingStarted', 'Meeting started successfully'))
          // Then open the meeting room
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
      case 'live': return 'success'
      case 'completed': return 'default'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_live': return <LiveTv fontSize="small" />
      case 'mentorship': return <Groups fontSize="small" />
      case 'support': return <Support fontSize="small" />
      case 'special_event': return <Event fontSize="small" />
      default: return <VideoCall fontSize="small" />
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

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'title',
      headerName: t('columns.meeting', 'Meeting'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: alpha(getMeetingTypeColor(params.row.meetingType), 0.1),
              color: getMeetingTypeColor(params.row.meetingType),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getMeetingTypeIcon(params.row.meetingType)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.row.title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {params.row.meetingType === 'daily_live' && (
                <Chip
                  label="DAILY LIVE"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.main,
                    '& .MuiChip-label': { px: 0.75 }
                  }}
                />
              )}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.7rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}
              >
                Room: {params.row.meetingId}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'type',
      headerName: t('columns.type', 'Type'),
      width: 140,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip 
            label={params.row.isRecurring ? t('types.recurring', 'Recurring') : t('types.oneTime', 'One-time')}
            size="small"
            variant="outlined"
            sx={{
            borderColor: params.row.isRecurring ? theme.palette.secondary.main : theme.palette.divider,
            color: params.row.isRecurring ? theme.palette.secondary.main : theme.palette.text.secondary,
            fontWeight: params.row.isRecurring ? 600 : 400,
            '& .MuiChip-icon': {
              color: params.row.isRecurring ? theme.palette.secondary.main : theme.palette.text.secondary,
            }
          }}
          icon={params.row.isRecurring ? <Schedule fontSize="small" /> : <AccessTime fontSize="small" />}
          />
        </Box>
      ),
    },
    {
      field: 'scheduledAt',
      headerName: t('columns.scheduledTime', 'Scheduled Time'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const scheduledDate = new Date(params.row.scheduledAt)
        const endDate = new Date(scheduledDate.getTime() + params.row.duration * 60000)
        
        return (
          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarToday sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" fontWeight={500}>
                {formatDateTime(scheduledDate, 'MMM dd, yyyy')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
              <AccessTime sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(scheduledDate, 'h:mm a')} - {formatDateTime(endDate, 'h:mm a')}
                {params.row.recurringTime && params.row.isRecurring && ` • Daily at ${params.row.recurringTime}`}
              </Typography>
            </Stack>
          </Box>
        )
      },
    },
    {
      field: 'host',
      headerName: t('columns.host', 'Host'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            src={params.row.host?.profileImage} 
            sx={{ 
              width: 40, 
              height: 40,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {params.row.host?.firstName?.charAt(0) || params.row.host?.email?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.row.host?.firstName} {params.row.host?.lastName}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                display: 'block',
                mt: -0.5,
              }}
            >
              {params.row.host?.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'participants',
      headerName: t('columns.participants', 'Participants'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const participants = params.row.participants || []
        const maxDisplay = 3
        
        if (participants.length === 0) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                {t('participants.none', 'No participants')}
              </Typography>
            </Box>
          )
        }
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <AvatarGroup max={maxDisplay} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
              {participants.map((participant: any) => (
                <Avatar 
                  key={participant._id}
                  src={participant.profileImage}
                  alt={participant.email}
                >
                  {participant.firstName?.charAt(0) || participant.email?.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="caption" color="text.secondary">
              {participants.length} {t('participants.count', 'participants')}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'status',
      headerName: t('columns.status', 'Status'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const isLive = params.row.status === 'live'
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Chip 
            label={String(t(`status.${params.row.status}`, params.row.status)).toUpperCase()} 
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              ...(isLive && {
                bgcolor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}` },
                  '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                },
              }),
              ...(params.row.status === 'scheduled' && {
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                borderColor: theme.palette.info.main,
              }),
              ...(params.row.status === 'completed' && {
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                borderColor: theme.palette.success.main,
              }),
              ...(params.row.status === 'cancelled' && {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
              }),
            }}
            variant={isLive ? 'filled' : 'outlined'}
            />
          </Box>
        )
      },
    },
    {
      field: 'duration',
      headerName: t('columns.duration', 'Duration'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const hours = Math.floor(params.row.duration / 60)
        const minutes = params.row.duration % 60
        const durationText = hours > 0 
          ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
          : `${minutes}m`
          
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.08),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ fontSize: '0.875rem' }}
              >
                {params.row.duration ? durationText : '-'}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'actions',
      headerName: t('columns.actions', 'Actions'),
      width: 180,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }}>
          {(params.row.status === 'scheduled' || params.row.status === 'live') && (
            <Button
              size="small"
              variant="contained"
              color={params.row.status === 'live' ? 'error' : 'primary'}
              startIcon={<VideoCall sx={{ fontSize: 16 }} />}
              onClick={() => handleAction(params.row.status === 'live' ? 'join' : 'start', params.row)}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.7rem',
                px: 1,
                py: 0.4,
                minWidth: 'auto',
                textTransform: 'none',
                height: 28,
                ...(params.row.status === 'live' && {
                  animation: 'pulse 2s infinite',
                }),
              }}
            >
              {params.row.status === 'live' ? t('actions.join', 'Join') : t('actions.start', 'Start')}
            </Button>
          )}
          <Tooltip title={t('actions.moreOptions', 'More options')}>
            <IconButton
              size="small"
              onClick={(e) => {
                setAnchorEl(e.currentTarget)
                setSelectedMeeting(params.row)
              }}
              sx={{
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.1),
                },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedMeeting?._id === params.row._id}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                minWidth: 180,
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <MenuItem onClick={() => handleAction('copy', params.row)}>
              <Link sx={{ mr: 1.5, fontSize: 18 }} />
              {t('actions.copyLink', 'Copy Link')}
            </MenuItem>
            <MenuItem onClick={() => handleAction('edit', params.row)}>
              <Edit sx={{ mr: 1.5, fontSize: 18 }} />
              {t('actions.edit', 'Edit')}
            </MenuItem>
            {params.row.status === 'live' && (
              <MenuItem onClick={() => handleAction('end', params.row)}>
                <VideoCall sx={{ mr: 1.5, fontSize: 18, color: theme.palette.error.main }} />
                {t('actions.endMeeting', 'End Meeting')}
              </MenuItem>
            )}
            <Divider />
            <MenuItem 
              onClick={() => handleAction('delete', params.row)}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1.5, fontSize: 18 }} />
              {t('actions.delete', 'Delete')}
            </MenuItem>
          </Menu>
        </Stack>
      ),
    },
  ], [t, anchorEl, selectedMeeting, theme, getMeetingTypeColor, getMeetingTypeIcon])

  return (
    <Box sx={{ height: 650, width: '100%', overflow: 'auto' }}>
      <DataGrid
        rows={data?.meetings || []}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        pageSizeOptions={[10, 25, 50, 100]}
        rowCount={data?.total || 0}
        paginationMode="server"
        sortingMode="server"
        disableRowSelectionOnClick
        disableColumnMenu
        rowHeight={72}
        sx={{
          border: 'none',
          borderRadius: 2,
          bgcolor: 'background.paper',
          '& .MuiDataGrid-main': {
            borderRadius: 2,
            minWidth: 'max-content',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
            borderBottom: `2px solid ${theme.palette.divider}`,
            fontWeight: 600,
            '&:focus': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              cursor: 'pointer',
            },
            '&:last-child .MuiDataGrid-cell': {
              borderBottom: 'none',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02),
          },
          '& .MuiDataGrid-selectedRowCount': {
            display: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 4,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
              },
            },
          },
        }}
      />
    </Box>
  )
}