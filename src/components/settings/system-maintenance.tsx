'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  CleaningServices,
  Preview,
  PlayArrow,
  Refresh,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Schedule,
  Search,
  Delete,
} from '@mui/icons-material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminMaintenanceService } from '@/services/admin-maintenance.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function SystemMaintenance() {
  const { showSuccess, showError, showInfo } = useSnackbar()
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string>('')

  // Fetch maintenance status
  const { data: status, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: () => adminMaintenanceService.getMaintenanceStatus(),
    enabled: true, // Explicitly enable
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  })

  // State for preview data
  const [preview, setPreview] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cleaningUserId, setCleaningUserId] = useState<string | null>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('SystemMaintenance component mounted')
    return () => {
      console.log('SystemMaintenance component unmounted')
    }
  }, [])
  
  useEffect(() => {
    if (status) {
      console.log('Maintenance status loaded:', status)
    }
    if (statusError) {
      console.error('Maintenance status error:', statusError)
    }
  }, [status, statusError])

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: () => adminMaintenanceService.cleanupExpiredSubscriptions(),
    onSuccess: (data) => {
      showSuccess(
        `Successfully cleaned up ${data.stats.subscriptionsRemoved} expired subscriptions from ${data.stats.usersUpdated} users`
      )
      refetchStatus()
      setConfirmDialogOpen(false)
      // Refresh the preview if it's open
      if (previewDialogOpen && preview) {
        adminMaintenanceService.getExpiredSubscriptionsPreview().then(setPreview)
      }
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to cleanup expired subscriptions')
    },
  })

  // Run all tasks mutation
  const runAllTasksMutation = useMutation({
    mutationFn: (tasks: string[]) => adminMaintenanceService.runAllMaintenanceTasks(tasks),
    onSuccess: (data) => {
      showSuccess('All maintenance tasks completed successfully')
      refetchStatus()
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to run maintenance tasks')
    },
  })

  const handlePreviewClick = async () => {
    setPreviewLoading(true)
    setPreviewDialogOpen(true)
    try {
      console.log('Fetching expired subscriptions preview...')
      const data = await adminMaintenanceService.getExpiredSubscriptionsPreview()
      console.log('Preview data received:', data)
      setPreview(data)
    } catch (error) {
      console.error('Failed to fetch preview:', error)
      toast.error('Failed to fetch expired subscriptions')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleCleanupClick = (task: string) => {
    setSelectedTask(task)
    setConfirmDialogOpen(true)
  }

  const handleConfirmCleanup = () => {
    if (selectedTask === 'expired_subscriptions') {
      cleanupMutation.mutate()
    } else if (selectedTask === 'all_tasks') {
      runAllTasksMutation.mutate(['expired_subscriptions', 'module_permissions'])
    }
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Never'
    return format(new Date(date), 'MMM d, yyyy h:mm a')
  }

  const getDaysExpired = (expirationDate: string | Date) => {
    if (!expirationDate) return 0
    const now = new Date()
    const expired = new Date(expirationDate)
    return Math.floor((now.getTime() - expired.getTime()) / (1000 * 60 * 60 * 24))
  }

  const handleCleanupSingle = async (userId: string, plan: string, userEmail: string) => {
    if (window.confirm(`Are you sure you want to remove the ${plan} subscription for ${userEmail}?`)) {
      setCleaningUserId(userId)
      try {
        await adminMaintenanceService.cleanupSingleSubscription(userId, plan)
        showSuccess(`Successfully removed ${plan} subscription for ${userEmail}`)
        // Refresh the preview
        const data = await adminMaintenanceService.getExpiredSubscriptionsPreview()
        setPreview(data)
        // Refresh the status
        await refetchStatus()
      } catch (error) {
        console.error('Failed to cleanup single subscription:', error)
        showError(`Failed to remove subscription for ${userEmail}`)
      } finally {
        setCleaningUserId(null)
      }
    }
  }

  // Filter subscriptions based on search term
  const filteredSubscriptions = preview?.expiredSubscriptions?.filter((item: any) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.userEmail?.toLowerCase().includes(searchLower) ||
      item.userName?.toLowerCase().includes(searchLower) ||
      item.subscription.plan?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Maintenance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage system maintenance tasks and cleanup operations
      </Typography>
      
      {/* Error Display */}
      {statusError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load maintenance status. Please check your connection and try again.
          <br />
          <Typography variant="caption">
            {(statusError as any)?.message || 'Unknown error'}
          </Typography>
        </Alert>
      )}

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Last Cleanup
                </Typography>
              </Box>
              <Typography variant="h6">
                {statusLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  formatDate(status?.lastCleanupRun || null)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Expired Subscriptions
                </Typography>
              </Box>
              <Typography variant="h6" color={(status?.pendingExpiredSubscriptions ?? 0) > 0 ? 'warning.main' : 'text.primary'}>
                {statusLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    {status?.pendingExpiredSubscriptions || 0}
                    {(status?.pendingExpiredSubscriptions ?? 0) > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Click Preview to see details)
                      </Typography>
                    )}
                  </>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Failed Payments (24h)
                </Typography>
              </Box>
              <Typography variant="h6">
                {statusLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  status?.failedTransactionsLast24h || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Info sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Next Scheduled
                </Typography>
              </Box>
              <Typography variant="h6">
                {statusLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  formatDate(status?.nextScheduledCleanup || null)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Maintenance Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expired Subscriptions Cleanup
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Remove expired subscriptions from user accounts. This is the same process
                that runs automatically every midnight.
              </Typography>
              
              {(status?.pendingExpiredSubscriptions ?? 0) > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  There are {status?.pendingExpiredSubscriptions || 0} expired subscription(s) that need to be cleaned up.
                </Alert>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<Preview />}
                onClick={handlePreviewClick}
                disabled={previewLoading}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CleaningServices />}
                onClick={() => handleCleanupClick('expired_subscriptions')}
                disabled={cleanupMutation.isPending || (status?.pendingExpiredSubscriptions ?? 0) === 0}
              >
                Clean Up Now
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Run All Maintenance Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Execute all maintenance tasks including expired subscriptions cleanup,
                module permissions cleanup, and more.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                This will run multiple maintenance tasks in sequence. Check the logs for detailed results.
              </Alert>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrow />}
                onClick={() => handleCleanupClick('all_tasks')}
                disabled={runAllTasksMutation.isPending}
              >
                Run All Tasks
              </Button>
              <Tooltip title="Refresh Status">
                <IconButton
                  onClick={() => refetchStatus()}
                  disabled={statusLoading}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Preview Expired Subscriptions</Typography>
            <Box>
              {preview?.totalCount > 0 && (
                <>
                  <Chip 
                    label={`${preview.totalCount} subscription${preview.totalCount > 1 ? 's' : ''}`}
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`${preview.usersAffected || 0} user${preview.usersAffected !== 1 ? 's' : ''}`}
                    color="info"
                    size="small"
                  />
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : preview?.expiredSubscriptions?.length > 0 ? (
            <>
              {/* Search Box */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, email or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Summary Stats */}
              <Box sx={{ mb: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  The following subscriptions have expired and should be cleaned up. These users will lose access to their subscription features once cleaned.
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {preview.totalCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Expired Subscriptions
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {preview.usersAffected || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users Affected
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {preview.expiredSubscriptions.filter((s: any) => s.subscription.daysExpired > 30).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expired 30+ Days
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Expired Date</TableCell>
                    <TableCell>Days Expired</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubscriptions?.length > 0 ? filteredSubscriptions.map((item: any, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.userName || item.userEmail.split('@')[0]}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.userEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.subscription.plan ? item.subscription.plan.replace(/([A-Z])/g, ' $1').trim() : 'Unknown Plan'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.subscription.status || 'active'}
                          size="small"
                          color={item.subscription.status === 'active' ? 'default' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatDate(item.subscription.expiresAt || item.subscription.currentPeriodEnd)}>
                          <Typography variant="body2">
                            {new Date(item.subscription.expiresAt || item.subscription.currentPeriodEnd).toLocaleDateString()}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${item.subscription.daysExpired} days`}
                          color={item.subscription.daysExpired > 30 ? 'error' : item.subscription.daysExpired > 7 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {item.subscription.stripeSubscriptionId ? 'Recurring' : 'Manual'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Copy User ID">
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => {
                              navigator.clipboard.writeText(item.userId)
                              showInfo('User ID copied to clipboard')
                            }}
                          >
                            {item.userId.substring(0, 8)}...
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove this expired subscription">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCleanupSingle(item.userId, item.subscription.plan || 'unknown', item.userEmail)}
                            disabled={cleaningUserId === item.userId || !item.subscription.plan}
                          >
                            {cleaningUserId === item.userId ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Delete fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No subscriptions match your search criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          ) : (
            <Alert severity="success">
              No expired subscriptions found. The database is clean!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {preview?.totalCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CleaningServices />}
              onClick={() => {
                setPreviewDialogOpen(false)
                handleCleanupClick('expired_subscriptions')
              }}
            >
              Clean Up Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1, color: 'warning.main' }} />
            Confirm Maintenance Task
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedTask === 'expired_subscriptions' 
              ? 'Are you sure you want to clean up all expired subscriptions? This will remove expired subscriptions from user accounts.'
              : 'Are you sure you want to run all maintenance tasks? This includes cleaning up expired subscriptions and module permissions.'
            }
          </Typography>
          {selectedTask === 'expired_subscriptions' && (status?.pendingExpiredSubscriptions ?? 0) > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This will affect {status?.pendingExpiredSubscriptions || 0} subscription(s).
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            disabled={cleanupMutation.isPending || runAllTasksMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmCleanup}
            disabled={cleanupMutation.isPending || runAllTasksMutation.isPending}
            startIcon={
              cleanupMutation.isPending || runAllTasksMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircle />
              )
            }
          >
            {cleanupMutation.isPending || runAllTasksMutation.isPending ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}