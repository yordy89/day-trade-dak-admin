'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { ArrowLeft, Receipt, ArrowsClockwise, Download } from '@phosphor-icons/react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useTranslation } from 'react-i18next'
import { analyticsService } from '@/services/analytics.service'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import apiClient from '@/lib/api-client'

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refundDialog, setRefundDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchTransactionDetails()
  }, [params.transactionId])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      // Get transaction details
      const response = await apiClient.get(`/admin/transactions/${params.transactionId}`)
      setTransaction(response.data)
      setRefundAmount(response.data.amount.toString())
    } catch (error) {
      toast.error('Failed to load transaction details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInvoice = async () => {
    try {
      const response = await apiClient.get(`/admin/transactions/${params.transactionId}/invoice`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${transaction.transactionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Invoice generated successfully')
    } catch (error) {
      toast.error('Failed to generate invoice')
      console.error(error)
    }
  }

  const handleRefund = async () => {
    try {
      setProcessing(true)
      const amount = parseFloat(refundAmount)
      
      if (isNaN(amount) || amount <= 0 || amount > transaction.amount) {
        toast.error('Invalid refund amount')
        return
      }

      await apiClient.post(`/admin/transactions/${params.transactionId}/refund`, {
        amount,
        reason: refundReason
      })
      
      toast.success('Refund processed successfully')
      setRefundDialog(false)
      fetchTransactionDetails() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process refund')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  if (!transaction) {
    return (
      <AdminLayout>
        <Box p={3}>
          <Alert severity="error">Transaction not found</Alert>
        </Box>
      </AdminLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      case 'refunded': return 'default'
      default: return 'default'
    }
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box mb={3}>
          <Button
            startIcon={<ArrowLeft />}
            onClick={() => router.push('/transactions')}
            sx={{ mb: 2 }}
          >
            {t('Back to Transactions')}
          </Button>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                {t('Transaction Details')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.transactionId}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Receipt />}
                onClick={handleGenerateInvoice}
              >
                {t('Generate Invoice')}
              </Button>
              {transaction.status === 'succeeded' && !transaction.refundAmount && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ArrowsClockwise />}
                  onClick={() => setRefundDialog(true)}
                >
                  {t('Refund')}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Transaction Info */}
        <Grid container spacing={3}>
          {/* Main Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Transaction Information')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Transaction ID')}
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {transaction.transactionId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Date & Time')}
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Amount')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    {transaction.refundAmount > 0 && (
                      <Typography variant="body2" color="error">
                        Refunded: {formatCurrency(transaction.refundAmount)}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Status')}
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Payment Method')}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.method || 'Card'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('Currency')}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.currency?.toUpperCase() || 'USD'}
                    </Typography>
                  </Grid>
                </Grid>

                {transaction.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('Description')}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.description}
                    </Typography>
                  </>
                )}

                {/* Stripe IDs */}
                {(transaction.stripePaymentIntentId || transaction.stripeCustomerId) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {t('Stripe Information')}
                    </Typography>
                    {transaction.stripePaymentIntentId && (
                      <Box mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Intent ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {transaction.stripePaymentIntentId}
                        </Typography>
                      </Box>
                    )}
                    {transaction.stripeCustomerId && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Customer ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {transaction.stripeCustomerId}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('Customer Information')}
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Name')}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.customerName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Email')}
                    </Typography>
                    <Typography variant="body1">
                      {transaction.customerEmail}
                    </Typography>
                  </Box>
                  
                  {transaction.customerId && !transaction.customerId.startsWith('guest-') && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/users/${transaction.customerId}`)}
                    >
                      {t('View Customer Profile')}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Metadata */}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('Additional Information')}
                  </Typography>
                  
                  <Stack spacing={1}>
                    {Object.entries(transaction.metadata).map(([key, value]) => (
                      <Box key={key}>
                        <Typography variant="caption" color="text.secondary">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography variant="body2">
                          {String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Refund Dialog */}
        <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('Process Refund')}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="warning">
                {t('This action cannot be undone. The amount will be refunded to the original payment method.')}
              </Alert>
              
              <TextField
                label={t('Refund Amount')}
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                fullWidth
                inputProps={{ 
                  max: transaction.amount,
                  min: 0.01,
                  step: 0.01
                }}
                helperText={`Maximum: ${formatCurrency(transaction.amount)}`}
              />
              
              <TextField
                label={t('Reason for Refund')}
                multiline
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRefundDialog(false)} disabled={processing}>
              {t('Cancel')}
            </Button>
            <Button
              onClick={handleRefund}
              color="error"
              variant="contained"
              disabled={processing || !refundReason}
              startIcon={processing ? <CircularProgress size={20} /> : <ArrowsClockwise />}
            >
              {processing ? t('Processing...') : t('Process Refund')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  )
}