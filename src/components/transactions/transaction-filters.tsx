'use client'

import React from 'react'
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Button,
  Stack,
  InputAdornment,
  OutlinedInput,
  Typography,
  Checkbox,
  ListItemText
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { 
  PaymentStatus, 
  PaymentMethod, 
  SubscriptionPlan,
  SUBSCRIPTION_PLANS 
} from '@/types/payment'
import { TransactionFilters as FilterType } from '@/services/analytics.service'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass, X } from '@phosphor-icons/react'

interface TransactionFiltersProps {
  filters: FilterType
  onChange: (filters: Partial<FilterType>) => void
  onReset: () => void
}

const STATUS_OPTIONS = [
  { value: PaymentStatus.SUCCEEDED, label: 'Succeeded', color: 'success' },
  { value: PaymentStatus.FAILED, label: 'Failed', color: 'error' },
  { value: PaymentStatus.PENDING, label: 'Pending', color: 'warning' },
  { value: PaymentStatus.REFUNDED, label: 'Refunded', color: 'info' },
  { value: PaymentStatus.CANCELLED, label: 'Cancelled', color: 'default' }
] as const

const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.CARD, label: 'Credit/Debit Card' },
  { value: PaymentMethod.KLARNA, label: 'Klarna' },
  { value: PaymentMethod.AFTERPAY, label: 'Afterpay' },
  { value: PaymentMethod.AFFIRM, label: 'Affirm' },
  { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' }
]

export function TransactionFilters({ filters, onChange, onReset }: TransactionFiltersProps) {
  const { t } = useTranslation()

  const handleDateChange = (field: 'start' | 'end', date: Date | null) => {
    if (date && filters.dateRange) {
      onChange({
        dateRange: {
          ...filters.dateRange,
          [field]: date
        }
      })
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        {/* Date Range */}
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label={t('Start Date')}
            value={filters.dateRange?.start || null}
            onChange={(date) => handleDateChange('start', date)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label={t('End Date')}
            value={filters.dateRange?.end || null}
            onChange={(date) => handleDateChange('end', date)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small'
              }
            }}
          />
        </Grid>

        {/* Search */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('Search by transaction ID, customer name or email')}
            value={filters.searchTerm || ''}
            onChange={(e) => onChange({ searchTerm: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlass size={20} />
                </InputAdornment>
              ),
              endAdornment: filters.searchTerm && (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    onClick={() => onChange({ searchTerm: '' })}
                    sx={{ cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </Box>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('Status')}</InputLabel>
            <Select
              multiple
              value={filters.status || []}
              onChange={(e) => onChange({ status: e.target.value as PaymentStatus[] })}
              input={<OutlinedInput label={t('Status')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as PaymentStatus[]).map((value) => {
                    const option = STATUS_OPTIONS.find(o => o.value === value)
                    return (
                      <Chip
                        key={value}
                        label={option?.label}
                        size="small"
                        color={option?.color as any}
                      />
                    )
                  })}
                </Box>
              )}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(filters.status || []).indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Subscription Plans */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('Subscription Plans')}</InputLabel>
            <Select
              multiple
              value={filters.plans || []}
              onChange={(e) => onChange({ plans: e.target.value as SubscriptionPlan[] })}
              input={<OutlinedInput label={t('Subscription Plans')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as SubscriptionPlan[]).length === 0 
                    ? 'None'
                    : (selected as SubscriptionPlan[]).length > 2
                    ? `${(selected as SubscriptionPlan[]).length} selected`
                    : (selected as SubscriptionPlan[]).map((value) => {
                        const plan = SUBSCRIPTION_PLANS[value]
                        return (
                          <Chip
                            key={value}
                            label={plan?.name || value}
                            size="small"
                          />
                        )
                      })
                  }
                </Box>
              )}
            >
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <MenuItem key={key} value={key}>
                  <Checkbox checked={(filters.plans || []).indexOf(key as SubscriptionPlan) > -1} />
                  <ListItemText primary={plan.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('Payment Methods')}</InputLabel>
            <Select
              multiple
              value={filters.paymentMethods || []}
              onChange={(e) => onChange({ paymentMethods: e.target.value as PaymentMethod[] })}
              input={<OutlinedInput label={t('Payment Methods')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as PaymentMethod[]).length === 0 
                    ? 'None'
                    : (selected as PaymentMethod[]).map((value) => {
                        const option = PAYMENT_METHOD_OPTIONS.find(o => o.value === value)
                        return (
                          <Chip
                            key={value}
                            label={option?.label || value}
                            size="small"
                          />
                        )
                      })
                  }
                </Box>
              )}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(filters.paymentMethods || []).indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Amount Range */}
        <Grid item xs={12} sm={6} md={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              label={t('Min Amount')}
              value={filters.minAmount || ''}
              onChange={(e) => onChange({ minAmount: e.target.value ? Number(e.target.value) : undefined })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              sx={{ flex: 1 }}
            />
            <Typography>-</Typography>
            <TextField
              size="small"
              type="number"
              label={t('Max Amount')}
              value={filters.maxAmount || ''}
              onChange={(e) => onChange({ maxAmount: e.target.value ? Number(e.target.value) : undefined })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onReset}
            >
              {t('Reset Filters')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}