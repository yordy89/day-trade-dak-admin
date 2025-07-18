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
import { useEventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { Event, EventRegistration } from '@/types/event'
import { PageHeader } from '@/components/page-header'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventService = useEventService()
  const { showSuccess, showError } = useSnackbar()
  
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registrationsLoading, setRegistrationsLoading] = useState(true)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
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
      setEvent(eventData)
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
      setRegistrations(response.data)
      setTotalRegistrations(response.total)
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
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const user = params.row.userId
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.firstName[0]}{user.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">
            {params.row.userId.phone || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'ticketType',
      headerName: 'Tipo de Ticket',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'vip' ? 'VIP' : 'General'}
          color={params.value === 'vip' ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Monto',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          ${params.value}
        </Typography>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Estado de Pago',
      width: 150,
      renderCell: (params) => {
        const statusColors = {
          pending: 'warning',
          completed: 'success',
          failed: 'error',
          refunded: 'info',
        }
        const statusLabels = {
          pending: 'Pendiente',
          completed: 'Completado',
          failed: 'Fallido',
          refunded: 'Reembolsado',
        }
        return (
          <Chip
            label={statusLabels[params.value as keyof typeof statusLabels] || params.value}
            color={statusColors[params.value as keyof typeof statusColors] as any}
            size="small"
          />
        )
      },
    },
    {
      field: 'registeredAt',
      headerName: 'Fecha de Registro',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), 'dd MMM yyyy HH:mm', { locale: es })}
        </Typography>
      ),
    },
    {
      field: 'checkedIn',
      headerName: 'Check-in',
      width: 100,
      align: 'center',
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
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  if (!event) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Evento no encontrado</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={event.name}
        subtitle={event.title}
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
              Editar
            </Button>
          </Stack>
        }
      />

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
                    Ingresos Totales
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    ${statistics?.totalRevenue || 0}
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
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={registrations}
              columns={columns}
              getRowId={(row) => row._id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[25, 50, 100]}
              rowCount={totalRegistrations}
              paginationMode="server"
              loading={registrationsLoading}
              autoHeight
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}