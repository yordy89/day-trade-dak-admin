'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  FileText,
  Download,
  Calendar,
  TrendUp,
  Users,
  CreditCard,
  Clock,
  Info,
  File,
  Table,
  FileCsv
} from '@phosphor-icons/react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslation } from 'react-i18next'
import { analyticsService, ReportType } from '@/services/analytics.service'
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

interface ReportTemplate {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: ReportType['type']
  defaultFormat: ReportType['format']
  color: string
  available: boolean
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'daily',
    title: 'Daily Summary Report',
    description: 'Complete overview of daily revenue, transactions, and key metrics',
    icon: <Calendar size={24} />,
    type: 'daily',
    defaultFormat: 'excel',
    color: '#16a34a',
    available: true
  },
  {
    id: 'weekly',
    title: 'Weekly Performance Report',
    description: 'Week-over-week comparison with trends and insights',
    icon: <TrendUp size={24} />,
    type: 'weekly',
    defaultFormat: 'excel',
    color: '#0ea5e9',
    available: true
  },
  {
    id: 'monthly',
    title: 'Monthly Financial Report',
    description: 'Comprehensive monthly P&L, subscription metrics, and revenue analysis',
    icon: <FileText size={24} />,
    type: 'monthly',
    defaultFormat: 'excel',
    color: '#8b5cf6',
    available: true
  },
  {
    id: 'quarterly',
    title: 'Quarterly Business Review',
    description: 'Executive summary with quarter performance and growth metrics',
    icon: <TrendUp size={24} />,
    type: 'quarterly',
    defaultFormat: 'excel',
    color: '#f97316',
    available: true
  },
  {
    id: 'yearly',
    title: 'Annual Summary Report',
    description: 'Year-end comprehensive report with all metrics and trends',
    icon: <Calendar size={24} />,
    type: 'yearly',
    defaultFormat: 'excel',
    color: '#ec4899',
    available: true
  },
  {
    id: 'revenue-analysis',
    title: 'Revenue Analysis Report',
    description: 'Detailed revenue breakdown by plan, payment method, and trends',
    icon: <TrendUp size={24} />,
    type: 'revenue-analysis',
    defaultFormat: 'excel',
    color: '#06b6d4',
    available: true
  },
  {
    id: 'user-growth',
    title: 'User Growth Report',
    description: 'User acquisition, retention, and engagement metrics',
    icon: <Users size={24} />,
    type: 'user-growth',
    defaultFormat: 'excel',
    color: '#10b981',
    available: true
  },
  {
    id: 'subscription-analytics',
    title: 'Subscription Analytics',
    description: 'MRR, churn analysis, and subscription lifecycle insights',
    icon: <CreditCard size={24} />,
    type: 'subscription-analytics',
    defaultFormat: 'excel',
    color: '#84cc16',
    available: true
  },
  {
    id: 'payment-performance',
    title: 'Payment Performance Report',
    description: 'Success rates, failure analysis, and payment method trends',
    icon: <CreditCard size={24} />,
    type: 'payment-performance',
    defaultFormat: 'excel',
    color: '#a855f7',
    available: true
  },
  {
    id: 'customer-insights',
    title: 'Customer Insights Report',
    description: 'Customer lifetime value, segmentation, and behavior analysis',
    icon: <Users size={24} />,
    type: 'customer-insights',
    defaultFormat: 'excel',
    color: '#f59e0b',
    available: true
  }
]

