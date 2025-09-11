'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material'
import {
  Add,
  Email,
  MoreVert,
  Search,
  Send,
  Schedule,
  ContentCopy,
  Delete,
  Edit,
  Visibility,
  FilterList,
  Download,
  Analytics,
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
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  analytics?: {
    sent?: number
    delivered?: number
    opened?: number
    clicked?: number
    bounced?: number
    unsubscribed?: number
  }
}

const statusColors = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
  cancelled: 'default',
} as const

export default function EmailMarketingPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [avgOpenRate, setAvgOpenRate] = useState<number>(0)
  const [avgClickRate, setAvgClickRate] = useState<number>(0)

  useEffect(() => {
    fetchCampaigns()
  }, [filters, pagination.page])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await api.get(`/email-marketing/campaigns?${params}`)
      setCampaigns(response.data.campaigns)
      setPagination(response.data.pagination)
      
      // Calculate average open and click rates from sent campaigns
      const sentCampaigns = response.data.campaigns.filter((c: Campaign) => 
        c.status === 'sent' && c.analytics?.sent && c.analytics.sent > 0
      )
      
      if (sentCampaigns.length > 0) {
        const totalOpenRate = sentCampaigns.reduce((sum: number, c: Campaign) => {
          const rate = c.analytics?.opened ? (c.analytics.opened / c.analytics.sent!) * 100 : 0
          return sum + rate
        }, 0)
        
        const totalClickRate = sentCampaigns.reduce((sum: number, c: Campaign) => {
          const rate = c.analytics?.clicked ? (c.analytics.clicked / c.analytics.sent!) * 100 : 0
          return sum + rate
        }, 0)
        
        setAvgOpenRate(totalOpenRate / sentCampaigns.length)
        setAvgClickRate(totalClickRate / sentCampaigns.length)
      } else {
        setAvgOpenRate(0)
        setAvgClickRate(0)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setAnchorEl(event.currentTarget)
    setSelectedCampaign(campaign)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCampaign(null)
  }

  const handleSendCampaign = async () => {
    if (!selectedCampaign) return

    try {
      await api.post(`/email-marketing/campaigns/${selectedCampaign._id}/send`)
      toast.success('Campaign sent successfully')
      handleMenuClose()
      fetchCampaigns()
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    }
  }

  const handleDuplicateCampaign = async () => {
    if (!selectedCampaign) return

    try {
      await api.post(`/email-marketing/campaigns/${selectedCampaign._id}/duplicate`)
      toast.success('Campaign duplicated successfully')
      handleMenuClose()
      fetchCampaigns()
    } catch (error) {
      console.error('Error duplicating campaign:', error)
      toast.error('Failed to duplicate campaign')
    }
  }

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return

    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      await api.delete(`/email-marketing/campaigns/${selectedCampaign._id}`)
      toast.success('Campaign deleted successfully')
      handleMenuClose()
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const getOpenRate = (campaign: Campaign) => {
    if (!campaign.analytics?.sent || campaign.analytics.sent === 0) return '0%'
    const rate = (campaign.analytics.opened || 0) / campaign.analytics.sent * 100
    return `${rate.toFixed(1)}%`
  }

  const getClickRate = (campaign: Campaign) => {
    if (!campaign.analytics?.sent || campaign.analytics.sent === 0) return '0%'
    const rate = (campaign.analytics.clicked || 0) / campaign.analytics.sent * 100
    return `${rate.toFixed(1)}%`
  }

  return (
    <AdminLayout>
      <Box>
        {/* Page Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Email Marketing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage email campaigns, newsletters, and marketing automation
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => router.push('/email-marketing/analytics')}
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => router.push('/email-marketing/templates')}
            >
              Templates
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/email-marketing/create')}
            >
              Create Campaign
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Campaigns
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {pagination.total}
                  </Typography>
                </Box>
                <Email color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Campaigns
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
                  </Typography>
                </Box>
                <Send color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Open Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {avgOpenRate > 0 ? `${avgOpenRate.toFixed(1)}%` : 'N/A'}
                  </Typography>
                  {avgOpenRate > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      From sent campaigns
                    </Typography>
                  )}
                </Box>
                <Visibility color="info" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Click Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {avgClickRate > 0 ? `${avgClickRate.toFixed(1)}%` : 'N/A'}
                  </Typography>
                  {avgClickRate > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      From sent campaigns
                    </Typography>
                  )}
                </Box>
                <Analytics color="warning" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Box display="flex" gap={2} mb={3} alignItems="center">
          <TextField
            size="small"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchCampaigns()}
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="sending">Sending</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="immediate">Immediate</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="recurring">Recurring</MenuItem>
              <MenuItem value="triggered">Triggered</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            startIcon={<FilterList />}
            onClick={() => {
              setFilters({ status: 'all', type: 'all' })
              setSearchQuery('')
            }}
          >
            Clear
          </Button>
        </Box>

        {/* Campaigns Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Open Rate</TableCell>
                <TableCell>Click Rate</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary">
                      No campaigns found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {campaign.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {campaign.subject}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" textTransform="capitalize">
                        {campaign.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        size="small"
                        color={statusColors[campaign.status as keyof typeof statusColors]}
                      />
                    </TableCell>
                    <TableCell>{campaign.recipientCount.toLocaleString()}</TableCell>
                    <TableCell>{getOpenRate(campaign)}</TableCell>
                    <TableCell>{getClickRate(campaign)}</TableCell>
                    <TableCell>
                      {campaign.sentDate
                        ? format(new Date(campaign.sentDate), 'MMM dd, yyyy')
                        : campaign.scheduledDate
                        ? `Scheduled: ${format(new Date(campaign.scheduledDate), 'MMM dd, yyyy')}`
                        : format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {campaign.createdBy.firstName} {campaign.createdBy.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, campaign)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              router.push(`/email-marketing/${selectedCampaign?._id}`)
              handleMenuClose()
            }}
          >
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          {selectedCampaign?.status === 'draft' && (
            <>
              <MenuItem
                onClick={() => {
                  router.push(`/email-marketing/${selectedCampaign._id}/edit`)
                  handleMenuClose()
                }}
              >
                <Edit sx={{ mr: 1 }} fontSize="small" />
                Edit
              </MenuItem>
              <MenuItem onClick={handleSendCampaign}>
                <Send sx={{ mr: 1 }} fontSize="small" />
                Send Now
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push(`/email-marketing/${selectedCampaign._id}/schedule`)
                  handleMenuClose()
                }}
              >
                <Schedule sx={{ mr: 1 }} fontSize="small" />
                Schedule
              </MenuItem>
            </>
          )}
          <MenuItem onClick={handleDuplicateCampaign}>
            <ContentCopy sx={{ mr: 1 }} fontSize="small" />
            Duplicate
          </MenuItem>
          {selectedCampaign?.status !== 'sent' &&
            selectedCampaign?.status !== 'sending' && (
              <MenuItem onClick={handleDeleteCampaign} sx={{ color: 'error.main' }}>
                <Delete sx={{ mr: 1 }} fontSize="small" />
                Delete
              </MenuItem>
            )}
        </Menu>
      </Box>
    </AdminLayout>
  )
}