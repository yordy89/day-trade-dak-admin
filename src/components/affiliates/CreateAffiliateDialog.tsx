import { useState } from 'react'
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import affiliateService, { CreateAffiliateDto } from '@/services/affiliate.service'
import { useSnackbar } from '@/hooks/use-snackbar'

interface CreateAffiliateDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateAffiliateDialog({ open, onClose, onSuccess }: CreateAffiliateDialogProps) {
  const { showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateAffiliateDto>({
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
  })

  const handleSubmit = async () => {
    // Validation
    if (!formData.affiliateCode || !formData.name || !formData.email) {
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
      await affiliateService.createAffiliate({
        ...formData,
        affiliateCode: formData.affiliateCode.toUpperCase(),
      })
      onSuccess()
      handleClose()
    } catch (error: any) {
      if (error.response?.data?.message) {
        showError(error.response.data.message)
      } else {
        showError('Failed to create affiliate')
      }
      console.error('Error creating affiliate:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
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
      })
      onClose()
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Affiliate</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            Create a unique referral code for sellers to share with customers. Customers get
            discounts, and sellers earn commissions.
          </Alert>

          <TextField
            label="Referral Code"
            value={formData.affiliateCode}
            onChange={(e) =>
              setFormData({ ...formData, affiliateCode: e.target.value.toUpperCase() })
            }
            required
            fullWidth
            placeholder="e.g., MARIA2024"
            helperText="Unique code that customers will enter"
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />

          <TextField
            label="Seller Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            placeholder="e.g., Maria Garcia"
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
            placeholder="seller@email.com"
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Affiliate'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}