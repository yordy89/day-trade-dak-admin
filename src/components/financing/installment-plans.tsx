'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  Button,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Cancel,
  Visibility,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/auth-store'
import { useSnackbar } from '@/hooks/use-snackbar'
import axios from 'axios'

interface Payment {
  paymentNumber: number
  dueDate: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  paidAt?: string
  stripePaymentIntentId?: string
}

interface InstallmentPlan {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  planId: string
  productType: 'event' | 'course' | 'subscription'
  productId: string
  productName: string
  totalAmount: number
  downPayment: number
  remainingAmount: number
  numberOfPayments: number
  paymentFrequency: string
  status: 'pending' | 'active' | 'completed' | 'defaulted' | 'cancelled'
  payments: Payment[]
  stripeSubscriptionId?: string
  createdAt: string
  nextPaymentDate?: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
}

function Row({ plan, onCancel }: { plan: InstallmentPlan; onCancel: (plan: InstallmentPlan) => void }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('financing')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'completed': return 'info'
      case 'defaulted': return 'error'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const paidPayments = plan.payments.filter(p => p.status === 'paid').length
  const progressPercentage = (paidPayments / plan.numberOfPayments) * 100

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2">
              {plan.userId.firstName} {plan.userId.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {plan.userId.email}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{plan.productName}</TableCell>
        <TableCell>${plan.totalAmount.toFixed(2)}</TableCell>
        <TableCell>
          {paidPayments}/{plan.numberOfPayments}
          <Box sx={{ width: '100px', mt: 0.5 }}>
            <Box
              sx={{
                height: 4,
                bgcolor: 'grey.300',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  bgcolor: 'success.main',
                }}
              />
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={plan.status}
            color={getStatusColor(plan.status) as any}
            size="small"
          />
        </TableCell>
        <TableCell>
          {new Date(plan.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell align="right">
          {(plan.status === 'active' || plan.status === 'pending') && (
            <IconButton 
              onClick={() => onCancel(plan)} 
              size="small" 
              color="error"
              title={t('installments.cancel', 'Cancel Plan')}
            >
              <Cancel />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                {t('installments.payment_schedule', 'Payment Schedule')}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('installments.payment_num', 'Payment #')}</TableCell>
                    <TableCell>{t('installments.due_date', 'Due Date')}</TableCell>
                    <TableCell>{t('installments.amount', 'Amount')}</TableCell>
                    <TableCell>{t('installments.status', 'Status')}</TableCell>
                    <TableCell>{t('installments.paid_date', 'Paid Date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.payments.map((payment) => (
                    <TableRow key={payment.paymentNumber}>
                      <TableCell>{payment.paymentNumber}</TableCell>
                      <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getPaymentStatusColor(payment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export function InstallmentPlans() {
  const { t } = useTranslation('financing')
  const { token } = useAuthStore()
  const { showSuccess, showError } = useSnackbar()
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [statusFilter])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/installment-plans`
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlans(response.data)
    } catch (error) {
      showError(t('errors.fetch_plans', 'Failed to fetch installment plans'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPlan = (plan: InstallmentPlan) => {
    setSelectedPlan(plan)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const confirmCancelPlan = async () => {
    if (!selectedPlan || !cancelReason) return
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/installment-plans/${selectedPlan._id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showSuccess(t('success.plan_cancelled', 'Installment plan cancelled successfully'))
      setCancelDialogOpen(false)
      fetchPlans()
    } catch (error: any) {
      showError(error.response?.data?.message || t('errors.cancel_plan', 'Failed to cancel installment plan'))
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('installments.title', 'Active Installment Plans')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            select
            label={t('installments.filter_status', 'Filter by Status')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">{t('status.all', 'All')}</MenuItem>
            <MenuItem value="pending">{t('status.pending', 'Pending')}</MenuItem>
            <MenuItem value="active">{t('status.active', 'Active')}</MenuItem>
            <MenuItem value="completed">{t('status.completed', 'Completed')}</MenuItem>
            <MenuItem value="defaulted">{t('status.defaulted', 'Defaulted')}</MenuItem>
            <MenuItem value="cancelled">{t('status.cancelled', 'Cancelled')}</MenuItem>
          </TextField>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>{t('installments.customer', 'Customer')}</TableCell>
              <TableCell>{t('installments.product', 'Product')}</TableCell>
              <TableCell>{t('installments.total', 'Total')}</TableCell>
              <TableCell>{t('installments.progress', 'Progress')}</TableCell>
              <TableCell>{t('installments.status', 'Status')}</TableCell>
              <TableCell>{t('installments.created', 'Created')}</TableCell>
              <TableCell align="right">{t('installments.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <Row key={plan._id} plan={plan} onCancel={handleCancelPlan} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('installments.cancel_title', 'Cancel Installment Plan')}
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {t('installments.cancel_confirm', 'Are you sure you want to cancel this installment plan?')}
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {selectedPlan.userId.firstName} {selectedPlan.userId.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPlan.productName} - ${selectedPlan.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('installments.cancel_reason', 'Cancellation Reason')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            {t('actions.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={confirmCancelPlan} 
            variant="contained" 
            color="error"
            disabled={!cancelReason}
          >
            {t('actions.confirm_cancel', 'Confirm Cancellation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}