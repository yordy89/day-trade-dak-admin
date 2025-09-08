'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  Event as EventIcon,
  People,
  AttachMoney,
  CalendarToday,
  Download,
  FilterList,
  ContentCopy,
  Star,
  StarBorder,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import type { Event } from '@/types/event'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function EventsPage() {
  const router = useRouter()
  const { showSuccess, showError } = useSnackbar()

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Menu and dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventService.getEvents({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
      })
      
      // Map service events to local Event type and fetch real registration counts
      const eventsWithCounts = [];
      
      for (const event of (response.events || [])) {
        let actualRegistrations = 0;
        
        // Log the event details for debugging
        console.log(`Processing event: ${event.title} (ID: ${event._id})`);
        console.log(`Backend registration value: ${event.registrations || 'undefined'}`);
        
        try {
          // Make the API call to get actual registrations
          const registrationsResponse = await eventService.getEventRegistrations(event._id, { limit: 1 });
          actualRegistrations = registrationsResponse.total || 0;
          console.log(`✅ Successfully fetched actual count for ${event.title}: ${actualRegistrations}`);
        } catch (error) {
          console.error(`❌ Failed to fetch registrations for ${event.title} (${event._id}):`, error);
          // Don't use backend value - it's wrong. Default to 0
          actualRegistrations = 0;
        }
        
        // Create the mapped event with the correct registration count
        const mappedEvent = {
          ...event,
          name: event.title || '',
          isActive: event.status === 'active',
          registrations: actualRegistrations,
          currentRegistrations: actualRegistrations,
        };
        
        eventsWithCounts.push(mappedEvent);
      }
      
      const mappedEvents: Event[] = eventsWithCounts;
      
      console.log('Final mapped events to be set in state:', mappedEvents);
      console.log('Webinar registration count:', mappedEvents.find(e => e.type === 'webinar')?.registrations);
      
      setEvents(mappedEvents)
      setTotalEvents(response.total || 0)
    } catch (error) {
      showError('Error al cargar los eventos')
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce the fetch to avoid multiple calls
    const timer = setTimeout(() => {
      fetchEvents()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [paginationModel, searchTerm, typeFilter, statusFilter])

  const handleCreateEvent = () => {
    router.push('/events/create')
  }

  const handleEditEvent = (event: Event) => {
    router.push(`/events/${event._id}/edit`)
  }

  const handleViewEvent = (event: Event) => {
    router.push(`/events/${event._id}`)
  }

  const handleCloneEvent = (event: Event) => {
    // Pass the event data as query parameters to pre-fill the form
    const eventData = {
      name: event.name,
      title: event.title,
      description: event.description,
      location: event.location,
      type: event.type,
      price: event.price,
      vipPrice: event.vipPrice,
      capacity: event.capacity,
      requiresActiveSubscription: event.requiresActiveSubscription,
      bannerImage: event.bannerImage,
      metadata: event.metadata,
      included: event.included,
      notIncluded: event.notIncluded,
      requirements: event.requirements,
      contact: event.contact,
    }
    
    // Store in sessionStorage to avoid URL length issues
    sessionStorage.setItem('cloneEventData', JSON.stringify(eventData))
    router.push('/events/create?clone=true')
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      await eventService.deleteEvent(selectedEvent._id)
      showSuccess('Evento eliminado exitosamente')
      setDeleteDialogOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (error) {
      showError('Error al eliminar el evento')
      console.error('Error deleting event:', error)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventData: Event) => {
    setAnchorEl(event.currentTarget)
    setSelectedEvent(eventData)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleExportRegistrations = async (eventId: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await eventService.exportRegistrations(eventId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations-${eventId}.${format === 'excel' ? 'xlsx' : format}`
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

  const handleToggleFeatured = async (event: Event) => {
    try {
      await eventService.toggleFeaturedStatus(event._id)
      showSuccess(event.featuredInCRM ? 'Evento removido de CRM' : 'Evento destacado en CRM')
      fetchEvents()
    } catch (error) {
      showError('Error al actualizar estado destacado')
      console.error('Error toggling featured status:', error)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name || params.row.title}
          </Typography>
          {params.row.title && params.row.name && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {params.row.title}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const typeLabels = {
          master_course: 'Master Course',
          community_event: 'Evento Comunitario',
          general: 'General',
          workshop: 'Workshop',
          webinar: 'Webinar',
          seminar: 'Seminario',
          bootcamp: 'Bootcamp',
          conference: 'Conferencia',
        }
        const typeColors = {
          master_course: 'primary',
          community_event: 'success',
          general: 'default',
          workshop: 'info',
          webinar: 'warning',
          seminar: 'secondary',
          bootcamp: 'error',
          conference: 'primary',
        }
        const eventType = params.value || 'general'
        return (
          <Chip
            label={typeLabels[eventType as keyof typeof typeLabels] || 'General'}
            color={typeColors[eventType as keyof typeof typeColors] as any || 'default'}
            size="small"
            sx={{ minWidth: 120 }}
          />
        )
      },
    },
    {
      field: 'date',
      headerName: 'Fecha',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => {
        const eventDate = new Date(params.value)
        return (
          <Box display="flex" alignItems="center" gap={0.5} height="100%">
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              {format(eventDate, 'dd MMM yyyy', { locale: es })}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'registrations',
      headerName: 'Registros',
      width: 110,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={0.5} height="100%">
          <People sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={500}>
            {params.row.registrations || params.row.currentRegistrations || 0}
            {params.row.capacity && `/${params.row.capacity}`}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'Precio',
      width: 140,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={0.5} height="100%">
          <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={500}>
            ${(params.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const event = params.row
        const eventDate = new Date(event.date)
        const now = new Date()
        
        let status = 'Activo'
        let color: 'success' | 'default' | 'info' = 'success'
        
        // Check event status based on backend data
        if (event.status === 'draft' || event.isActive === false) {
          status = 'Borrador'
          color = 'default'
        } else if (eventDate < now) {
          status = 'Completado'
          color = 'info'
        }
        
        return (
          <Chip
            label={status}
            color={color}
            size="small"
            sx={{ 
              minWidth: 90,
              fontWeight: 500
            }}
          />
        )
      },
    },
    {
      field: 'featuredInCRM',
      headerName: 'CRM',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isFeatured = params.value === true
        return (
          <IconButton
            size="small"
            onClick={async (e) => {
              e.stopPropagation()
              await handleToggleFeatured(params.row)
            }}
            color={isFeatured ? 'warning' : 'default'}
            title={isFeatured ? 'Destacado en CRM' : 'No destacado en CRM'}
          >
            {isFeatured ? <Star /> : <StarBorder />}
          </IconButton>
        )
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      align: 'center',
      sortable: false,
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
      <Container maxWidth="xl">
      <PageHeader
        title="Eventos"
        subtitle="Gestiona eventos comunitarios y master courses"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateEvent}
          >
            Crear Evento
          </Button>
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Eventos
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={60} /> : totalEvents}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
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
                    Eventos Activos
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={60} /> : events?.filter(e => {
                      const eventDate = new Date(e.date)
                      const now = new Date()
                      return e.isActive !== false && eventDate >= now
                    }).length || 0}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
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
                    Total Registros
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {loading ? <Skeleton width={60} /> : 
                      events?.reduce((acc, event) => {
                        const count = typeof event.registrations === 'number' 
                          ? event.registrations 
                          : Array.isArray(event.registrations) 
                            ? event.registrations.length 
                            : event.currentRegistrations || 0;
                        return acc + count;
                      }, 0) || 0
                    }
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
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
                    Próximo Evento
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {loading ? <Skeleton width={100} /> : (() => {
                      const upcomingEvents = events?.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                      return upcomingEvents?.[0]?.name || upcomingEvents?.[0]?.title || 'N/A';
                    })()}
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar eventos..."
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={typeFilter}
                  label="Tipo"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="master_course">Master Course</MenuItem>
                  <MenuItem value="community_event">Evento Comunitario</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="workshop">Workshop</MenuItem>
                  <MenuItem value="webinar">Webinar</MenuItem>
                  <MenuItem value="seminar">Seminario</MenuItem>
                  <MenuItem value="bootcamp">Bootcamp</MenuItem>
                  <MenuItem value="conference">Conferencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="draft">Borrador</MenuItem>
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
                  setTypeFilter('')
                  setStatusFilter('')
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card 
        sx={{ 
          overflow: 'hidden',
          '& .MuiDataGrid-root': {
            border: 'none',
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={events}
            columns={columns}
            getRowId={(row) => row._id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            rowCount={totalEvents}
            paginationMode="server"
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            rowHeight={70}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.default',
                borderBottom: 2,
                borderColor: 'divider',
                '& .MuiDataGrid-columnHeader': {
                  fontWeight: 600,
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: 2,
                borderColor: 'divider',
                backgroundColor: 'background.default',
              },
            }}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewEvent(selectedEvent!)
          handleMenuClose()
        }}>
          <People sx={{ mr: 1 }} fontSize="small" />
          Ver Registros
        </MenuItem>
        <MenuItem onClick={() => {
          handleEditEvent(selectedEvent!)
          handleMenuClose()
        }}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleCloneEvent(selectedEvent!)
          handleMenuClose()
        }}>
          <ContentCopy sx={{ mr: 1 }} fontSize="small" />
          Clonar
        </MenuItem>
        <MenuItem onClick={async () => {
          await handleToggleFeatured(selectedEvent!)
          handleMenuClose()
        }}>
          {selectedEvent?.featuredInCRM ? (
            <>
              <StarBorder sx={{ mr: 1 }} fontSize="small" />
              Quitar de CRM
            </>
          ) : (
            <>
              <Star sx={{ mr: 1 }} fontSize="small" />
              Destacar en CRM
            </>
          )}
        </MenuItem>
        <MenuItem divider />
        <MenuItem onClick={() => {
          handleExportRegistrations(selectedEvent!._id, 'excel')
          handleMenuClose()
        }}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Exportar Excel
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportRegistrations(selectedEvent!._id, 'csv')
          handleMenuClose()
        }}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Exportar CSV
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportRegistrations(selectedEvent!._id, 'pdf')
          handleMenuClose()
        }}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Exportar PDF
        </MenuItem>
        <MenuItem divider />
        <MenuItem 
          onClick={() => {
            setDeleteDialogOpen(true)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteEvent}
        title="Eliminar Evento"
        message={`¿Estás seguro de que deseas eliminar el evento "${selectedEvent?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmColor="error"
      />
    </Container>
    </AdminLayout>
  )
}