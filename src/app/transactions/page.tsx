'use client'

import React, { useState, useCallback } from 'react'
import { 
  Box, 
  Typography, 
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material'
import { 
  Download,
  Funnel,
  DotsThreeVertical
} from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { analyticsService, TransactionFilters } from '@/services/analytics.service'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionFilters as FilterComponent } from '@/components/transactions/transaction-filters'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslation } from 'react-i18next'
import { subDays } from 'date-fns'
import { PaymentStatus } from '@/types/payment'

export default function TransactionsPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    },
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)

  // Fetch transactions
  const { 
    data: transactionData, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => analyticsService.getTransactionsWithFilters(filters),
    keepPreviousData: true
  })

  const handleFilterChange = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await analyticsService.exportTransactions(format, filters)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export transactions:', error)
    } finally {
      setExportMenuAnchor(null)
    }
  }

  const activeFilterCount = [
    filters.status?.length,
    filters.plans?.length,
    filters.paymentMethods?.length,
    filters.minAmount,
    filters.maxAmount,
    filters.searchTerm
  ].filter(Boolean).length

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            {t('Transactions')}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Funnel size={20} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {t('Filters')}
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download size={20} />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            >
              {t('Export')}
            </Button>
          </Stack>
        </Stack>

        {/* Summary Stats */}
        {transactionData && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={`${transactionData.total} ${t('Total Transactions')}`}
              variant="outlined"
            />
            <Chip
              label={`${transactionData.transactions.filter(t => t.status === PaymentStatus.SUCCEEDED).length} ${t('Successful')}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${transactionData.transactions.filter(t => t.status === PaymentStatus.FAILED).length} ${t('Failed')}`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`${transactionData.transactions.filter(t => t.status === PaymentStatus.REFUNDED).length} ${t('Refunded')}`}
              color="warning"
              variant="outlined"
            />
          </Stack>
        )}
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ mb: 3, p: 3 }}>
          <FilterComponent
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => {
              setFilters({
                dateRange: {
                  start: subDays(new Date(), 30),
                  end: new Date()
                },
                page: 1,
                limit: 25,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })
            }}
          />
        </Paper>
      )}

      {/* Transactions Table */}
      <Paper>
        <TransactionTable
          transactions={transactionData?.transactions || []}
          total={transactionData?.total || 0}
          page={filters.page || 1}
          limit={filters.limit || 25}
          sortBy={filters.sortBy || 'createdAt'}
          sortOrder={filters.sortOrder || 'desc'}
          loading={isLoading}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onRefresh={refetch}
        />
      </Paper>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          {t('Export as CSV')}
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          {t('Export as Excel')}
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          {t('Export as PDF')}
        </MenuItem>
      </Menu>
      </Box>
    </AdminLayout>
  )
}