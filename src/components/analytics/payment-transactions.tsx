'use client'

import { useState } from 'react'
import { 
  Box, 
  Card, 
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Search, MoreVert, Receipt, Download } from '@mui/icons-material'
import { usePaymentTransactions } from '@/hooks/use-payment-transactions'

interface PaymentTransactionsProps {
  startDate: Date | null
  endDate: Date | null
  currency: string
}

export function PaymentTransactions({ startDate, endDate, currency }: PaymentTransactionsProps) {
  const { t } = useTranslation('analytics')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const { data, isLoading, error } = usePaymentTransactions({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    startDate,
    endDate,
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    method: methodFilter !== 'all' ? methodFilter : undefined,
    sortBy: sortModel[0]?.field,
    sortOrder: sortModel[0]?.sort,
  })

  // Debug logging
  console.log('PaymentTransactions - Props:', { startDate, endDate, currency })
  console.log('PaymentTransactions - Query params:', {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    startDate,
    endDate,
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    method: methodFilter !== 'all' ? methodFilter : undefined,
    sortBy: sortModel[0]?.field,
    sortOrder: sortModel[0]?.sort,
  })
  console.log('PaymentTransactions - Data:', data)
  console.log('PaymentTransactions - Loading:', isLoading)
  console.log('PaymentTransactions - Error:', error)

  const handleAction = (action: string, transaction: any) => {
    setAnchorEl(null)
    
    switch (action) {
      case 'view':
        // TODO: Show transaction details modal
        console.log('View transaction', transaction)
        break
      case 'refund':
        // TODO: Initiate refund
        console.log('Refund transaction', transaction)
        break
      case 'download':
        // TODO: Download receipt
        console.log('Download receipt', transaction)
        break
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'transactionId',
      headerName: t('columns.transactionId', 'Transaction ID'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Receipt fontSize="small" color="action" />
          <span>{params.value}</span>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: t('columns.customer', 'Customer'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Box fontWeight={500}>{params.row.customerName}</Box>
          <Box fontSize="0.875rem" color="text.secondary">
            {params.row.customerEmail}
          </Box>
        </Box>
      ),
    },
    {
      field: 'amount',
      headerName: t('columns.amount', 'Amount'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box fontWeight={600}>{formatCurrency(params.value)}</Box>
      ),
    },
    {
      field: 'method',
      headerName: t('columns.paymentMethod', 'Payment Method'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const methodIcons: Record<string, string> = {
          card: '💳',
          paypal: '🅿️',
          bank: '🏦',
        }
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <span>{methodIcons[params.value] || '💰'}</span>
            {t(`paymentMethods.${params.value}`, params.value)}
          </Box>
        )
      },
    },
    {
      field: 'status',
      headerName: t('columns.status', 'Status'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const statusColors: Record<string, any> = {
          succeeded: 'success',
          pending: 'warning',
          failed: 'error',
          refunded: 'default',
        }
        return (
          <Chip 
            label={t(`transactionStatus.${params.value}`, params.value)} 
            size="small"
            color={statusColors[params.value] || 'default'}
          />
        )
      },
    },
    {
      field: 'description',
      headerName: t('columns.description', 'Description'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'createdAt',
      headerName: t('columns.date', 'Date'),
      width: 180,
      valueFormatter: (params) => formatDateTime(new Date(params.value)),
    },
    {
      field: 'actions',
      headerName: t('columns.actions', 'Actions'),
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
              setSelectedTransaction(params.row)
            }}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedTransaction?._id === params.row._id}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => handleAction('view', params.row)}>
              {t('actions.viewDetails', 'View Details')}
            </MenuItem>
            {params.row.status === 'succeeded' && (
              <MenuItem onClick={() => handleAction('refund', params.row)}>
                {t('actions.refund', 'Issue Refund')}
              </MenuItem>
            )}
            <MenuItem onClick={() => handleAction('download', params.row)}>
              <Download sx={{ mr: 1, fontSize: 20 }} />
              {t('actions.downloadReceipt', 'Download Receipt')}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ]

  // Show error state in the UI if there's an error
  if (error && !isLoading) {
    console.error('PaymentTransactions - Error state:', error)
  }

  return (
    <Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder={t('search.transactions', 'Search by ID, customer, or description...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.status', 'Status')}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label={t('filters.status', 'Status')}
          >
            <MenuItem value="all">{t('filters.all', 'All')}</MenuItem>
            <MenuItem value="succeeded">{t('transactionStatus.succeeded', 'Succeeded')}</MenuItem>
            <MenuItem value="pending">{t('transactionStatus.pending', 'Pending')}</MenuItem>
            <MenuItem value="failed">{t('transactionStatus.failed', 'Failed')}</MenuItem>
            <MenuItem value="refunded">{t('transactionStatus.refunded', 'Refunded')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('filters.method', 'Method')}</InputLabel>
          <Select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            label={t('filters.method', 'Method')}
          >
            <MenuItem value="all">{t('filters.all', 'All')}</MenuItem>
            <MenuItem value="card">{t('paymentMethods.card', 'Credit Card')}</MenuItem>
            <MenuItem value="paypal">{t('paymentMethods.paypal', 'PayPal')}</MenuItem>
            <MenuItem value="bank">{t('paymentMethods.bank', 'Bank Transfer')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Transactions Table */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.transactions || []}
            columns={columns}
            getRowId={(row) => row._id || row.transactionId}
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
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  )
}