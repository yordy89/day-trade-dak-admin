'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  Stack,
  Avatar,
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  ArrowBack,
  Edit,
  Download,
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  AttachMoney,
  Event as EventIcon,
  LocationOn,
  People,
  MoreVert,
  Email,
  Phone,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import type { Event, EventRegistration } from '@/types/event'
import { PageHeader } from '@/components/page-header'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useAuthStore } from '@/store/auth-store'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()
  const currentUser = useAuthStore((state) => state.user)
  const isSuperAdmin = currentUser?.role === 'super_admin'
  
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registrationsLoading, setRegistrationsLoading] = useState(true)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('')

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const [eventData, statsData] = await Promise.all([
        eventService.getEvent(eventId),
        eventService.getEventStatistics(eventId),
      ])
      // Map the service response to our local Event type
      const mappedEvent: Event = {
        ...eventData as any,
        name: eventData.title || '',  // Map title to name
        isActive: eventData.status === 'active',  // Map status to isActive
      }
      setEvent(mappedEvent)
      setStatistics(statsData)
    } catch (error) {
      showError('Error al cargar el evento')
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true)
      const response = await eventService.getEventRegistrations(eventId, {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
        paymentStatus: paymentStatusFilter,
      })
      // Map service registrations to local type
      const mappedRegistrations: EventRegistration[] = (response.registrations || []).map((reg: any) => ({
        ...reg,
        userId: reg.user,  // Map user to userId
        amount: reg.paymentAmount,  // Map paymentAmount to amount
        registeredAt: reg.registrationDate || reg.createdAt,  // Map registrationDate to registeredAt
      }))
      setRegistrations(mappedRegistrations)
      setTotalRegistrations(response.total || 0)
    } catch (error) {
      showError('Error al cargar los registros')
      console.error('Error fetching registrations:', error)
    } finally {
      setRegistrationsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    fetchRegistrations()
  }, [paginationModel, searchTerm, paymentStatusFilter])

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await eventService.exportRegistrations(eventId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations-${event?.name}-${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showSuccess('Exportación completada')
    } catch (error) {
      showError('Error al exportar registraciones')
      console.error('Error exporting registrations:', error)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Participante',
      flex: 1.2,
      minWidth: 250,
      maxWidth: 350,
      renderCell: (params) => {
        // Handle both populated user object and direct fields
        let firstName = ''
        let lastName = ''
        let email = ''
        
        if (params.row.user && typeof params.row.user === 'object') {
          firstName = params.row.user.firstName || ''
          lastName = params.row.user.lastName || ''
          email = params.row.user.email || ''
        } else if (params.row.userId && typeof params.row.userId === 'object') {
          firstName = params.row.userId.firstName || ''
          lastName = params.row.userId.lastName || ''
          email = params.row.userId.email || ''
        } else {
          firstName = params.row.firstName || ''
          lastName = params.row.lastName || ''
          email = params.row.email || ''
        }
        
        const fullName = `${firstName} ${lastName}`.trim()
        const initials = firstName && lastName ? 
          `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : 
          email ? email.charAt(0).toUpperCase() : '?'
        
        return (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', py: 0.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', flexShrink: 0 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
              <Typography 
                variant="body2" 
                fontWeight={500} 
                sx={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3
                }}
              >
                {fullName || 'Sin nombre'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  display: 'block',
                  lineHeight: 1.3
                }}
              >
                {email}
              </Typography>
            </Box>
          </Stack>
        )
      },
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      flex: 0.8,
      minWidth: 160,
      maxWidth: 200,
      renderCell: (params) => {
        let phone = 'N/A'
        
        // Check all possible phone field locations
        if (params.row.user && typeof params.row.user === 'object') {
          phone = params.row.user.phone || params.row.user.phoneNumber || 'N/A'
        } else if (params.row.userId && typeof params.row.userId === 'object') {
          phone = params.row.userId.phone || params.row.userId.phoneNumber || 'N/A'
        }
        
        // Also check top-level fields
        if (phone === 'N/A') {
          phone = params.row.phoneNumber || params.row.phone || 'N/A'
        }
        
        return (
          <Box display="flex" alignItems="center" gap={0.5} sx={{ height: '100%' }}>
            <Phone fontSize="small" color="action" sx={{ opacity: 0.7 }} />
            <Typography variant="body2" color={phone === 'N/A' ? 'text.secondary' : 'text.primary'}>
              {phone}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'ticketType',
      headerName: 'Tipo de Ticket',
      flex: 0.6,
      minWidth: 110,
      maxWidth: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'vip' ? 'VIP' : 'General'}
          color={params.value === 'vip' ? 'warning' : 'default'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'additionalAttendees',
      headerName: 'Asistentes',
      flex: 0.6,
      minWidth: 120,
      maxWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        // Get additional attendees info
        const additionalAdults = params.row.additionalInfo?.additionalAttendees?.adults || 0
        const children = params.row.additionalInfo?.additionalAttendees?.children || 0
        
        // Total adults is the registrant (1) plus any additional adults
        const totalAdults = 1 + additionalAdults
        const totalAttendees = totalAdults + children
        
        if (totalAttendees === 1) {
          return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body2" color="text.secondary">
                1 adulto
              </Typography>
            </Box>
          )
        }
        
        return (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            py={0.5}
          >
            <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
              {totalAdults} adulto{totalAdults > 1 ? 's' : ''}
            </Typography>
            {children > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {children} niño{children > 1 ? 's' : ''}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ lineHeight: 1.2, mt: 0.5 }}>
              Total: {totalAttendees}
            </Typography>
          </Box>
        )
      },
    },
    ...(isSuperAdmin ? [{
      field: 'paymentAmount',
      headerName: 'Monto',
      flex: 0.5,
      minWidth: 90,
      maxWidth: 120,
      align: 'right' as const,
      headerAlign: 'right' as const,
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          ${(params.value || params.row.amount || 0).toFixed(2)}
        </Typography>
      ),
    }] : []),
    {
      field: 'paymentStatus',
      headerName: 'Estado de Pago',
      flex: 0.7,
      minWidth: 130,
      maxWidth: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const statusColors = {
          pending: 'warning',
          completed: 'success',
          paid: 'success',
          failed: 'error',
          refunded: 'info',
          free: 'default',
        }
        const statusLabels = {
          pending: 'Pendiente',
          completed: 'Completado',
          paid: 'Pagado',
          failed: 'Fallido',
          refunded: 'Reembolsado',
          free: 'Gratis',
        }
        return (
          <Chip
            label={statusLabels[params.value as keyof typeof statusLabels] || params.value}
            color={statusColors[params.value as keyof typeof statusColors] as any}
            size="small"
            sx={{ fontWeight: 500, minWidth: 100 }}
          />
        )
      },
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha de Registro',
      flex: 0.9,
      minWidth: 170,
      maxWidth: 200,
      renderCell: (params) => {
        const date = params.value || params.row.registeredAt || params.row.createdAt
        if (!date) return <Typography variant="body2" color="text.secondary">-</Typography>
        
        try {
          const dateObj = new Date(date)
          // Check if date is valid
          if (isNaN(dateObj.getTime())) {
            return <Typography variant="body2" color="text.secondary">Fecha inválida</Typography>
          }
          
          return (
            <Box>
              <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                {format(dateObj, 'dd MMM yyyy', { locale: es })}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                {format(dateObj, 'HH:mm', { locale: es })}
              </Typography>
            </Box>
          )
        } catch (error) {
          console.error('Error formatting date:', date, error)
          return <Typography variant="body2" color="text.secondary">-</Typography>
        }
      },
    },
    {
      field: 'checkedIn',
      headerName: 'Check-in',
      flex: 0.4,
      minWidth: 85,
      maxWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <CheckCircle color="success" />
        ) : (
          <Cancel color="disabled" />
        )
      ),
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ px: 3, py: 2 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout>
        <PageHeader
          title="Evento no encontrado"
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/events')}
            >
              Volver
            </Button>
          }
        />
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mt: 2 }}>
            El evento solicitado no existe o ha sido eliminado.
          </Alert>
        </Container>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader
        title={event.name || event.title || 'Evento'}
        subtitle={event.title || event.description || undefined}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/events')}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => router.push(`/events/${eventId}/edit`)}
            >
              Editar Evento
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl">
        {/* Event Info Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <EventIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Fecha del Evento
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {format(new Date(event.date), 'dd MMMM yyyy', { locale: es })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ubicación
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {event.location || 'No especificada'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {event.description || 'Sin descripción'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Evento
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estado
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={event.isActive ? 'Activo' : 'Inactivo'}
                      color={event.isActive ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tipo
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={
                        event.type === 'master_course' ? 'Master Course' :
                        event.type === 'community_event' ? 'Evento Comunitario' :
                        'General'
                      }
                      color="primary"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Capacidad
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {event.capacity ? `${statistics?.totalRegistrations || 0} / ${event.capacity}` : 'Ilimitada'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Registros
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {statistics?.totalRegistrations || 0}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
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
                    Tickets VIP
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {statistics?.vipRegistrations || 0}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
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
                    {isSuperAdmin ? 'Ingresos Totales' : 'Registros Pagados'}
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {isSuperAdmin ? (
                      `$${(statistics?.totalRevenue || 0).toFixed(2)}`
                    ) : (
                      statistics?.paidRegistrations || '0'
                    )}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
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
                    Tasa de Check-in
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {statistics?.checkInRate || 0}%
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Registrations Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Registros de Participantes</Typography>
            <Box>
              <IconButton onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => {
                  handleExport('excel')
                  handleMenuClose()
                }}>
                  <Download sx={{ mr: 1 }} fontSize="small" />
                  Exportar Excel
                </MenuItem>
                <MenuItem onClick={() => {
                  handleExport('csv')
                  handleMenuClose()
                }}>
                  <Download sx={{ mr: 1 }} fontSize="small" />
                  Exportar CSV
                </MenuItem>
                <MenuItem onClick={() => {
                  handleExport('pdf')
                  handleMenuClose()
                }}>
                  <Download sx={{ mr: 1 }} fontSize="small" />
                  Exportar PDF
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre o email..."
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
                <InputLabel>Estado de Pago</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  label="Estado de Pago"
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="paid">Pagado</MenuItem>
                  <MenuItem value="free">Gratis</MenuItem>
                  <MenuItem value="failed">Fallido</MenuItem>
                  <MenuItem value="refunded">Reembolsado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('')
                  setPaymentStatusFilter('')
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>

          {/* Registrations Table */}
          <Box sx={{ width: '100%', mt: 3, display: 'flex', flexDirection: 'column' }}>
            <DataGrid
              rows={registrations}
              columns={columns}
              getRowId={(row) => row._id || row.id || Math.random().toString()}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              rowCount={totalRegistrations}
              paginationMode="server"
              loading={registrationsLoading}
              autoHeight
              disableRowSelectionOnClick
              rowHeight={90}
              getRowHeight={() => 90}
              localeText={{
                noRowsLabel: 'No se encontraron registros',
                MuiTablePagination: {
                  labelRowsPerPage: 'Filas por página',
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-row': {
                  minHeight: '90px !important',
                  maxHeight: '90px !important',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.default',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  fontWeight: 600,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid',
                  borderColor: 'divider',
                  mt: 2,
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
      </Container>
    </AdminLayout>
  )
}