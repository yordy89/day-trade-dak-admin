'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CreateEventPage() {
  const router = useRouter()
  const eventService = useEventService()
  const { showSuccess, showError } = useSnackbar()

  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      const eventData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        capacity: formData.capacity || undefined,
        vipPrice: formData.vipPrice || undefined,
        price: formData.price || undefined,
      }

      await eventService.createEvent(eventData)
      showSuccess('Evento creado exitosamente')
      router.push('/events')
    } catch (error) {
      showError('Error al crear el evento')
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/events')
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <PageHeader
          title="Crear Evento"
          subtitle="Configura un nuevo evento o master course"
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

              {/* Actions */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={loading || !formData.name}
                      startIcon={<Save />}
                    >
                      {loading ? 'Creando...' : 'Crear Evento'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleCancel}
                      disabled={loading}
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