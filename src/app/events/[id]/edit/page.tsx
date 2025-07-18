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
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import {
  ArrowBack,
  Save,
  Event as EventIcon,
  LocationOn,
  AttachMoney,
  People,
  Image,
} from '@mui/icons-material'
import { useEventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { PageHeader } from '@/components/page-header'
import { Event } from '@/types/event'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventService = useEventService()
  const { showSuccess, showError } = useSnackbar()
  
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    date: new Date(),
    startDate: null as Date | null,
    endDate: null as Date | null,
    location: '',
    bannerImage: '',
    vipPrice: 0,
    price: 0,
    isActive: true,
    type: 'general' as 'master_course' | 'community_event' | 'general',
    requiresActiveSubscription: false,
    capacity: 0,
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEvent(eventId)
      setEvent(eventData)
      
      // Update form data with event data
      setFormData({
        name: eventData.name,
        title: eventData.title || '',
        description: eventData.description || '',
        date: new Date(eventData.date),
        startDate: eventData.startDate ? new Date(eventData.startDate) : null,
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        location: eventData.location || '',
        bannerImage: eventData.bannerImage || '',
        vipPrice: eventData.vipPrice || 0,
        price: eventData.price || 0,
        isActive: eventData.isActive,
        type: eventData.type,
        requiresActiveSubscription: eventData.requiresActiveSubscription || false,
        capacity: eventData.capacity || 0,
      })
    } catch (error) {
      showError('Error al cargar el evento')
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      
      const eventData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        capacity: formData.capacity || undefined,
        vipPrice: formData.vipPrice || undefined,
        price: formData.price || undefined,
      }

      await eventService.updateEvent(eventId, eventData)
      showSuccess('Evento actualizado exitosamente')
      router.push('/events')
    } catch (error) {
      showError('Error al actualizar el evento')
      console.error('Error updating event:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/events')
  }

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <PageHeader
          title="Editar Evento"
          subtitle={`Editando: ${event.name}`}
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          }
        />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información Básica
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nombre del Evento"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Ej: Master Course Trading Avanzado"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Título"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Aprende estrategias avanzadas de trading"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descripción"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe el evento, qué aprenderán los participantes, etc."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Tipo de Evento</InputLabel>
                        <Select
                          value={formData.type}
                          label="Tipo de Evento"
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                          <MenuItem value="general">General</MenuItem>
                          <MenuItem value="master_course">Master Course</MenuItem>
                          <MenuItem value="community_event">Evento Comunitario</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ubicación"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej: Tampa, Florida"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Date and Time */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fecha y Hora
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <DateTimePicker
                        label="Fecha del Evento"
                        value={formData.date}
                        onChange={(newValue) => setFormData({ ...formData, date: newValue! })}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <DateTimePicker
                        label="Fecha de Inicio"
                        value={formData.startDate}
                        onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <DateTimePicker
                        label="Fecha de Fin"
                        value={formData.endDate}
                        onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Media */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Medios
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="URL de Imagen Banner"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Image />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {formData.bannerImage && (
                    <Box mt={2}>
                      <img
                        src={formData.bannerImage}
                        alt="Banner preview"
                        style={{
                          width: '100%',
                          maxHeight: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Pricing and Configuration */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Precios y Capacidad
                  </Typography>
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Precio General"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      type="number"
                      label="Precio VIP"
                      value={formData.vipPrice}
                      onChange={(e) => setFormData({ ...formData, vipPrice: Number(e.target.value) })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      type="number"
                      label="Capacidad"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      placeholder="0 = Ilimitado"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <People />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Configuración
                  </Typography>
                  
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                      }
                      label="Evento Activo"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requiresActiveSubscription}
                          onChange={(e) => setFormData({ ...formData, requiresActiveSubscription: e.target.checked })}
                        />
                      }
                      label="Requiere Suscripción Activa"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información del Evento
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Registros Totales
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {event.registrations?.length || 0}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Creado
                      </Typography>
                      <Typography variant="body1">
                        {new Date(event.createdAt).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Última Actualización
                      </Typography>
                      <Typography variant="body1">
                        {new Date(event.updatedAt).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={saving || !formData.name}
                      startIcon={<Save />}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </LocalizationProvider>
  )
}