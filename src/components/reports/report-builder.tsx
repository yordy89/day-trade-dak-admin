'use client'

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  Grid
} from '@mui/material'
import {
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Info
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface ReportMetric {
  id: string
  name: string
  category: string
  description: string
  available: boolean
}

const availableMetrics: ReportMetric[] = [
  // Revenue Metrics
  { id: 'total_revenue', name: 'Total Revenue', category: 'Revenue', description: 'Total revenue for the period', available: true },
  { id: 'revenue_growth', name: 'Revenue Growth', category: 'Revenue', description: 'Revenue growth percentage', available: true },
  { id: 'revenue_by_plan', name: 'Revenue by Plan', category: 'Revenue', description: 'Revenue breakdown by subscription plan', available: true },
  { id: 'revenue_by_method', name: 'Revenue by Payment Method', category: 'Revenue', description: 'Revenue breakdown by payment method', available: true },
  
  // Transaction Metrics
  { id: 'total_transactions', name: 'Total Transactions', category: 'Transactions', description: 'Total number of transactions', available: true },
  { id: 'successful_transactions', name: 'Successful Transactions', category: 'Transactions', description: 'Number of successful transactions', available: true },
  { id: 'failed_transactions', name: 'Failed Transactions', category: 'Transactions', description: 'Number of failed transactions', available: true },
  { id: 'average_transaction_value', name: 'Average Transaction Value', category: 'Transactions', description: 'Average value per transaction', available: true },
  { id: 'transaction_success_rate', name: 'Transaction Success Rate', category: 'Transactions', description: 'Percentage of successful transactions', available: true },
  
  // Subscription Metrics
  { id: 'active_subscriptions', name: 'Active Subscriptions', category: 'Subscriptions', description: 'Total active subscriptions', available: true },
  { id: 'new_subscriptions', name: 'New Subscriptions', category: 'Subscriptions', description: 'New subscriptions in period', available: true },
  { id: 'cancelled_subscriptions', name: 'Cancelled Subscriptions', category: 'Subscriptions', description: 'Cancelled subscriptions in period', available: true },
  { id: 'subscription_churn_rate', name: 'Churn Rate', category: 'Subscriptions', description: 'Subscription churn rate', available: true },
  { id: 'mrr', name: 'Monthly Recurring Revenue', category: 'Subscriptions', description: 'Total MRR', available: true },
  { id: 'arpu', name: 'Average Revenue Per User', category: 'Subscriptions', description: 'ARPU for the period', available: true },
  
  // Customer Metrics
  { id: 'total_customers', name: 'Total Customers', category: 'Customers', description: 'Total number of customers', available: true },
  { id: 'new_customers', name: 'New Customers', category: 'Customers', description: 'New customers in period', available: true },
  { id: 'customer_lifetime_value', name: 'Customer Lifetime Value', category: 'Customers', description: 'Average CLV', available: true },
  { id: 'customer_acquisition_cost', name: 'Customer Acquisition Cost', category: 'Customers', description: 'Average CAC', available: false },
  
  // Refund Metrics
  { id: 'total_refunds', name: 'Total Refunds', category: 'Refunds', description: 'Total refund amount', available: true },
  { id: 'refund_count', name: 'Refund Count', category: 'Refunds', description: 'Number of refunds processed', available: true },
  { id: 'refund_rate', name: 'Refund Rate', category: 'Refunds', description: 'Percentage of transactions refunded', available: true },
]

interface ReportBuilderProps {
  onSave: (config: ReportConfig) => void
}

interface ReportConfig {
  name: string
  description: string
  metrics: string[]
  groupBy?: string
  includeComparison: boolean
  includeCharts: boolean
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

export function ReportBuilder({ onSave }: ReportBuilderProps) {
  const { t } = useTranslation()
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string>('')
  const [includeComparison, setIncludeComparison] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [enableSchedule, setEnableSchedule] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [scheduleRecipients, setScheduleRecipients] = useState<string[]>([])
  const [recipientEmail, setRecipientEmail] = useState('')

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const handleMoveMetric = (index: number, direction: 'up' | 'down') => {
    const newMetrics = [...selectedMetrics]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newMetrics.length) {
      [newMetrics[index], newMetrics[newIndex]] = [newMetrics[newIndex], newMetrics[index]]
      setSelectedMetrics(newMetrics)
    }
  }

  const handleAddRecipient = () => {
    if (recipientEmail && !scheduleRecipients.includes(recipientEmail)) {
      setScheduleRecipients([...scheduleRecipients, recipientEmail])
      setRecipientEmail('')
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setScheduleRecipients(scheduleRecipients.filter(r => r !== email))
  }

  const handleSave = () => {
    const config: ReportConfig = {
      name: reportName,
      description: reportDescription,
      metrics: selectedMetrics,
      groupBy: groupBy || undefined,
      includeComparison,
      includeCharts,
      schedule: enableSchedule ? {
        frequency: scheduleFrequency,
        recipients: scheduleRecipients
      } : undefined
    }
    onSave(config)
  }

  const categories = [...new Set(availableMetrics.map(m => m.category))]

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('Custom Report Builder')}
      </Typography>
      
      <Stack spacing={3}>
        {/* Basic Info */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('Report Information')}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label={t('Report Name')}
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={t('Description')}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Metrics Selection */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select Metrics')}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('Choose the metrics you want to include in your report')}
          </Typography>
          
          {categories.map(category => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary">
                {category}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {availableMetrics
                  .filter(m => m.category === category)
                  .map(metric => (
                    <Grid item xs={12} sm={6} md={4} key={metric.id}>
                      <Chip
                        label={metric.name}
                        onClick={() => metric.available && handleMetricToggle(metric.id)}
                        onDelete={selectedMetrics.includes(metric.id) ? () => handleMetricToggle(metric.id) : undefined}
                        color={selectedMetrics.includes(metric.id) ? 'primary' : 'default'}
                        variant={selectedMetrics.includes(metric.id) ? 'filled' : 'outlined'}
                        disabled={!metric.available}
                        sx={{ width: '100%', justifyContent: 'flex-start' }}
                        icon={
                          <Tooltip title={metric.description}>
                            <Info size={16} />
                          </Tooltip>
                        }
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* Selected Metrics Order */}
        {selectedMetrics.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('Report Layout')} ({selectedMetrics.length} metrics selected)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('Use arrows to reorder metrics')}
              </Typography>
              
              <Box>
                {selectedMetrics.map((metricId, index) => {
                  const metric = availableMetrics.find(m => m.id === metricId)!
                  return (
                    <Box
                      key={metricId}
                      sx={{
                        mb: 1,
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveMetric(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveMetric(index, 'down')}
                          disabled={index === selectedMetrics.length - 1}
                        >
                          <ArrowDown size={16} />
                        </IconButton>
                      </Stack>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {metric.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.category}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleMetricToggle(metricId)}
                      >
                        <Trash size={16} />
                      </IconButton>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </>
        )}

        <Divider />

        {/* Report Options */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('Report Options')}
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>{t('Group By')}</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                label={t('Group By')}
              >
                <MenuItem value="">
                  <em>{t('None')}</em>
                </MenuItem>
                <MenuItem value="day">{t('Day')}</MenuItem>
                <MenuItem value="week">{t('Week')}</MenuItem>
                <MenuItem value="month">{t('Month')}</MenuItem>
                <MenuItem value="plan">{t('Subscription Plan')}</MenuItem>
                <MenuItem value="payment_method">{t('Payment Method')}</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                />
              }
              label={t('Include period comparison')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                />
              }
              label={t('Include charts and visualizations')}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Schedule Options */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={enableSchedule}
                onChange={(e) => setEnableSchedule(e.target.checked)}
              />
            }
            label={t('Schedule automated delivery')}
          />
          
          {enableSchedule && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('Frequency')}</InputLabel>
                <Select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value as any)}
                  label={t('Frequency')}
                >
                  <MenuItem value="daily">{t('Daily')}</MenuItem>
                  <MenuItem value="weekly">{t('Weekly')}</MenuItem>
                  <MenuItem value="monthly">{t('Monthly')}</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="body2" gutterBottom>
                  {t('Email Recipients')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder={t('Enter email address')}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddRecipient}
                    startIcon={<Plus size={20} />}
                  >
                    {t('Add')}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {scheduleRecipients.map(email => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveRecipient(email)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined">
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!reportName || selectedMetrics.length === 0}
          >
            {t('Save Report Template')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}