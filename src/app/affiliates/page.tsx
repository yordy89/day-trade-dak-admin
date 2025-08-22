'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Tooltip,
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  PowerSettingsNew,
  LocalOffer,
  TrendingUp,
  People,
  AttachMoney,
  Search,
  Refresh,
  ContentCopy,
  Visibility,
  Payment,
  Cancel,
  CheckCircle,
  Pending,
  AccountBalanceWallet,
  MonetizationOn,
  FilterList,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import affiliateService, { Affiliate, Commission } from '@/services/affiliate.service'
import { CreateAffiliateDialog } from '@/components/affiliates/CreateAffiliateDialog'
import { EditAffiliateDialog } from '@/components/affiliates/EditAffiliateDialog'
import { AffiliateStatsDialog } from '@/components/affiliates/AffiliateStatsDialog'
import { useSnackbar } from '@/hooks/use-snackbar'
import { formatCurrency } from '@/utils/format'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`affiliate-tabpanel-${index}`}
      aria-labelledby={`affiliate-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AffiliatesPage() {
  const { t } = useTranslation(['affiliates', 'common'])
  const { showSuccess, showError } = useSnackbar()
  const [tabValue, setTabValue] = useState(0)
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [commissionFilter, setCommissionFilter] = useState({
    status: 'all',
    affiliateId: 'all',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [affiliatesData, commissionsData] = await Promise.all([
        affiliateService.getAffiliates(),
        affiliateService.getCommissions(),
      ])
      setAffiliates(affiliatesData)
      setCommissions(commissionsData)
    } catch (error) {
      showError('Failed to load data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleStatus = async (affiliate: Affiliate) => {
    try {
      await affiliateService.toggleAffiliateStatus(affiliate._id)
      showSuccess(`Affiliate ${affiliate.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchData()
    } catch (error) {
      showError('Failed to toggle affiliate status')
      console.error('Error toggling status:', error)
    }
  }

  const handleDelete = async (affiliate: Affiliate) => {
    if (!confirm(`Are you sure you want to delete affiliate ${affiliate.affiliateCode}?`)) {
      return
    }

    try {
      await affiliateService.deleteAffiliate(affiliate._id)
      showSuccess('Affiliate deleted successfully')
      fetchData()
    } catch (error) {
      showError('Failed to delete affiliate')
      console.error('Error deleting affiliate:', error)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showSuccess('Referral code copied to clipboard')
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchData()
    showSuccess('Affiliate created successfully')
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setSelectedAffiliate(null)
    fetchData()
    showSuccess('Affiliate updated successfully')
  }

  const handleCommissionStatusUpdate = async (commissionId: string, status: 'paid' | 'cancelled') => {
    try {
      const updateData: any = { status }
      if (status === 'paid') {
        updateData.paidAt = new Date()
      }

      await affiliateService.updateCommissionStatus(commissionId, updateData)
      showSuccess(`Commission marked as ${status}`)
      fetchData()
      setPaymentDialogOpen(false)
      setSelectedCommission(null)
    } catch (error) {
      showError(`Failed to update commission status`)
      console.error('Error updating status:', error)
    }
  }

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCommissions = commissions.filter(commission => {
    if (commissionFilter.status !== 'all' && commission.status !== commissionFilter.status) {
      return false
    }
    if (commissionFilter.affiliateId !== 'all' && commission.affiliateId !== commissionFilter.affiliateId) {
      return false
    }
    return true
  })

  const getAffiliateDetails = (affiliateId: string) => {
    return affiliates.find(a => a._id === affiliateId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('affiliates:status.pending')
      case 'paid':
        return t('affiliates:status.paid')
      case 'cancelled':
        return t('affiliates:status.cancelled')
      case 'approved':
        return t('affiliates:status.approved')
      default:
        return status
    }
  }

  // Calculate pending commissions for a specific affiliate
  const getAffiliatePendingCommissions = (affiliateId: string) => {
    return commissions
      .filter(c => c.affiliateId === affiliateId && c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0)
  }

  // Calculate totals
  const totalRevenue = affiliates.reduce((sum, a) => sum + a.totalRevenue, 0)
  const totalCommissions = affiliates.reduce((sum, a) => sum + a.totalCommission, 0)
  const totalSales = affiliates.reduce((sum, a) => sum + a.totalSales, 0)
  const activeAffiliates = affiliates.filter((a) => a.isActive).length

  const commissionStats = {
    total: commissions.length,
    pending: commissions.filter(c => c.status === 'pending').length,
    paid: commissions.filter(c => c.status === 'paid').length,
    cancelled: commissions.filter(c => c.status === 'cancelled').length,
    totalPending: commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
    totalPaid: commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0),
  }

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {t('affiliates:stats.active')}
                    </Typography>
                    <Typography variant="h4">{activeAffiliates}</Typography>
                  </Box>
                  <People color="primary" sx={{ fontSize: 40 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {t('affiliates:table.totalSales')}
                    </Typography>
                    <Typography variant="h4">{totalSales}</Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {t('affiliates:stats.lifetime')}
                    </Typography>
                    <Typography variant="h4">{formatCurrency(totalRevenue)}</Typography>
                  </Box>
                  <AttachMoney color="info" sx={{ fontSize: 40 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Pending Commissions
                    </Typography>
                    <Typography variant="h4">{formatCurrency(commissionStats.totalPending)}</Typography>
                  </Box>
                  <MonetizationOn color="warning" sx={{ fontSize: 40 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalOffer />
                <span>Affiliates</span>
                <Chip label={affiliates.length} size="small" />
              </Stack>
            } 
          />
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <MonetizationOn />
                <span>Commissions</span>
                <Chip 
                  label={commissionStats.pending} 
                  size="small" 
                  color="warning"
                />
              </Stack>
            } 
          />
        </Tabs>
      </Paper>

      {/* Affiliates Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Actions Bar */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <TextField
              placeholder="Search by code, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                {t('common:actions.refresh')}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                {t('affiliates:buttons.new')}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Affiliates Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('affiliates:table.code')}</TableCell>
                <TableCell>{t('affiliates:table.name')}</TableCell>
                <TableCell>{t('affiliates:table.email')}</TableCell>
                <TableCell align="center">{t('affiliates:table.discount')}</TableCell>
                <TableCell align="center">{t('affiliates:table.commission')}</TableCell>
                <TableCell align="right">{t('affiliates:table.totalSales')}</TableCell>
                <TableCell align="right">{t('affiliates:table.totalCommission')}</TableCell>
                <TableCell align="right">{t('affiliates:stats.owed')}</TableCell>
                <TableCell align="center">{t('affiliates:table.status')}</TableCell>
                <TableCell align="center">{t('affiliates:table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAffiliates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      {t('affiliates:empty.title')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={<LocalOffer />}
                          label={affiliate.affiliateCode}
                          size="small"
                          variant="outlined"
                          onClick={() => handleCopyCode(affiliate.affiliateCode)}
                        />
                        <Tooltip title="Copy code">
                          <IconButton size="small" onClick={() => handleCopyCode(affiliate.affiliateCode)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell>{affiliate.name}</TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          affiliate.discountType === 'percentage'
                            ? `${affiliate.discountPercentage}%`
                            : `$${affiliate.discountFixedAmount}`
                        }
                        size="small"
                        variant={affiliate.discountType === 'percentage' ? 'outlined' : 'filled'}
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          affiliate.commissionType === 'percentage'
                            ? `${affiliate.commissionRate}%`
                            : `$${affiliate.commissionFixedAmount}`
                        }
                        size="small"
                        variant={affiliate.commissionType === 'percentage' ? 'outlined' : 'filled'}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">{affiliate.totalSales}</TableCell>
                    <TableCell align="right">{formatCurrency(affiliate.totalRevenue)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color={getAffiliatePendingCommissions(affiliate._id) > 0 ? 'warning.main' : 'text.secondary'}>
                        {formatCurrency(getAffiliatePendingCommissions(affiliate._id))}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={affiliate.isActive ? t('affiliates:status.active') : t('affiliates:status.inactive')}
                        color={affiliate.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAffiliate(affiliate)
                              setStatsDialogOpen(true)
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common:actions.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAffiliate(affiliate)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={affiliate.isActive ? t('affiliates:buttons.deactivate') : t('affiliates:buttons.activate')}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(affiliate)}
                            color={affiliate.isActive ? 'warning' : 'success'}
                          >
                            <PowerSettingsNew />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Commissions Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <FilterList />
              <TextField
                select
                label={t('common:common.status')}
                value={commissionFilter.status}
                onChange={(e) => setCommissionFilter({ ...commissionFilter, status: e.target.value })}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">{t('affiliates:filters.all')}</MenuItem>
                <MenuItem value="pending">{t('affiliates:status.pending')}</MenuItem>
                <MenuItem value="paid">{t('affiliates:status.paid')}</MenuItem>
                <MenuItem value="cancelled">{t('affiliates:status.cancelled')}</MenuItem>
              </TextField>

              <TextField
                select
                label={t('affiliates:commission.affiliate')}
                value={commissionFilter.affiliateId}
                onChange={(e) => setCommissionFilter({ ...commissionFilter, affiliateId: e.target.value })}
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="all">{t('affiliates:filters.all')}</MenuItem>
                {affiliates.map((affiliate) => (
                  <MenuItem key={affiliate._id} value={affiliate._id}>
                    {affiliate.name} ({affiliate.affiliateCode})
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ flex: 1 }} />
              
              <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                {t('common:actions.refresh')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Commission Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Pending color="warning" />
                    <Chip label={`${commissionStats.pending} ${t('affiliates:status.pending')}`} size="small" color="warning" />
                  </Stack>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(commissionStats.totalPending)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('affiliates:stats.owed')}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <CheckCircle color="success" />
                    <Chip label={`${commissionStats.paid} ${t('affiliates:status.paid')}`} size="small" color="success" />
                  </Stack>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(commissionStats.totalPaid)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('affiliates:stats.lifetime')}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Commissions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:common.date')}</TableCell>
                <TableCell>{t('affiliates:table.code')}</TableCell>
                <TableCell>{t('affiliates:commission.affiliate')}</TableCell>
                <TableCell>{t('affiliates:commission.customer')}</TableCell>
                <TableCell align="right">{t('affiliates:commission.originalAmount')}</TableCell>
                <TableCell align="right">{t('common:common.discount')}</TableCell>
                <TableCell align="right">{t('common:common.price')}</TableCell>
                <TableCell align="right">{t('affiliates:table.commission')}</TableCell>
                <TableCell align="center">{t('common:common.status')}</TableCell>
                <TableCell align="center">{t('common:table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      {t('affiliates:empty.commissions')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommissions.map((commission) => {
                  const affiliate = getAffiliateDetails(commission.affiliateId)
                  return (
                    <TableRow key={commission._id}>
                      <TableCell>
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<LocalOffer />}
                          label={commission.affiliateCode}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{affiliate?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Stack spacing={0}>
                          <Typography variant="body2">
                            {commission.customerName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {commission.customerEmail}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(commission.originalPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        -{formatCurrency(commission.discountAmount)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(commission.finalPrice)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(commission.commissionAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(commission.status)}
                          color={getStatusColor(commission.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {commission.status === 'pending' && (
                            <>
                              <Tooltip title={t('affiliates:buttons.markPaid')}>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedCommission(commission)
                                    setPaymentDialogOpen(true)
                                  }}
                                >
                                  <Payment />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('common:actions.cancel')}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleCommissionStatusUpdate(commission._id, 'cancelled')}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {commission.status === 'paid' && commission.paidAt && (
                            <Typography variant="caption" color="text.secondary">
                              {t('affiliates:status.paid')} {new Date(commission.paidAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Dialogs */}
      <CreateAffiliateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedAffiliate && (
        <>
          <EditAffiliateDialog
            open={editDialogOpen}
            affiliate={selectedAffiliate}
            onClose={() => {
              setEditDialogOpen(false)
              setSelectedAffiliate(null)
            }}
            onSuccess={handleEditSuccess}
          />

          <AffiliateStatsDialog
            open={statsDialogOpen}
            affiliate={selectedAffiliate}
            onClose={() => {
              setStatsDialogOpen(false)
              setSelectedAffiliate(null)
            }}
          />
        </>
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>{t('affiliates:commission.title')}</DialogTitle>
        <DialogContent>
          {selectedCommission && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                {t('affiliates:messages.commissionPaid')}
              </Alert>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('affiliates:commission.affiliate')}: {getAffiliateDetails(selectedCommission.affiliateId)?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('affiliates:commission.amount')}: {formatCurrency(selectedCommission.commissionAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('affiliates:commission.customer')}: {selectedCommission.customerEmail}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => selectedCommission && handleCommissionStatusUpdate(selectedCommission._id, 'paid')}
          >
            {t('common:actions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}