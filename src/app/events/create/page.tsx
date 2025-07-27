'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Chip,
  IconButton,
  Divider,
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
  Add,
  Delete,
  Hotel,
  Restaurant,
  CheckCircle,
  Close,
  Phone,
  Email,
  Label,
} from '@mui/icons-material'
import { eventService } from '@/services/event.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { PageHeader } from '@/components/page-header'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function CreateEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
    status: 'active' as 'active' | 'draft' | 'completed',
    featuredInCRM: false,
    metadata: {
      hotel: '',
      hotelAddress: '',
      includesAccommodation: false,
      includesMeals: false,
      includesSaturdayDinner: false,
    },
    included: [] as string[],
    notIncluded: [] as string[],
    requirements: [] as string[],
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
    },
  })

  const [newIncluded, setNewIncluded] = useState('')
  const [newNotIncluded, setNewNotIncluded] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  // Load cloned data if coming from clone action
  useEffect(() => {
    const isClone = searchParams.get('clone') === 'true'
    if (isClone) {
      const cloneData = sessionStorage.getItem('cloneEventData')
      if (cloneData) {
        try {
          const data = JSON.parse(cloneData)
          setFormData(prev => ({
            ...prev,
            ...data,
            date: new Date(), // Reset date for new event
            startDate: null,
            endDate: null,
            isActive: true, // New event should be active
          }))
          sessionStorage.removeItem('cloneEventData')
          showSuccess('Datos del evento clonados. Ajusta las fechas y otros detalles necesarios.')
        } catch (error) {
          console.error('Error loading clone data:', error)
        }
      }
    }
  }, [searchParams, showSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      // Clean up empty strings for optional fields
      const cleanedContact = {
        ...(formData.contact.email && { email: formData.contact.email }),
        ...(formData.contact.phone && { phone: formData.contact.phone }),
        ...(formData.contact.whatsapp && { whatsapp: formData.contact.whatsapp }),
      }

      const cleanedMetadata = {
        ...(formData.metadata.hotel && { hotel: formData.metadata.hotel }),
        ...(formData.metadata.hotelAddress && { hotelAddress: formData.metadata.hotelAddress }),
        includesAccommodation: formData.metadata.includesAccommodation,
        includesMeals: formData.metadata.includesMeals,
        includesSaturdayDinner: formData.metadata.includesSaturdayDinner,
      }

      const eventData = {
        name: formData.name,
        ...(formData.title && { title: formData.title }),
        ...(formData.description && { description: formData.description }),
        date: formData.date.toISOString(),
        ...(formData.startDate && { startDate: formData.startDate.toISOString() }),
        ...(formData.endDate && { endDate: formData.endDate.toISOString() }),
        ...(formData.location && { location: formData.location }),
        ...(formData.bannerImage && { bannerImage: formData.bannerImage }),
        ...(formData.vipPrice && { vipPrice: formData.vipPrice }),
        ...(formData.price && { price: formData.price }),
        isActive: formData.isActive,
        type: formData.type,
        requiresActiveSubscription: formData.requiresActiveSubscription,
        status: formData.status,
        featuredInCRM: formData.featuredInCRM,
        ...(formData.capacity && { capacity: formData.capacity }),
        ...(Object.keys(cleanedMetadata).length > 3 && { metadata: cleanedMetadata }),
        ...(formData.included.length > 0 && { included: formData.included }),
        ...(formData.notIncluded.length > 0 && { notIncluded: formData.notIncluded }),
        ...(formData.requirements.length > 0 && { requirements: formData.requirements }),
        ...(Object.keys(cleanedContact).length > 0 && { contact: cleanedContact }),
      }

      // Map the type if it's 'general' to a type the service accepts
      const serviceEventData = {
        ...eventData,
        type: eventData.type === 'general' ? 'workshop' : eventData.type,
      }
      await eventService.createEvent(serviceEventData as any)
      showSuccess('Evento creado exitosamente')
      router.push('/events')
    } catch (error) {
      showError('Error al crear el evento')
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = (type: 'included' | 'notIncluded' | 'requirements', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }))
      
      // Clear the input
      if (type === 'included') setNewIncluded('')
      else if (type === 'notIncluded') setNewNotIncluded('')
      else if (type === 'requirements') setNewRequirement('')
    }
  }

  const handleRemoveItem = (type: 'included' | 'notIncluded' | 'requirements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleCancel = () => {
    router.push('/events')
  }

  return (
    <AdminLayout>
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

              {/* Hotel and Accommodation */}
              {formData.type === 'community_event' && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Alojamiento y Comidas
                    </Typography>
                    
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Hotel"
                        value={formData.metadata.hotel}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          metadata: { ...formData.metadata, hotel: e.target.value } 
                        })}
                        placeholder="Ej: Hilton Garden Inn Tampa"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Hotel />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Dirección del Hotel"
                        value={formData.metadata.hotelAddress}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          metadata: { ...formData.metadata, hotelAddress: e.target.value } 
                        })}
                        placeholder="Ej: 1700 E 9th Ave, Tampa, FL 33605"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.metadata.includesAccommodation}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              metadata: { ...formData.metadata, includesAccommodation: e.target.checked } 
                            })}
                          />
                        }
                        label="Incluye Alojamiento"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.metadata.includesMeals}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              metadata: { ...formData.metadata, includesMeals: e.target.checked } 
                            })}
                          />
                        }
                        label="Incluye Comidas"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.metadata.includesSaturdayDinner}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              metadata: { ...formData.metadata, includesSaturdayDinner: e.target.checked } 
                            })}
                          />
                        }
                        label="Incluye Cena del Sábado"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* What's Included */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ¿Qué Incluye?
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={newIncluded}
                        onChange={(e) => setNewIncluded(e.target.value)}
                        placeholder="Ej: Material de estudio digital"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddItem('included', newIncluded)
                          }
                        }}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={() => handleAddItem('included', newIncluded)}
                        disabled={!newIncluded.trim()}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Box>
                      {formData.included.map((item, index) => (
                        <Chip
                          key={index}
                          label={item}
                          onDelete={() => handleRemoveItem('included', index)}
                          color="success"
                          variant="outlined"
                          sx={{ m: 0.5 }}
                          icon={<CheckCircle />}
                        />
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* What's Not Included */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    No Incluye
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={newNotIncluded}
                        onChange={(e) => setNewNotIncluded(e.target.value)}
                        placeholder="Ej: Transporte al hotel"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddItem('notIncluded', newNotIncluded)
                          }
                        }}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={() => handleAddItem('notIncluded', newNotIncluded)}
                        disabled={!newNotIncluded.trim()}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Box>
                      {formData.notIncluded.map((item, index) => (
                        <Chip
                          key={index}
                          label={item}
                          onDelete={() => handleRemoveItem('notIncluded', index)}
                          color="error"
                          variant="outlined"
                          sx={{ m: 0.5 }}
                          icon={<Close />}
                        />
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Requisitos
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Ej: Laptop con conexión a internet"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddItem('requirements', newRequirement)
                          }
                        }}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={() => handleAddItem('requirements', newRequirement)}
                        disabled={!newRequirement.trim()}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Box>
                      {formData.requirements.map((item, index) => (
                        <Chip
                          key={index}
                          label={item}
                          onDelete={() => handleRemoveItem('requirements', index)}
                          color="warning"
                          variant="outlined"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información de Contacto
                  </Typography>
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email de Contacto"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, email: e.target.value } 
                      })}
                      placeholder="info@daytradedak.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, phone: e.target.value } 
                      })}
                      placeholder="+1 (555) 123-4567"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="WhatsApp"
                      value={formData.contact.whatsapp}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, whatsapp: e.target.value } 
                      })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </Stack>
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
                    <FormControl fullWidth>
                      <InputLabel>Estado del Evento</InputLabel>
                      <Select
                        value={formData.status}
                        label="Estado del Evento"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <MenuItem value="active">Activo</MenuItem>
                        <MenuItem value="draft">Borrador</MenuItem>
                        <MenuItem value="completed">Completado</MenuItem>
                      </Select>
                    </FormControl>

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

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.featuredInCRM}
                          onChange={(e) => setFormData({ ...formData, featuredInCRM: e.target.checked })}
                          color="warning"
                        />
                      }
                      label="Destacado en CRM"
                    />
                    {formData.featuredInCRM && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Este evento será el único de tipo "{formData.type}" que se mostrará en el CRM. 
                        Otros eventos del mismo tipo serán automáticamente desmarcados.
                      </Alert>
                    )}
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
    </AdminLayout>
  )
}