export default function ReportsPage() {
  const { t } = useTranslation()
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Recent reports will be stored in localStorage for now
  const [recentReports, setRecentReports] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('recentReports')
      if (!stored) return []
      
      // Parse and validate dates
      const reports = JSON.parse(stored)
      return reports.map((report: any) => ({
        ...report,
        generatedAt: new Date(report.generatedAt)
      })).filter((report: any) => !isNaN(report.generatedAt.getTime()))
    } catch (error) {
      console.error('Error loading recent reports:', error)
      // Clear corrupted data
      localStorage.removeItem('recentReports')
      return []
    }
  })

  const handleReportSelect = (report: ReportTemplate) => {
    setSelectedReport(report)
    setReportFormat(report.defaultFormat)
    
    // Set default date range based on report type
    const now = new Date()
    switch (report.type) {
      case 'daily':
        setDateRange({
          start: now,
          end: now
        })
        break
      case 'weekly':
        setDateRange({
          start: subDays(now, 7),
          end: now
        })
        break
      case 'monthly':
        setDateRange({
          start: startOfMonth(now),
          end: endOfMonth(now)
        })
        break
      case 'quarterly':
        setDateRange({
          start: startOfQuarter(now),
          end: endOfQuarter(now)
        })
        break
      case 'yearly':
        setDateRange({
          start: startOfYear(now),
          end: endOfYear(now)
        })
        break
      case 'custom':
        setDateRange({
          start: subDays(now, 30),
          end: now
        })
        break
    }
    
    setDialogOpen(true)
  }

  const handleGenerateReport = async () => {
    if (!selectedReport) return

    setGenerating(true)
    setError(null)

    try {
      const blob = await analyticsService.generateReport({
        type: selectedReport.type,
        format: reportFormat,
        dateRange,
        includeCharts: reportFormat === 'pdf'
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedReport.id}-${format(dateRange.start, 'yyyy-MM-dd')}-to-${format(dateRange.end, 'yyyy-MM-dd')}.${reportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setDialogOpen(false)
      
      // Save to recent reports
      const newReport = {
        id: Date.now().toString(),
        name: `${selectedReport.title} - ${format(dateRange.start, 'MMM dd')} to ${format(dateRange.end, 'MMM dd, yyyy')}`,
        type: selectedReport.type,
        format: reportFormat,
        generatedAt: new Date(),
        size: (blob.size / (1024 * 1024)).toFixed(2) + ' MB'
      }
      
      const updatedReports = [newReport, ...recentReports.slice(0, 9)] // Keep last 10
      setRecentReports(updatedReports)
      localStorage.setItem('recentReports', JSON.stringify(updatedReports))
    } catch (err: any) {
      console.error('Failed to generate report:', err)
      setError(err.response?.data?.message || 'Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const getFormatIcon = (formatType: string) => {
    switch (formatType) {
      case 'pdf':
        return <File size={20} />
      case 'excel':
        return <Table size={20} />
      case 'csv':
        return <FileCsv size={20} />
      default:
        return <FileText size={20} />
    }
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('Reports Center')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('Generate comprehensive reports for your business analytics')}
          </Typography>
        </Box>

        {/* Report Templates */}
        <Box mb={6}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {t('Available Reports')}
          </Typography>
          <Grid container spacing={3}>
            {reportTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: template.available ? 'pointer' : 'default',
                    opacity: template.available ? 1 : 0.6,
                    transition: 'all 0.2s',
                    '&:hover': template.available ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    } : {}
                  }}
                  onClick={() => template.available && handleReportSelect(template)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${template.color}20`,
                          color: template.color
                        }}
                      >
                        {template.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {t(template.title)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(template.description)}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip
                          label={t(template.type)}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={template.defaultFormat.toUpperCase()}
                          size="small"
                          variant="outlined"
                          icon={getFormatIcon(template.defaultFormat)}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      disabled={!template.available}
                      startIcon={<Download size={16} />}
                    >
                      {t('Generate Report')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Reports */}
        {recentReports && recentReports.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {t('Recent Reports')}
            </Typography>
            <Paper>
              <Stack spacing={2} sx={{ p: 2 }}>
                {recentReports.map((report) => (
                  <Box
                    key={report.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        {getFormatIcon(report.format)}
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {report.name}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            {report.generatedAt instanceof Date && !isNaN(report.generatedAt.getTime()) 
                              ? format(report.generatedAt, 'MMM dd, yyyy HH:mm')
                              : 'Unknown date'
                            }
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.size}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Tooltip title={t('Download')}>
                      <IconButton size="small">
                        <Download size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Report Generation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedReport && t(`Generate ${selectedReport.title}`)}
          </DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <DatePicker
                  label={t('Start Date')}
                  value={dateRange.start}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />

                <DatePicker
                  label={t('End Date')}
                  value={dateRange.end}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />

                <TextField
                  select
                  label={t('Export Format')}
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  fullWidth
                >
                  <MenuItem value="excel">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Table size={20} />
                      <span>Excel</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="csv">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileCsv size={20} />
                      <span>CSV</span>
                    </Stack>
                  </MenuItem>
                </TextField>

                <Alert severity="info" icon={<Info size={20} />}>
                  {reportFormat === 'excel' && t('Excel reports include multiple sheets with detailed data')}
                  {reportFormat === 'csv' && t('CSV reports provide raw data for further analysis')}
                </Alert>
              </Stack>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={generating}>
              {t('Cancel')}
            </Button>
            <Button
              onClick={handleGenerateReport}
              variant="contained"
              disabled={generating}
              startIcon={generating ? <CircularProgress size={20} /> : <Download size={20} />}
            >
              {generating ? t('Generating...') : t('Generate Report')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  )
}