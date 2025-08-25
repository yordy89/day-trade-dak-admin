'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
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
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/auth-store'
import { useSnackbar } from '@/hooks/use-snackbar'
import axios from 'axios'

interface FinancingPlan {
  _id: string
  planId: string
  name: string
  nameEN: string
  description: string
  descriptionEN: string
  numberOfPayments: number
  frequency: 'weekly' | 'biweekly' | 'monthly'
  minAmount: number
  maxAmount: number
  downPaymentPercent: number
  processingFeePercent: number
  sortOrder: number
  isActive: boolean
}

export function FinancingPlans() {
  const { t } = useTranslation('financing')
  const { token } = useAuthStore()
  const { showSuccess, showError } = useSnackbar()
  const [plans, setPlans] = useState<FinancingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<FinancingPlan | null>(null)
  const [formData, setFormData] = useState({
    planId: '',
    name: '',
    nameEN: '',
    description: '',
    descriptionEN: '',
    numberOfPayments: 2,
    frequency: 'biweekly' as 'weekly' | 'biweekly' | 'monthly',
    minAmount: 100,
    maxAmount: 1000,
    downPaymentPercent: 0,
    processingFeePercent: 3,
    sortOrder: 999,
    isActive: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/plans`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPlans(response.data)
    } catch (error) {
      showError(t('errors.fetch_plans', 'Failed to fetch financing plans'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (plan?: FinancingPlan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        planId: plan.planId,
        name: plan.name,
        nameEN: plan.nameEN,
        description: plan.description,
        descriptionEN: plan.descriptionEN,
        numberOfPayments: plan.numberOfPayments,
        frequency: plan.frequency,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        downPaymentPercent: plan.downPaymentPercent,
        processingFeePercent: plan.processingFeePercent,
        sortOrder: plan.sortOrder,
        isActive: plan.isActive,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        planId: '',
        name: '',
        nameEN: '',
        description: '',
        descriptionEN: '',
        numberOfPayments: 2,
        frequency: 'biweekly',
        minAmount: 100,
        maxAmount: 1000,
        downPaymentPercent: 0,
        processingFeePercent: 3,
        sortOrder: 999,
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPlan(null)
  }

  const handleSave = async () => {
    try {
      if (editingPlan) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/plans/${editingPlan._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSuccess(t('success.plan_updated', 'Financing plan updated successfully'))
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/plans`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSuccess(t('success.plan_created', 'Financing plan created successfully'))
      }
      handleCloseDialog()
      fetchPlans()
    } catch (error: any) {
      showError(error.response?.data?.message || t('errors.save_plan', 'Failed to save financing plan'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm.delete_plan', 'Are you sure you want to deactivate this plan?'))) {
      return
    }
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/plans/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showSuccess(t('success.plan_deleted', 'Financing plan deactivated successfully'))
      fetchPlans()
    } catch (error) {
      showError(t('errors.delete_plan', 'Failed to deactivate financing plan'))
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return t('frequency.weekly', 'Weekly')
      case 'biweekly': return t('frequency.biweekly', 'Biweekly')
      case 'monthly': return t('frequency.monthly', 'Monthly')
      default: return frequency
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('plans.title', 'Payment Plans')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t('plans.add', 'Add Plan')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('plans.id', 'Plan ID')}</TableCell>
              <TableCell>{t('plans.name', 'Name')}</TableCell>
              <TableCell>{t('plans.payments', 'Payments')}</TableCell>
              <TableCell>{t('plans.frequency', 'Frequency')}</TableCell>
              <TableCell>{t('plans.amount_range', 'Amount Range')}</TableCell>
              <TableCell>{t('plans.fees', 'Fees')}</TableCell>
              <TableCell>{t('plans.status', 'Status')}</TableCell>
              <TableCell align="right">{t('plans.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.planId}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{plan.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plan.nameEN}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{plan.numberOfPayments}</TableCell>
                <TableCell>{getFrequencyLabel(plan.frequency)}</TableCell>
                <TableCell>
                  ${plan.minAmount} - ${plan.maxAmount}
                </TableCell>
                <TableCell>
                  <Box>
                    {plan.downPaymentPercent > 0 && (
                      <Typography variant="caption" display="block">
                        Down: {plan.downPaymentPercent}%
                      </Typography>
                    )}
                    <Typography variant="caption" display="block">
                      Fee: {plan.processingFeePercent}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={plan.isActive ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}
                    color={plan.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(plan)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(plan._id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? t('plans.edit_title', 'Edit Financing Plan') : t('plans.add_title', 'Add Financing Plan')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('plans.plan_id', 'Plan ID')}
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                disabled={!!editingPlan}
                helperText={t('plans.plan_id_help', 'Unique identifier (e.g., 2_biweekly)')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label={t('plans.active', 'Active')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('plans.name_es', 'Name (Spanish)')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('plans.name_en', 'Name (English)')}
                value={formData.nameEN}
                onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('plans.description_es', 'Description (Spanish)')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('plans.description_en', 'Description (English)')}
                value={formData.descriptionEN}
                onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.number_payments', 'Number of Payments')}
                value={formData.numberOfPayments}
                onChange={(e) => setFormData({ ...formData, numberOfPayments: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label={t('plans.frequency', 'Frequency')}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              >
                <MenuItem value="weekly">{t('frequency.weekly', 'Weekly')}</MenuItem>
                <MenuItem value="biweekly">{t('frequency.biweekly', 'Biweekly')}</MenuItem>
                <MenuItem value="monthly">{t('frequency.monthly', 'Monthly')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.sort_order', 'Sort Order')}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.min_amount', 'Minimum Amount ($)')}
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.max_amount', 'Maximum Amount ($)')}
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.down_payment', 'Down Payment (%)')}
                value={formData.downPaymentPercent}
                onChange={(e) => setFormData({ ...formData, downPaymentPercent: parseFloat(e.target.value) })}
                helperText={t('plans.down_payment_help', '0 for no down payment')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('plans.processing_fee', 'Processing Fee (%)')}
                value={formData.processingFeePercent}
                onChange={(e) => setFormData({ ...formData, processingFeePercent: parseFloat(e.target.value) })}
                helperText={t('plans.processing_fee_help', 'Hidden fee added to total')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('actions.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('actions.save', 'Save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}