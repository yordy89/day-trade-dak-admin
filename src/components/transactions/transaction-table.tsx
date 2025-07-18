'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Skeleton,
  Typography,
  Stack,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { 
  ArrowsClockwise,
  Eye,
  Receipt,
  DotsThreeVertical
} from '@phosphor-icons/react'
import { PaymentTransaction } from '@/services/analytics.service'
import { PaymentStatus, PaymentMethod, SUBSCRIPTION_PLANS } from '@/types/payment'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

interface TransactionTableProps {
  transactions: PaymentTransaction[]
  total: number
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  loading: boolean
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string) => void
  onRefresh: () => void
}

const getStatusColor = (status: PaymentStatus): any => {
  switch (status) {
    case PaymentStatus.SUCCEEDED:
      return 'success'
    case PaymentStatus.FAILED:
      return 'error'
    case PaymentStatus.PENDING:
    case PaymentStatus.PROCESSING:
      return 'warning'
    case PaymentStatus.REFUNDED:
    case PaymentStatus.PARTIALLY_REFUNDED:
      return 'info'
    case PaymentStatus.CANCELLED:
      return 'default'
    default:
      return 'default'
  }
}

const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CARD:
      return 'Card'
    case PaymentMethod.KLARNA:
      return 'Klarna'
    case PaymentMethod.AFTERPAY:
      return 'Afterpay'
    case PaymentMethod.AFFIRM:
      return 'Affirm'
    case PaymentMethod.BANK_TRANSFER:
      return 'Bank Transfer'
    default:
      return method
  }
}

interface HeadCell {
  id: keyof PaymentTransaction | 'actions'
  label: string
  sortable: boolean
  align?: 'left' | 'right' | 'center'
}

const headCells: HeadCell[] = [
  { id: 'createdAt', label: 'Date', sortable: true },
  { id: 'transactionId', label: 'Transaction ID', sortable: true },
  { id: 'customerName', label: 'Customer', sortable: true },
  { id: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { id: 'description', label: 'Description', sortable: false },
  { id: 'method', label: 'Method', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false, align: 'center' }
]

export function TransactionTable({
  transactions,
  total,
  page,
  limit,
  sortBy,
  sortOrder,
  loading,
  onPageChange,
  onSortChange,
  onRefresh
}: TransactionTableProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1)
  }

  const handleSort = (property: string) => {
    onSortChange(property)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transactionId: string) => {
    setMenuAnchor(event.currentTarget)
    setSelectedTransaction(transactionId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedTransaction(null)
  }

  const handleViewDetails = () => {
    if (selectedTransaction) {
      router.push(`/transactions/${selectedTransaction}`)
    }
    handleMenuClose()
  }

  const handleViewCustomer = (customerId: string) => {
    router.push(`/users/${customerId}`)
  }

  const handleGenerateInvoice = () => {
    // TODO: Implement invoice generation
    console.log('Generate invoice for', selectedTransaction)
    handleMenuClose()
  }

  const handleRefund = () => {
    // TODO: Implement refund
    console.log('Refund transaction', selectedTransaction)
    handleMenuClose()
  }

  if (loading) {
    return (
      <Box p={3}>
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    )
  }

  if (transactions.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('No transactions found')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Try adjusting your filters or date range')}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sortDirection={sortBy === headCell.id ? sortOrder : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={sortBy === headCell.id}
                      direction={sortBy === headCell.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(headCell.id as string)}
                    >
                      {t(headCell.label)}
                      {sortBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    t(headCell.label)
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id} hover>
                <TableCell>
                  {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {transaction.transactionId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {transaction.customerName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.customerEmail}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  {transaction.refundAmount && (
                    <Typography variant="caption" color="error">
                      -{formatCurrency(transaction.refundAmount)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {transaction.description}
                  </Typography>
                  {transaction.plan && (
                    <Typography variant="caption" color="text.secondary">
                      {SUBSCRIPTION_PLANS[transaction.plan]?.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPaymentMethodLabel(transaction.method as PaymentMethod)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status as PaymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, transaction._id)}
                  >
                    <DotsThreeVertical size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={limit}
        rowsPerPageOptions={[25, 50, 100]}
        onRowsPerPageChange={(e) => onPageChange(1)}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Eye size={20} style={{ marginRight: 8 }} />
          {t('View Details')}
        </MenuItem>
        <MenuItem onClick={handleGenerateInvoice}>
          <Receipt size={20} style={{ marginRight: 8 }} />
          {t('Generate Invoice')}
        </MenuItem>
        {selectedTransaction && (
          <MenuItem onClick={handleRefund} sx={{ color: 'error.main' }}>
            <ArrowsClockwise size={20} style={{ marginRight: 8 }} />
            {t('Refund')}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}