'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  Send,
  ContentCopy,
  Schedule,
  Email,
  People,
  Analytics,
  AccessTime,
  CheckCircle,
  Error,
  Warning,
  MoreVert,
  Visibility,
  Download,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface Campaign {
  _id: string
  name: string
  subject: string
  previewText?: string
  type: string
  status: string
  recipientCount: number
  scheduledDate?: string
  sentDate?: string
  createdAt: string
  updatedAt: string
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  templateId?: {
    _id: string
    name: string
    category: string
  }
  recipientFilters?: any
  recipientEmails?: string[]
  htmlContent?: string
  analytics?: {
    sent?: number
    delivered?: number
    opened?: number
    clicked?: number
    bounced?: number
    unsubscribed?: number
    complained?: number
  }
  testEmails?: string[]
}

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
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
  cancelled: 'default',
}

const statusIcons: Record<string, React.ReactElement> = {
  draft: <Edit fontSize="small" />,
  scheduled: <Schedule fontSize="small" />,
  sending: <CircularProgress size={16} />,
  sent: <CheckCircle fontSize="small" />,
  failed: <Error fontSize="small" />,
  cancelled: <Warning fontSize="small" />,
}

interface Recipient {
  _id?: string
  recipientEmail: string
  userId?: string
  sent?: boolean
  delivered?: boolean
  opened?: boolean
  clicked?: boolean
  bounced?: boolean
  unsubscribed?: boolean
  complained?: boolean
  sentAt?: string
  deliveredAt?: string
  firstOpenedAt?: string
  firstClickedAt?: string
  openCount?: number
  clickCount?: number
}

