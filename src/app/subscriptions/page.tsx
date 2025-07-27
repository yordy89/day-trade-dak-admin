'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Alert,
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  Search,
  Download,
  FilterList,
  CreditCard,
  TrendingUp,
  People,
  AttachMoney,
  MoreVert,
  Cancel,
  Refresh,
  Edit,
  Add,
  CheckCircle,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/page-header'
import { SubscriptionPlanForm } from '@/components/subscriptions/subscription-plan-form'
import { useSubscriptionService } from '@/services/subscription.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  UserSubscription, 
  SubscriptionFilters, 
  SubscriptionStatistics,
  SubscriptionPlan 
} from '@/types/subscription'

export default function SubscriptionsPage() {
  const subscriptionService = useSubscriptionService()
  const { showSuccess, showError } = useSnackbar()

  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  
  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPlan, setEditingPlan] = useState<any | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const filters: SubscriptionFilters = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
        status: typeFilter as any, // Using status field for plan type filter
      }

      const response = await subscriptionService.getSubscriptions(filters)
      setSubscriptions(response.subscriptions)
      setTotalSubscriptions(response.pagination.total)
    } catch (error) {
      showError('Error al cargar los planes de suscripción')
      console.error('Error fetching subscription plans:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics from the loaded data
  const statistics = useMemo(() => {
    const totalPlans = subscriptions.length
    const activePlans = subscriptions.filter(plan => plan.isActive).length
    const totalActiveSubscribers = subscriptions.reduce((sum, plan) => sum + (plan.activeSubscribers || 0), 0)
    
    // Calculate MRR
    const monthlyRecurringRevenue = subscriptions.reduce((sum, plan) => {
      const activeUsers = plan.activeSubscribers || 0
      const baseAmount = plan.pricing?.baseAmount || 0
      const interval = plan.pricing?.interval || 'monthly'
      
      let monthlyAmount = 0
      switch (interval) {
        case 'monthly':
          monthlyAmount = baseAmount
          break
        case 'yearly':
          monthlyAmount = baseAmount / 12
          break
        case 'weekly':
          monthlyAmount = baseAmount * 4.33 // Average weeks per month
          break
        default:
          monthlyAmount = 0
      }
      
      return sum + (activeUsers * monthlyAmount)
    }, 0)
    
    return {
      totalSubscriptions: totalPlans,
      activeSubscriptions: activePlans,
      monthlyRecurringRevenue,
      totalActiveSubscribers,
    }
  }, [subscriptions])

  useEffect(() => {
    fetchSubscriptions()
  }, [paginationModel, searchTerm, typeFilter])

  const handleDeactivatePlan = async (plan: any) => {
    try {
      await subscriptionService.cancelSubscription(plan._id)
      showSuccess('Plan desactivado exitosamente')
      fetchSubscriptions()
    } catch (error) {
      showError('Error al desactivar el plan')
      console.error('Error deactivating plan:', error)
    }
  }

  const handleActivatePlan = async (plan: any) => {
    try {
      await subscriptionService.reactivateSubscription(plan._id)
      showSuccess('Plan activado exitosamente')
      fetchSubscriptions()
    } catch (error) {
      showError('Error al activar el plan')
      console.error('Error activating plan:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await subscriptionService.exportSubscriptions(format, {
        search: searchTerm,
        status: typeFilter as any,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscription-plans-${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showSuccess('Exportación completada')
    } catch (error) {
      showError('Error al exportar planes de suscripción')
      console.error('Error exporting subscription plans:', error)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plan: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedPlan(plan)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPlan(null)
  }

  const handleCreatePlan = () => {
    setFormMode('create')
    setEditingPlan(null)
    setFormOpen(true)
  }

  const handleEditPlan = (plan: any) => {
    setFormMode('edit')
    setEditingPlan(plan)
    setFormOpen(true)
    handleMenuClose()
  }

  const handleFormSubmit = async (planData: any) => {
    try {
      if (formMode === 'create') {
        await subscriptionService.createSubscriptionPlan(planData)
        showSuccess('Plan creado exitosamente')
      } else {
        await subscriptionService.updateSubscriptionPlan(editingPlan._id, planData)
        showSuccess('Plan actualizado exitosamente')
      }
      fetchSubscriptions()
      setFormOpen(false)
    } catch (error: any) {
      showError(error.message || `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} el plan`)
      console.error('Error submitting plan:', error)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'planId',
      headerName: 'ID del Plan',
      width: 200,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'displayName',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 250,
      disableColumnMenu: true,
      renderCell: (params) => {
        const plan = params.row
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            height: '100%',
            overflow: 'hidden'
          }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {plan.displayName?.es || plan.planId}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {plan.displayName?.en || ''}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: (params) => {
        const typeLabels: Record<string, string> = {
          live: 'En Vivo',
          course: 'Curso',
          event: 'Evento',
          bundle: 'Paquete',
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Chip
              label={typeLabels[params.value as string] || params.value}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )
      },
    },
    {
      field: 'pricing',
      headerName: 'Precio',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      disableColumnMenu: true,
      renderCell: (params) => {
        const plan = params.row
        const intervalLabels: Record<string, string> = {
          monthly: '/mes',
          weekly: '/semana',
          yearly: '/año',
          once: ' (único)',
        }
        return (
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(plan.pricing?.baseAmount)}
            {intervalLabels[plan.pricing?.interval as string] || ''}
          </Typography>
        )
      },
    },
    {
      field: 'subscribers',
      headerName: 'Suscriptores',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: (params) => {
        const plan = params.row
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <Typography variant="body2" fontWeight={500}>
              {plan.activeSubscribers || 0} activos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {plan.totalSubscribers || 0} total
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'revenue',
      headerName: 'Ingresos',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      disableColumnMenu: true,
      renderCell: (params) => {
        const plan = params.row
        return (
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(plan.monthlyRevenue)}
          </Typography>
        )
      },
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value ? 'Activo' : 'Inactivo'}
            size="small"
            color={params.value ? 'success' : 'default'}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ]

  return (
    <AdminLayout>
      <Box>
        <PageHeader
          title="Planes de Suscripción"
          subtitle="Gestiona los planes de suscripción disponibles"
          action={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExport('excel')}
              >
                Exportar
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreatePlan}
              >
                Nuevo Plan
              </Button>
            </Stack>
          }
        />
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Planes
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalSubscriptions}
                    </Typography>
                  </Box>
                  <CreditCard sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Planes Activos
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.activeSubscriptions}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Ingresos Mensuales (MRR)
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {formatCurrency(statistics.monthlyRecurringRevenue)}
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Suscriptores Activos
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalActiveSubscribers}
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Table */}
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por ID o nombre del plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Plan</InputLabel>
                    <Select
                      value={typeFilter}
                      label="Tipo de Plan"
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="live">En Vivo</MenuItem>
                      <MenuItem value="course">Curso</MenuItem>
                      <MenuItem value="event">Evento</MenuItem>
                      <MenuItem value="bundle">Paquete</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ px: 3, pb: 3 }}>
              <DataGrid
                rows={subscriptions}
                columns={columns}
                getRowId={(row) => row._id}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[25, 50, 100]}
                rowCount={totalSubscriptions}
                paginationMode="server"
                loading={loading}
                autoHeight
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .MuiDataGrid-cell--textLeft': {
                    justifyContent: 'flex-start',
                  },
                  '& .MuiDataGrid-cell--textCenter': {
                    justifyContent: 'center',
                  },
                  '& .MuiDataGrid-cell--textRight': {
                    justifyContent: 'flex-end',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'background.default',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: 'background.default',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid',
                    borderColor: 'divider',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuOption onClick={() => {
            handleEditPlan(selectedPlan)
          }}>
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Editar Plan
          </MenuOption>
          {selectedPlan?.isActive ? (
            <MenuOption 
              onClick={() => {
                handleDeactivatePlan(selectedPlan)
                handleMenuClose()
              }}
              sx={{ color: 'error.main' }}
            >
              <Cancel sx={{ mr: 1, fontSize: 20 }} />
              Desactivar Plan
            </MenuOption>
          ) : (
            <MenuOption 
              onClick={() => {
                if (selectedPlan) {
                  handleActivatePlan(selectedPlan)
                }
                handleMenuClose()
              }}
              sx={{ color: 'success.main' }}
            >
              <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
              Activar Plan
            </MenuOption>
          )}
        </Menu>

        {/* Subscription Plan Form Dialog */}
        <SubscriptionPlanForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          plan={editingPlan}
          mode={formMode}
        />
      </Box>
    </AdminLayout>
  )
}