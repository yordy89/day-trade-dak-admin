import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material'
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  Calculate,
  ContentCopy,
  LocalOffer,
} from '@mui/icons-material'
import affiliateService, { Affiliate, Commission } from '@/services/affiliate.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { formatCurrency } from '@/utils/format'

interface AffiliateStatsDialogProps {
  open: boolean
  affiliate: Affiliate
  onClose: () => void
}

export function AffiliateStatsDialog({ open, affiliate, onClose }: AffiliateStatsDialogProps) {
  const { showSuccess, showError } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])

  useEffect(() => {
    if (open && affiliate) {
      fetchStats()
    }
  }, [open, affiliate])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await affiliateService.getAffiliateStats(affiliate._id)
      setStats(data.stats)
      setCommissions(data.commissions || [])
    } catch (error) {
      showError('Failed to load affiliate statistics')
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliate.affiliateCode)
    showSuccess('Referral code copied to clipboard')
  }

  const handleCopyInstructions = () => {
    const originalPrice = 2999.99
    let discountAmount = 0
    let discountText = ''
    
    if (affiliate.discountType === 'percentage') {
      discountAmount = (originalPrice * (affiliate.discountPercentage || 0)) / 100
      discountText = `${affiliate.discountPercentage || 0}% off`
    } else {
      discountAmount = Math.min(affiliate.discountFixedAmount || 0, originalPrice)
      discountText = `$${affiliate.discountFixedAmount || 0} off`
    }
    
    const finalPrice = originalPrice - discountAmount
    let commissionAmount = 0
    let commissionText = ''
    
    if (affiliate.commissionType === 'percentage') {
      commissionAmount = (finalPrice * (affiliate.commissionRate || 0)) / 100
      commissionText = `${affiliate.commissionRate || 0}% commission`
    } else {
      commissionAmount = affiliate.commissionFixedAmount || 0
      commissionText = `$${affiliate.commissionFixedAmount || 0} per sale`
    }
    
    const instructions = `
Share your referral code: ${affiliate.affiliateCode}

How it works:
1. Share this code with potential customers
2. They enter "${affiliate.affiliateCode}" when registering for the Master Course
3. They get ${discountText} automatically
4. You earn ${commissionText}

Your benefits:
- Customer discount: ${discountText}
- Your commission: ${commissionText}
- Example: You earn $${commissionAmount.toFixed(2)} per sale
    `.trim()

    navigator.clipboard.writeText(instructions)
    showSuccess('Instructions copied to clipboard')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Affiliate Statistics</Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<LocalOffer />}
              label={affiliate.affiliateCode}
              color="primary"
              onClick={handleCopyCode}
            />
            <Chip
              label={affiliate.isActive ? 'Active' : 'Inactive'}
              color={affiliate.isActive ? 'success' : 'default'}
              size="small"
            />
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Affiliate Info */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Affiliate Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{affiliate.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{affiliate.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Customer Discount
                  </Typography>
                  <Typography variant="body1">
                    {affiliate.discountType === 'percentage' 
                      ? `${affiliate.discountPercentage || 0}%`
                      : `$${affiliate.discountFixedAmount || 0}`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Commission Rate
                  </Typography>
                  <Typography variant="body1">
                    {affiliate.commissionType === 'percentage'
                      ? `${affiliate.commissionRate || 0}%`
                      : `$${affiliate.commissionFixedAmount || 0}`}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Performance Stats */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <ShoppingCart color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4">{stats?.totalSales || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <AttachMoney color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingUp color="info" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4">
                    {formatCurrency(stats?.totalCommission || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commission Earned
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Calculate color="warning" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4">
                    {formatCurrency(stats?.averageSaleValue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Sale Value
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Sharing Instructions */}
            <Alert severity="info" action={
              <Button size="small" onClick={handleCopyInstructions}>
                Copy Instructions
              </Button>
            }>
              <Typography variant="subtitle2" gutterBottom>
                Sharing Instructions for {affiliate.name}
              </Typography>
              <Typography variant="body2">
                Share code <strong>{affiliate.affiliateCode}</strong> with customers. They save{' '}
                {affiliate.discountType === 'percentage' 
                  ? `${affiliate.discountPercentage || 0}%`
                  : `$${affiliate.discountFixedAmount || 0}`}, you earn {' '}
                {affiliate.commissionType === 'percentage'
                  ? `${affiliate.commissionRate || 0}% commission`
                  : `$${affiliate.commissionFixedAmount || 0} per sale`}.
              </Typography>
            </Alert>

            {/* Recent Commissions */}
            {commissions.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Commissions
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Original</TableCell>
                        <TableCell align="right">Discount</TableCell>
                        <TableCell align="right">Final</TableCell>
                        <TableCell align="right">Commission</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissions.slice(0, 10).map((commission) => (
                        <TableRow key={commission._id}>
                          <TableCell>
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{commission.customerEmail}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(commission.originalPrice)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            -{formatCurrency(commission.discountAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(commission.finalPrice)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(commission.commissionAmount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={commission.status}
                              size="small"
                              color={
                                commission.status === 'paid'
                                  ? 'success'
                                  : commission.status === 'pending'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Example Calculation */}
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                💰 Commission Calculation
              </Typography>
              <Typography variant="body2">
                Master Course: <strong>$2,999.99</strong>
              </Typography>
              <Typography variant="body2">
                Customer Discount: <strong>
                  {affiliate.discountType === 'percentage' 
                    ? `${affiliate.discountPercentage || 0}%`
                    : `$${affiliate.discountFixedAmount || 0}`}
                </strong> = $
                {affiliate.discountType === 'percentage'
                  ? ((2999.99 * (affiliate.discountPercentage || 0)) / 100).toFixed(2)
                  : Math.min(affiliate.discountFixedAmount || 0, 2999.99).toFixed(2)} off
              </Typography>
              <Typography variant="body2">
                Customer Pays: <strong>
                  ${affiliate.discountType === 'percentage'
                    ? (2999.99 - (2999.99 * (affiliate.discountPercentage || 0)) / 100).toFixed(2)
                    : (2999.99 - Math.min(affiliate.discountFixedAmount || 0, 2999.99)).toFixed(2)}
                </strong>
              </Typography>
              <Typography variant="body2" color="primary">
                Your Commission: <strong>
                  {affiliate.commissionType === 'percentage'
                    ? `${affiliate.commissionRate || 0}%`
                    : `$${affiliate.commissionFixedAmount || 0}`}
                </strong> = $
                {(() => {
                  const finalPrice = affiliate.discountType === 'percentage'
                    ? 2999.99 - (2999.99 * (affiliate.discountPercentage || 0)) / 100
                    : 2999.99 - Math.min(affiliate.discountFixedAmount || 0, 2999.99)
                  
                  return affiliate.commissionType === 'percentage'
                    ? ((finalPrice * (affiliate.commissionRate || 0)) / 100).toFixed(2)
                    : (affiliate.commissionFixedAmount || 0).toFixed(2)
                })()}{' '}
                per sale
              </Typography>
            </Paper>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}