export default function CampaignDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientsLoading, setRecipientsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCampaign()
    }
  }, [params.id])

  useEffect(() => {
    // Fetch recipients when viewing the Recipients tab for a sent campaign
    // OR if the campaign has recipientEmails array populated
    if (campaign && tabValue === 2 && (campaign.status === 'sent' || (campaign.recipientEmails && campaign.recipientEmails.length > 0))) {
      fetchRecipients()
    }
  }, [campaign, tabValue])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/email-marketing/campaigns/${params.id}`)
      setCampaign(response.data)
      console.log('Campaign loaded:', response.data)
      console.log('Campaign status:', response.data.status)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to load campaign')
      router.push('/email-marketing')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      setRecipientsLoading(true)
      const response = await api.get(`/email-marketing/analytics/campaigns/${params.id}`)
      console.log('Analytics response:', response.data)
      console.log('Recipients array:', response.data.recipients)
      console.log('Recipients count:', response.data.recipients?.length)
      
      if (response.data.recipients && Array.isArray(response.data.recipients)) {
        setRecipients(response.data.recipients)
        console.log('Set recipients state with', response.data.recipients.length, 'recipients')
      } else {
        // No recipients data yet
        console.log('No recipients in response, setting empty array')
        setRecipients([])
      }
    } catch (error: any) {
      console.error('Error fetching recipients:', error)
      // Don't show error toast if campaign hasn't been sent yet
      if (error?.response?.status === 404) {
        // No analytics data yet - this is normal for unsent campaigns
        console.log('404 - No analytics endpoint found')
        setRecipients([])
      } else {
        toast.error('Failed to load recipient data')
      }
    } finally {
      setRecipientsLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!campaign) return

    try {
      await api.post(`/email-marketing/campaigns/${campaign._id}/send`)
      toast.success('Campaign sent successfully')
      fetchCampaign()
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    }
  }

  const handleDuplicateCampaign = async () => {
    if (!campaign) return

    try {
      const response = await api.post(`/email-marketing/campaigns/${campaign._id}/duplicate`)
      toast.success('Campaign duplicated successfully')
      router.push(`/email-marketing/${response.data._id}`)
    } catch (error) {
      console.error('Error duplicating campaign:', error)
      toast.error('Failed to duplicate campaign')
    }
  }

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
  }

  const handleConfirmDelete = async () => {
    // Use params.id if campaign._id is not available
    const campaignId = campaign?._id || params.id
    
    if (!campaignId) {
      toast.error('Campaign ID not found')
      return
    }

    setDeleteLoading(true)
    try {
      await api.delete(`/email-marketing/campaigns/${campaignId}`)
      toast.success('Campaign deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/email-marketing')
    } catch (error: any) {
      console.error('Error deleting campaign:', error)
      // Show more specific error message if available
      const errorMessage = error?.response?.data?.message || 'Failed to delete campaign'
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getOpenRate = () => {
    if (!campaign?.analytics?.sent || campaign.analytics.sent === 0) return '0%'
    const rate = ((campaign.analytics.opened || 0) / campaign.analytics.sent) * 100
    return `${rate.toFixed(1)}%`
  }

  const getClickRate = () => {
    if (!campaign?.analytics?.sent || campaign.analytics.sent === 0) return '0%'
    const rate = ((campaign.analytics.clicked || 0) / campaign.analytics.sent) * 100
    return `${rate.toFixed(1)}%`
  }

  const getBounceRate = () => {
    if (!campaign?.analytics?.sent || campaign.analytics.sent === 0) return '0%'
    const rate = ((campaign.analytics.bounced || 0) / campaign.analytics.sent) * 100
    return `${rate.toFixed(1)}%`
  }

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  if (!campaign) {
    return (
      <AdminLayout>
        <Alert severity="error">Campaign not found</Alert>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box position="relative">
        {/* Floating Delete Button - Always Visible */}
        <Button
          variant="contained"
          color="error"
          startIcon={<Delete />}
          onClick={handleOpenDeleteDialog}
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#d32f2f',
            color: 'white',
            '&:hover': { 
              backgroundColor: '#c62828' 
            }
          }}
        >
          Delete Campaign
        </Button>

        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => router.push('/email-marketing')}>
              <ArrowBack />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700}>
                {campaign.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Chip
                  label={campaign.status}
                  color={statusColors[campaign.status] || 'default'}
                  size="small"
                  icon={statusIcons[campaign.status]}
                />
                <Typography variant="body2" color="text.secondary">
                  Created {format(new Date(campaign.createdAt), 'PPP')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons Row - Force render all buttons */}
          <Box display="flex" gap={2} flexWrap="wrap" sx={{ minHeight: '48px' }}>
            {/* Conditional buttons */}
            {campaign.status === 'draft' ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => router.push(`/email-marketing/${campaign._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSendCampaign}
                >
                  Send Campaign
                </Button>
              </>
            ) : null}
            
            {campaign.status === 'scheduled' ? (
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => router.push(`/email-marketing/${campaign._id}/schedule`)}
              >
                Reschedule
              </Button>
            ) : null}
            
            {/* Always visible buttons */}
            <Button
              key="duplicate-btn"
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleDuplicateCampaign}
            >
              Duplicate
            </Button>
            
            <IconButton 
              key="menu-btn"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
              {campaign.status === 'draft' && (
                <MenuItem onClick={() => {
                  router.push(`/email-marketing/${campaign._id}/edit`)
                  setAnchorEl(null)
                }}>
                  <Edit fontSize="small" sx={{ mr: 1 }} />
                  Edit Campaign
                </MenuItem>
              )}
              {campaign.status === 'scheduled' && (
                <MenuItem onClick={() => {
                  router.push(`/email-marketing/${campaign._id}/schedule`)
                  setAnchorEl(null)
                }}>
                  <Schedule fontSize="small" sx={{ mr: 1 }} />
                  Reschedule
                </MenuItem>
              )}
              <MenuItem onClick={() => {
                router.push(`/email-marketing/analytics?campaignId=${campaign._id}`)
                setAnchorEl(null)
              }}>
                <Analytics fontSize="small" sx={{ mr: 1 }} />
                View Analytics
              </MenuItem>
              <MenuItem onClick={() => {
                // Export campaign data
                toast('Export feature coming soon')
                setAnchorEl(null)
              }}>
                <Download fontSize="small" sx={{ mr: 1 }} />
                Export Data
              </MenuItem>
            </Menu>
        </Box>

        {/* Campaign Info Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <People color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Recipients
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {campaign.recipientCount.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Email color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Sent
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {(campaign.analytics?.sent || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Visibility color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Open Rate
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {getOpenRate()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.analytics?.opened || 0} opened
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Analytics color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Click Rate
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {getClickRate()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.analytics?.clicked || 0} clicked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Details" />
            <Tab label="Content" />
            <Tab label="Recipients" />
            <Tab label="Analytics" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Details Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Campaign Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Subject"
                        secondary={campaign.subject}
                      />
                    </ListItem>
                    {campaign.previewText && (
                      <ListItem>
                        <ListItemText
                          primary="Preview Text"
                          secondary={campaign.previewText}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText
                        primary="Type"
                        secondary={campaign.type}
                      />
                    </ListItem>
                    {campaign.templateId && (
                      <ListItem>
                        <ListItemText
                          primary="Template"
                          secondary={`${campaign.templateId.name} (${campaign.templateId.category})`}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText
                        primary="Created By"
                        secondary={`${campaign.createdBy.firstName} ${campaign.createdBy.lastName} (${campaign.createdBy.email})`}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Timing
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Created"
                        secondary={format(new Date(campaign.createdAt), 'PPpp')}
                      />
                    </ListItem>
                    {campaign.scheduledDate && (
                      <ListItem>
                        <ListItemText
                          primary="Scheduled For"
                          secondary={format(new Date(campaign.scheduledDate), 'PPpp')}
                        />
                      </ListItem>
                    )}
                    {campaign.sentDate && (
                      <ListItem>
                        <ListItemText
                          primary="Sent At"
                          secondary={format(new Date(campaign.sentDate), 'PPpp')}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText
                        primary="Last Updated"
                        secondary={format(new Date(campaign.updatedAt), 'PPpp')}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Content Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Email Preview</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => {
                      const win = window.open('', '_blank')
                      if (win && campaign.htmlContent) {
                        win.document.write(campaign.htmlContent)
                      }
                    }}
                  >
                    Open in New Tab
                  </Button>
                </Box>
                
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    maxHeight: 600,
                    overflow: 'auto',
                  }}
                >
                  {campaign.htmlContent ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: campaign.htmlContent }}
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: 1.6,
                      }}
                    />
                  ) : (
                    <Alert severity="info">No content available</Alert>
                  )}
                </Paper>
              </Box>
            </TabPanel>

            {/* Recipients Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box>
                {/* Recipient Filters Section */}
                {campaign.recipientFilters && Object.keys(campaign.recipientFilters).length > 0 && (
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                      Recipient Filters Used
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(campaign.recipientFilters).map(([key, value]: [string, any]) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) return null
                        
                        return (
                          <Grid item xs={12} md={6} key={key}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Typography>
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </Typography>
                            </Paper>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Box>
                )}

                {/* Recipients List Table */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recipients List ({campaign.recipientCount} total)
                  </Typography>
                  
                  {campaign.status === 'sent' || (campaign.recipientEmails && campaign.recipientEmails.length > 0) ? (
                    recipientsLoading ? (
                      <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                      </Box>
                    ) : recipients.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Email</TableCell>
                              <TableCell align="center">Delivered</TableCell>
                              <TableCell align="center">Opened</TableCell>
                              <TableCell align="center">Clicked</TableCell>
                              <TableCell align="center">Bounced</TableCell>
                              <TableCell align="center">Unsubscribed</TableCell>
                              <TableCell>Sent At</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recipients.map((recipient, index) => (
                              <TableRow key={recipient._id || index} hover>
                                <TableCell>{recipient.recipientEmail}</TableCell>
                                <TableCell align="center">
                                  {recipient.delivered ? (
                                    <CheckCircle color="success" fontSize="small" />
                                  ) : (
                                    <Error color="disabled" fontSize="small" />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {recipient.opened ? (
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                      <CheckCircle color="info" fontSize="small" />
                                      {recipient.openCount && recipient.openCount > 1 && (
                                        <Typography variant="caption">({recipient.openCount})</Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {recipient.clicked ? (
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                      <CheckCircle color="primary" fontSize="small" />
                                      {recipient.clickCount && recipient.clickCount > 1 && (
                                        <Typography variant="caption">({recipient.clickCount})</Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {recipient.bounced ? (
                                    <Warning color="error" fontSize="small" />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {recipient.unsubscribed ? (
                                    <Error color="error" fontSize="small" />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                                <TableCell>
                                  {recipient.sentAt ? format(new Date(recipient.sentAt), 'MMM dd, HH:mm') : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">No recipient data available yet</Alert>
                    )
                  ) : (
                    <Alert severity="info">
                      Recipient tracking data will be available after the campaign is sent
                    </Alert>
                  )}
                </Box>

                {/* Test Emails Section */}
                {campaign.testEmails && campaign.testEmails.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Test Emails Sent To
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography>
                        {campaign.testEmails.join(', ')}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={3}>
              {campaign.status === 'sent' ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Campaign Performance
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Sent</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.sent || 0}
                            </TableCell>
                            <TableCell align="right">100%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Delivered</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.delivered || 0}
                            </TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.sent
                                ? `${(((campaign.analytics?.delivered || 0) / campaign.analytics.sent) * 100).toFixed(1)}%`
                                : '0%'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Opened</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.opened || 0}
                            </TableCell>
                            <TableCell align="right">{getOpenRate()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Clicked</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.clicked || 0}
                            </TableCell>
                            <TableCell align="right">{getClickRate()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Bounced</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.bounced || 0}
                            </TableCell>
                            <TableCell align="right">{getBounceRate()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Unsubscribed</TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.unsubscribed || 0}
                            </TableCell>
                            <TableCell align="right">
                              {campaign.analytics?.sent
                                ? `${(((campaign.analytics?.unsubscribed || 0) / campaign.analytics.sent) * 100).toFixed(1)}%`
                                : '0%'}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Analytics will be available after the campaign is sent
                </Alert>
              )}
            </TabPanel>
          </Box>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'error.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Delete />
            Delete Campaign
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete the campaign <strong>"{campaign?.name}"</strong>?
              </Typography>
              
              {campaign?.status === 'sent' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    This campaign has been sent. Deleting it will also remove all analytics data and tracking information.
                  </Typography>
                </Alert>
              )}
              
              {campaign?.status === 'sending' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    This campaign is currently being sent. Deleting it may interrupt the sending process.
                  </Typography>
                </Alert>
              )}
              
              {campaign?.recipientCount > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    This campaign was sent to {campaign.recipientCount} recipient{campaign.recipientCount > 1 ? 's' : ''}.
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 600 }}>
                This action cannot be undone.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDeleteDialog}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  )
}