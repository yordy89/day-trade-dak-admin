'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Email,
  Send,
  OpenInNew,
  TouchApp,
  Unsubscribe,
  Block,
  ArrowBack,
  Refresh,
  Download,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

interface CampaignAnalytics {
  _id: string
  campaignId: string
  campaignName: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  marked_spam: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  lastUpdated: string
}

interface MetricCard {
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  color: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [aggregatedMetrics, setAggregatedMetrics] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    totalUnsubscribed: 0,
    avgDeliveryRate: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    avgBounceRate: 0,
  })

  useEffect(() => {
    fetchAnalytics()
    fetchCampaigns()
  }, [timeRange, selectedCampaign])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (timeRange) params.append('timeRange', timeRange)
      if (selectedCampaign && selectedCampaign !== 'all') {
        params.append('campaignId', selectedCampaign)
      }

      const response = await api.get(`/email-marketing/analytics?${params}`)
      setAnalytics(response.data)
      calculateAggregatedMetrics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/email-marketing/campaigns')
      setCampaigns(response.data.campaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const calculateAggregatedMetrics = (data: CampaignAnalytics[]) => {
    if (data.length === 0) {
      setAggregatedMetrics({
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalUnsubscribed: 0,
        avgDeliveryRate: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgBounceRate: 0,
      })
      return
    }

    const totals = data.reduce(
      (acc, curr) => ({
        totalSent: acc.totalSent + curr.sent,
        totalDelivered: acc.totalDelivered + curr.delivered,
        totalOpened: acc.totalOpened + curr.opened,
        totalClicked: acc.totalClicked + curr.clicked,
        totalBounced: acc.totalBounced + curr.bounced,
        totalUnsubscribed: acc.totalUnsubscribed + curr.unsubscribed,
        avgDeliveryRate: acc.avgDeliveryRate + curr.deliveryRate,
        avgOpenRate: acc.avgOpenRate + curr.openRate,
        avgClickRate: acc.avgClickRate + curr.clickRate,
        avgBounceRate: acc.avgBounceRate + curr.bounceRate,
      }),
      {
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalUnsubscribed: 0,
        avgDeliveryRate: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgBounceRate: 0,
      }
    )

    setAggregatedMetrics({
      ...totals,
      avgDeliveryRate: totals.avgDeliveryRate / data.length,
      avgOpenRate: totals.avgOpenRate / data.length,
      avgClickRate: totals.avgClickRate / data.length,
      avgBounceRate: totals.avgBounceRate / data.length,
    })
  }

  const exportAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      if (timeRange) params.append('timeRange', timeRange)
      if (selectedCampaign && selectedCampaign !== 'all') {
        params.append('campaignId', selectedCampaign)
      }
      params.append('format', 'csv')

      const response = await api.get(`/email-marketing/analytics/export?${params}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting analytics:', error)
      toast.error('Failed to export analytics')
    }
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Sent',
      value: aggregatedMetrics.totalSent.toLocaleString(),
      icon: Send,
      color: '#3b82f6',
    },
    {
      title: 'Delivered',
      value: `${aggregatedMetrics.avgDeliveryRate.toFixed(1)}%`,
      change: aggregatedMetrics.totalDelivered,
      icon: Email,
      color: '#16a34a',
    },
    {
      title: 'Open Rate',
      value: `${aggregatedMetrics.avgOpenRate.toFixed(1)}%`,
      change: aggregatedMetrics.totalOpened,
      icon: OpenInNew,
      color: '#f59e0b',
    },
    {
      title: 'Click Rate',
      value: `${aggregatedMetrics.avgClickRate.toFixed(1)}%`,
      change: aggregatedMetrics.totalClicked,
      icon: TouchApp,
      color: '#8b5cf6',
    },
  ]

  const pieChartData = [
    { name: 'Delivered', value: aggregatedMetrics.totalDelivered },
    { name: 'Opened', value: aggregatedMetrics.totalOpened },
    { name: 'Clicked', value: aggregatedMetrics.totalClicked },
    { name: 'Bounced', value: aggregatedMetrics.totalBounced },
    { name: 'Unsubscribed', value: aggregatedMetrics.totalUnsubscribed },
  ]

  const performanceData = analytics.map((a) => ({
    name: a.campaignName.substring(0, 20),
    openRate: a.openRate,
    clickRate: a.clickRate,
    bounceRate: a.bounceRate,
  }))

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/email-marketing')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              Campaign Analytics
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <IconButton onClick={fetchAnalytics}>
              <Refresh />
            </IconButton>
            <IconButton onClick={exportAnalytics}>
              <Download />
            </IconButton>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  label="Campaign"
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign._id} value={campaign._id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          <>
            {/* Metric Cards */}
            <Grid container spacing={3} mb={4}>
              {metricCards.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.title}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography color="text.secondary" variant="body2">
                            {metric.title}
                          </Typography>
                          <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>
                            {metric.value}
                          </Typography>
                          {metric.change !== undefined && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {metric.change.toLocaleString()} total
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: `${metric.color}20`,
                          }}
                        >
                          <metric.icon sx={{ color: metric.color }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Campaign Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="openRate" fill="#f59e0b" name="Open Rate %" />
                      <Bar dataKey="clickRate" fill="#8b5cf6" name="Click Rate %" />
                      <Bar dataKey="bounceRate" fill="#ef4444" name="Bounce Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Engagement
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Campaign Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign Name</TableCell>
                      <TableCell align="right">Sent</TableCell>
                      <TableCell align="right">Delivered</TableCell>
                      <TableCell align="right">Open Rate</TableCell>
                      <TableCell align="right">Click Rate</TableCell>
                      <TableCell align="right">Bounce Rate</TableCell>
                      <TableCell align="right">Unsubscribes</TableCell>
                      <TableCell>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>{row.campaignName}</TableCell>
                        <TableCell align="right">{row.sent.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${row.delivered.toLocaleString()} (${row.deliveryRate.toFixed(
                              1
                            )}%)`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            {row.openRate > aggregatedMetrics.avgOpenRate ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : (
                              <TrendingDown color="error" fontSize="small" />
                            )}
                            <Typography ml={1}>{row.openRate.toFixed(1)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            {row.clickRate > aggregatedMetrics.avgClickRate ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : (
                              <TrendingDown color="error" fontSize="small" />
                            )}
                            <Typography ml={1}>{row.clickRate.toFixed(1)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{row.bounceRate.toFixed(1)}%</TableCell>
                        <TableCell align="right">
                          {row.unsubscribed > 0 && (
                            <Chip
                              label={row.unsubscribed.toString()}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={format(new Date(row.lastUpdated), 'PPpp')}>
                            <Typography variant="body2">
                              {format(new Date(row.lastUpdated), 'MMM dd, yyyy')}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </AdminLayout>
  )
}