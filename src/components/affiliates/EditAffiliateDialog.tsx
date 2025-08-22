import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Typography,
  Box,
  InputAdornment,
  FormControlLabel,
  Switch,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import affiliateService, { Affiliate, UpdateAffiliateDto } from '@/services/affiliate.service'
import { useSnackbar } from '@/hooks/use-snackbar'

interface EditAffiliateDialogProps {
  open: boolean
  affiliate: Affiliate
  onClose: () => void
  onSuccess: () => void
}

export function EditAffiliateDialog({
  open,
  affiliate,
  onClose,
  onSuccess,
}: EditAffiliateDialogProps) {
  const { showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateAffiliateDto & { affiliateCode: string }>({
    affiliateCode: '',
    name: '',
    email: '',
    phoneNumber: '',
    discountType: 'percentage',
    discountPercentage: 10,
    discountFixedAmount: 300,
    commissionType: 'percentage',
    commissionRate: 5,
    commissionFixedAmount: 100,
    isActive: true,
  })

  useEffect(() => {
    if (affiliate) {
      setFormData({
        affiliateCode: affiliate.affiliateCode,
        name: affiliate.name,
        email: affiliate.email,
        phoneNumber: affiliate.phoneNumber || '',
        discountType: affiliate.discountType || 'percentage',
        discountPercentage: affiliate.discountPercentage || 10,
        discountFixedAmount: affiliate.discountFixedAmount || 300,
        commissionType: affiliate.commissionType || 'percentage',
        commissionRate: affiliate.commissionRate || 5,
        commissionFixedAmount: affiliate.commissionFixedAmount || 100,
        isActive: affiliate.isActive,
      })
    }
  }, [affiliate])

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      showError('Please fill in all required fields')
      return
    }

    if (formData.discountType === 'percentage') {
      if (!formData.discountPercentage || formData.discountPercentage < 0 || formData.discountPercentage > 50) {
        showError('Discount percentage must be between 0 and 50')
        return
      }
    } else {
      if (!formData.discountFixedAmount || formData.discountFixedAmount < 0) {
        showError('Fixed discount must be greater than 0')
        return
      }
      if (formData.discountFixedAmount >= 2999.99) {
        showError('Fixed discount cannot exceed the course price')
        return
      }
    }

    if (formData.commissionType === 'percentage') {
      if (!formData.commissionRate || formData.commissionRate < 0 || formData.commissionRate > 50) {
        showError('Commission percentage must be between 0 and 50')
        return
      }
    } else {
      if (!formData.commissionFixedAmount || formData.commissionFixedAmount < 0) {
        showError('Fixed commission must be greater than 0')
        return
      }
      if (formData.commissionFixedAmount >= 1000) {
        showError('Fixed commission cannot exceed $1,000 per sale')
        return
      }
    }

    try {
      setLoading(true)
      const { affiliateCode, ...updateData } = formData
      await affiliateService.updateAffiliate(affiliate._id, updateData)
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.response?.data?.message) {
        showError(error.response.data.message)
      } else {
        showError('Failed to update affiliate')
      }
      console.error('Error updating affiliate:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateExample = () => {
    const originalPrice = 2999.99
    let discountAmount = 0
    
    if (formData.discountType === 'percentage') {
      discountAmount = (originalPrice * (formData.discountPercentage || 0)) / 100
    } else {
      discountAmount = Math.min(formData.discountFixedAmount || 0, originalPrice)
    }
    
    const finalPrice = originalPrice - discountAmount
    
    let commission = 0
    if (formData.commissionType === 'percentage') {
      commission = (finalPrice * (formData.commissionRate || 0)) / 100
    } else {
      commission = formData.commissionFixedAmount || 0
    }
    
    return { originalPrice, discountAmount, finalPrice, commission }
  }

  const example = calculateExample()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Affiliate</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            Update affiliate details. The referral code cannot be changed.
          </Alert>

          <TextField
            label="Referral Code"
            value={formData.affiliateCode}
            disabled
            fullWidth
            helperText="Code cannot be changed"
          />

          <TextField
            label="Seller Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />

          <TextField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            fullWidth
            placeholder="+1234567890 (optional)"
          />

          <FormControl component="fieldset">
            <FormLabel component="legend">Discount Type</FormLabel>
            <RadioGroup
              row
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
            >
              <FormControlLabel value="percentage" control={<Radio />} label="Percentage (%)" />
              <FormControlLabel value="fixed" control={<Radio />} label="Fixed Amount ($)" />
            </RadioGroup>
          </FormControl>

          {formData.discountType === 'percentage' ? (
            <TextField
              label="Customer Discount Percentage"
              type="number"
              value={formData.discountPercentage}
              onChange={(e) =>
                setFormData({ ...formData, discountPercentage: Number(e.target.value) })
              }
              required
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ min: 0, max: 50, step: 1 }}
              helperText="Percentage discount customers receive (0-50%)"
            />
          ) : (
            <TextField
              label="Fixed Discount Amount"
              type="number"
              value={formData.discountFixedAmount}
              onChange={(e) =>
                setFormData({ ...formData, discountFixedAmount: Number(e.target.value) })
              }
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, max: 2999, step: 10 }}
              helperText="Fixed dollar amount off (max $2,999)"
            />
          )}

          <FormControl component="fieldset">
            <FormLabel component="legend">Commission Type</FormLabel>
            <RadioGroup
              row
              value={formData.commissionType}
              onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as 'percentage' | 'fixed' })}
            >
              <FormControlLabel value="percentage" control={<Radio />} label="Percentage (%)" />
              <FormControlLabel value="fixed" control={<Radio />} label="Fixed Amount ($)" />
            </RadioGroup>
          </FormControl>

          {formData.commissionType === 'percentage' ? (
            <TextField
              label="Seller Commission Percentage"
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
              required
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ min: 0, max: 50, step: 0.5 }}
              helperText="Commission percentage on final price after discount (0-50%)"
            />
          ) : (
            <TextField
              label="Fixed Commission Amount"
              type="number"
              value={formData.commissionFixedAmount}
              onChange={(e) => setFormData({ ...formData, commissionFixedAmount: Number(e.target.value) })}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, max: 1000, step: 10 }}
              helperText="Fixed dollar amount per sale (max $1,000)"
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Active (customers can use this code)"
          />

          {/* Live Example */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              💰 Live Calculation Example
            </Typography>
            <Typography variant="body2">
              Original Price: <strong>${example.originalPrice.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" color="success.main">
              Customer Saves: <strong>${example.discountAmount.toFixed(2)}</strong> (
              {formData.discountType === 'percentage' ? `${formData.discountPercentage}%` : 'Fixed'})
            </Typography>
            <Typography variant="body2">
              Customer Pays: <strong>${example.finalPrice.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" color="primary">
              Seller Earns: <strong>${example.commission.toFixed(2)}</strong> per sale (
              {formData.commissionType === 'percentage' ? `${formData.commissionRate}% of final` : 'Fixed'})
            </Typography>
          </Box>

          {/* Current Stats */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Current Performance
            </Typography>
            <Typography variant="body2">
              Total Sales: <strong>{affiliate.totalSales}</strong>
            </Typography>
            <Typography variant="body2">
              Total Revenue: <strong>${affiliate.totalRevenue.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2">
              Total Commission: <strong>${affiliate.totalCommission.toFixed(2)}</strong>
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}