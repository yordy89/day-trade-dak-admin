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
    id: 'daily-summary',
    title: 'Daily Summary Report',
    description: 'Complete overview of daily revenue, transactions, and key metrics',
    icon: <Calendar size={24} />,
    type: 'daily',
    defaultFormat: 'pdf',
    color: '#16a34a',
    available: true
  },
  {
    id: 'weekly-performance',
    title: 'Weekly Performance Report',
    description: 'Week-over-week comparison with trends and insights',
    icon: <TrendUp size={24} />,
    type: 'weekly',
    defaultFormat: 'pdf',
    color: '#0ea5e9',
    available: true
  },
  {
    id: 'monthly-financial',
    title: 'Monthly Financial Report',
    description: 'Comprehensive monthly P&L, subscription metrics, and revenue analysis',
    icon: <FileText size={24} />,
    type: 'monthly',
    defaultFormat: 'pdf',
    color: '#8b5cf6',
    available: true
  },
  {
    id: 'quarterly-business',
    title: 'Quarterly Business Review',
    description: 'Executive summary with quarter performance and growth metrics',
    icon: <TrendUp size={24} />,
    type: 'quarterly',
    defaultFormat: 'pdf',
    color: '#f97316',
    available: true
  },
  {
    id: 'annual-summary',
    title: 'Annual Summary Report',
    description: 'Year-end comprehensive report with all metrics and trends',
    icon: <Calendar size={24} />,
    type: 'yearly',
    defaultFormat: 'pdf',
    color: '#ec4899',
    available: true
  },
  {
    id: 'customer-analytics',
    title: 'Customer Analytics Report',
    description: 'Customer lifetime value, acquisition costs, and retention metrics',
    icon: <Users size={24} />,
    type: 'custom',
    defaultFormat: 'excel',
    color: '#06b6d4',
    available: true
  },
  {
    id: 'subscription-insights',
    title: 'Subscription Insights',
    description: 'Detailed subscription analytics, churn analysis, and MRR breakdown',
    icon: <CreditCard size={24} />,
    type: 'custom',
    defaultFormat: 'excel',
    color: '#84cc16',
    available: true
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods Analysis',
    description: 'Breakdown of payment methods, success rates, and preferences',
    icon: <CreditCard size={24} />,
    type: 'custom',
    defaultFormat: 'csv',
    color: '#a855f7',
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

  // Fetch recent reports
  const { data: recentReports } = useQuery({
    queryKey: ['recentReports'],
    queryFn: async () => {
      // Mock recent reports - in real implementation, fetch from API
      return [
        {
          id: '1',
          name: 'Monthly Financial Report - November 2024',
          type: 'monthly',
          format: 'pdf',
          generatedAt: new Date('2024-11-01'),
          size: '2.4 MB'
        },
        {
          id: '2',
          name: 'Weekly Performance Report - Week 48',
          type: 'weekly',
          format: 'pdf',
          generatedAt: new Date('2024-11-25'),
          size: '1.2 MB'
        },
        {
          id: '3',
          name: 'Customer Analytics Report',
          type: 'custom',
          format: 'excel',
          generatedAt: new Date('2024-11-20'),
          size: '3.8 MB'
        }
      ]
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
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError('Failed to generate report. Please try again.')
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
                            {format(report.generatedAt, 'MMM dd, yyyy HH:mm')}
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
                  <MenuItem value="pdf">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <File size={20} />
                      <span>PDF</span>
                    </Stack>
                  </MenuItem>
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
                  {reportFormat === 'pdf' && t('PDF reports include charts and visualizations')}
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