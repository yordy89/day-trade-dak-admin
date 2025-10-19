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
  Chip,
  IconButton,
  Divider,
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
import type { Event } from '@/types/event'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
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
    type: 'general' as 'master_course' | 'community_event' | 'general' | 'workshop' | 'webinar' | 'seminar' | 'bootcamp' | 'conference',
    requiresActiveSubscription: false,
    capacity: 0,
    status: 'active' as 'active' | 'draft' | 'completed' | 'cancelled',
    featuredInCRM: false,
    showInLandingPage: false,
    // Partial payment settings
    paymentMode: 'full_only' as 'full_only' | 'partial_allowed',
    minimumDepositAmount: 0,
    depositPercentage: 50,
    minimumInstallmentAmount: 50,
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

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEvent(eventId)
      // Map the service response to our local Event type
      const mappedEvent: Event = {
        ...eventData as any,
        name: eventData.title || '',  // Map title to name
        isActive: eventData.status === 'active',  // Map status to isActive
      }
      setEvent(mappedEvent)
      
      // Update form data with mapped event data
      setFormData({
        name: mappedEvent.name,
        title: mappedEvent.title || '',
        description: mappedEvent.description || '',
        date: new Date(mappedEvent.date),
        startDate: mappedEvent.startDate ? new Date(mappedEvent.startDate) : null,
        endDate: mappedEvent.endDate ? new Date(mappedEvent.endDate) : null,
        location: mappedEvent.location || '',
        bannerImage: mappedEvent.bannerImage || '',
        vipPrice: mappedEvent.vipPrice || 0,
        price: mappedEvent.price || 0,
        isActive: mappedEvent.isActive,
        type: mappedEvent.type as 'master_course' | 'community_event' | 'general' | 'workshop' | 'webinar' | 'seminar' | 'bootcamp' | 'conference',
        requiresActiveSubscription: mappedEvent.requiresActiveSubscription || false,
        capacity: mappedEvent.capacity || 0,
        status: mappedEvent.status || 'active',
        featuredInCRM: mappedEvent.featuredInCRM || false,
        showInLandingPage: mappedEvent.showInLandingPage || false,
        // Load payment settings
        paymentMode: (mappedEvent as any).paymentMode || 'full_only',
        minimumDepositAmount: (mappedEvent as any).minimumDepositAmount || 0,
        depositPercentage: (mappedEvent as any).depositPercentage || 50,
        minimumInstallmentAmount: (mappedEvent as any).minimumInstallmentAmount || 50,
        metadata: {
          hotel: mappedEvent.metadata?.hotel || '',
          hotelAddress: mappedEvent.metadata?.hotelAddress || '',
          includesAccommodation: mappedEvent.metadata?.includesAccommodation || false,
          includesMeals: mappedEvent.metadata?.includesMeals || false,
          includesSaturdayDinner: mappedEvent.metadata?.includesSaturdayDinner || false,
        },
        included: mappedEvent.included || [],
        notIncluded: mappedEvent.notIncluded || [],
        requirements: mappedEvent.requirements || [],
        contact: {
          email: mappedEvent.contact?.email || '',
          phone: mappedEvent.contact?.phone || '',
          whatsapp: mappedEvent.contact?.whatsapp || '',
        },
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
      
      // Build event data, excluding empty/zero values for optional fields
      const eventData: any = {
        name: formData.name,
        date: formData.date.toISOString(),
        isActive: formData.isActive,
        type: formData.type,
        requiresActiveSubscription: formData.requiresActiveSubscription,
        status: formData.status,
        featuredInCRM: formData.featuredInCRM,
        showInLandingPage: formData.showInLandingPage,
      }

      // Add optional string fields only if they have content
      if (formData.title?.trim()) eventData.title = formData.title
      if (formData.description?.trim()) eventData.description = formData.description
      if (formData.location?.trim()) eventData.location = formData.location
      if (formData.bannerImage?.trim()) eventData.bannerImage = formData.bannerImage

      // Add optional date fields
      if (formData.startDate) eventData.startDate = formData.startDate.toISOString()
      if (formData.endDate) eventData.endDate = formData.endDate.toISOString()

      // Add optional number fields only if greater than 0
      if (formData.vipPrice > 0) eventData.vipPrice = formData.vipPrice
      if (formData.price > 0) eventData.price = formData.price
      if (formData.capacity > 0) eventData.capacity = formData.capacity

      // Add payment settings
      eventData.paymentMode = formData.paymentMode
      if (formData.paymentMode === 'partial_allowed') {
        eventData.minimumDepositAmount = formData.minimumDepositAmount
        eventData.depositPercentage = formData.depositPercentage
        eventData.minimumInstallmentAmount = formData.minimumInstallmentAmount
      }

      // Add metadata only if it has content
      const metadata: any = {}
      if (formData.metadata.hotel?.trim()) metadata.hotel = formData.metadata.hotel
      if (formData.metadata.hotelAddress?.trim()) metadata.hotelAddress = formData.metadata.hotelAddress
      metadata.includesAccommodation = formData.metadata.includesAccommodation
      metadata.includesMeals = formData.metadata.includesMeals
      metadata.includesSaturdayDinner = formData.metadata.includesSaturdayDinner
      if (Object.keys(metadata).length > 3 || metadata.hotel || metadata.hotelAddress) {
        eventData.metadata = metadata
      }

      // Add arrays only if they have items
      if (formData.included.length > 0) eventData.included = formData.included
      if (formData.notIncluded.length > 0) eventData.notIncluded = formData.notIncluded
      if (formData.requirements.length > 0) eventData.requirements = formData.requirements

      // Add contact only if it has content
      const contact: any = {}
      if (formData.contact.email?.trim()) contact.email = formData.contact.email
      if (formData.contact.phone?.trim()) contact.phone = formData.contact.phone
      if (formData.contact.whatsapp?.trim()) contact.whatsapp = formData.contact.whatsapp
      if (Object.keys(contact).length > 0) {
        eventData.contact = contact
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

  if (loading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout>
        <Container maxWidth="xl">
          <Alert severity="error">Evento no encontrado</Alert>
        </Container>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
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
                            <MenuItem value="workshop">Workshop</MenuItem>
                            <MenuItem value="webinar">Webinar</MenuItem>
                            <MenuItem value="seminar">Seminario</MenuItem>
                            <MenuItem value="bootcamp">Bootcamp</MenuItem>
                            <MenuItem value="conference">Conferencia</MenuItem>
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

                {/* Payment Settings */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Configuración de Pagos
                    </Typography>

                    <Stack spacing={3}>
                      <FormControl fullWidth>
                        <InputLabel>Modo de Pago</InputLabel>
                        <Select
                          value={formData.paymentMode}
                          label="Modo de Pago"
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                        >
                          <MenuItem value="full_only">Solo Pago Completo</MenuItem>
                          <MenuItem value="partial_allowed">Permitir Pagos Parciales</MenuItem>
                        </Select>
                      </FormControl>

                      {formData.paymentMode === 'partial_allowed' && (
                        <Alert severity="info">
                          Los pagos parciales permiten a los usuarios pagar un depósito inicial y el resto en cuotas.
                        </Alert>
                      )}

                      {formData.paymentMode === 'partial_allowed' && (
                        <>
                          <TextField
                            fullWidth
                            type="number"
                            label="Depósito Mínimo (USD)"
                            value={formData.minimumDepositAmount}
                            onChange={(e) => setFormData({ ...formData, minimumDepositAmount: Number(e.target.value) })}
                            helperText="Monto mínimo que debe pagar como depósito"
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
                            label="Porcentaje de Depósito (%)"
                            value={formData.depositPercentage}
                            onChange={(e) => setFormData({ ...formData, depositPercentage: Number(e.target.value) })}
                            helperText="Porcentaje del precio total sugerido como depósito"
                            inputProps={{ min: 0, max: 100 }}
                          />

                          <TextField
                            fullWidth
                            type="number"
                            label="Pago Mínimo de Cuota (USD)"
                            value={formData.minimumInstallmentAmount}
                            onChange={(e) => setFormData({ ...formData, minimumInstallmentAmount: Number(e.target.value) })}
                            helperText="Monto mínimo para pagos adicionales"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Divider />

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Ejemplo de Configuración:
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                              • Precio del evento: {`$${formData.price || 0}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                              • Depósito sugerido ({formData.depositPercentage}%): {`$${((formData.price || 0) * (formData.depositPercentage / 100)).toFixed(2)}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                              • Depósito mínimo: {`$${formData.minimumDepositAmount}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                              • Saldo restante: {`$${((formData.price || 0) - ((formData.price || 0) * (formData.depositPercentage / 100))).toFixed(2)}`}
                            </Typography>
                          </Box>
                        </>
                      )}
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
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showInLandingPage}
                            onChange={(e) => setFormData({ ...formData, showInLandingPage: e.target.checked })}
                            color="success"
                          />
                        }
                        label="Mostrar en Landing Page"
                      />
                      {formData.showInLandingPage && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Este evento aparecerá en la página de eventos públicos para registro gratuito.
                        </Alert>
                      )}
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
                          {event.currentRegistrations || event.registrations || 0}
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
    </AdminLayout>
  )
}