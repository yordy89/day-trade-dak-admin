'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip,
  Box,
  Typography,
  IconButton,
} from '@mui/material'
import { Close, Add, Delete } from '@mui/icons-material'
import { useSnackbar } from '@/hooks/use-snackbar'
import { PlanInterval, PlanType } from '@/types/subscription'

interface SubscriptionPlanFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  plan?: any
  mode: 'create' | 'edit'
}

export function SubscriptionPlanForm({
  open,
  onClose,
  onSubmit,
  plan,
  mode,
}: SubscriptionPlanFormProps) {
  const { showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    planId: '',
    displayName: {
      es: '',
      en: '',
    },
    description: {
      es: '',
      en: '',
    },
    pricing: {
      baseAmount: 0,
      currency: 'USD',
      interval: PlanInterval.MONTHLY,
      intervalCount: 1,
    },
    type: PlanType.LIVE,
    features: {
      es: [] as string[],
      en: [] as string[],
    },
    meetingPermissions: {
      canCreateMeetings: false,
      maxMeetingsPerMonth: 0,
      maxMeetingDuration: 60,
      maxParticipantsPerMeeting: 100,
      canRecordMeetings: false,
      canScheduleMeetings: false,
      hasLiveMeetingAccess: false,
    },
    uiMetadata: {
      color: '#1976d2',
      icon: 'CreditCard',
      popular: false,
      sortOrder: 0,
    },
    isActive: true,
  })

  const [newFeature, setNewFeature] = useState({ es: '', en: '' })

  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        ...plan,
        pricing: {
          ...plan.pricing,
          baseAmount: plan.pricing?.baseAmount || 0,
        },
      })
    }
  }, [plan, mode])

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleAddFeature = () => {
    if (newFeature.es && newFeature.en) {
      setFormData((prev) => ({
        ...prev,
        features: {
          es: [...prev.features.es, newFeature.es],
          en: [...prev.features.en, newFeature.en],
        },
      }))
      setNewFeature({ es: '', en: '' })
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        es: prev.features.es.filter((_, i) => i !== index),
        en: prev.features.en.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.planId || !formData.displayName.es || !formData.displayName.en) {
        showError('Por favor completa todos los campos requeridos')
        return
      }

      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {mode === 'create' ? 'Crear Nuevo Plan' : 'Editar Plan'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Información Básica
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ID del Plan"
              value={formData.planId}
              onChange={(e) => handleChange('planId', e.target.value)}
              disabled={mode === 'edit'}
              required
              helperText="Ej: LiveWeeklyManual, MasterClases"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Plan</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Tipo de Plan"
              >
                <MenuItem value={PlanType.LIVE}>En Vivo</MenuItem>
                <MenuItem value={PlanType.COURSE}>Curso</MenuItem>
                <MenuItem value={PlanType.EVENT}>Evento</MenuItem>
                <MenuItem value={PlanType.BUNDLE}>Paquete</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre (Español)"
              value={formData.displayName.es}
              onChange={(e) => handleChange('displayName.es', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre (Inglés)"
              value={formData.displayName.en}
              onChange={(e) => handleChange('displayName.en', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción (Español)"
              value={formData.description.es}
              onChange={(e) => handleChange('description.es', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción (Inglés)"
              value={formData.description.en}
              onChange={(e) => handleChange('description.en', e.target.value)}
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Precios
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Precio Base"
              value={formData.pricing.baseAmount}
              onChange={(e) => handleChange('pricing.baseAmount', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Intervalo</InputLabel>
              <Select
                value={formData.pricing.interval}
                onChange={(e) => handleChange('pricing.interval', e.target.value)}
                label="Intervalo"
              >
                <MenuItem value={PlanInterval.WEEKLY}>Semanal</MenuItem>
                <MenuItem value={PlanInterval.MONTHLY}>Mensual</MenuItem>
                <MenuItem value={PlanInterval.YEARLY}>Anual</MenuItem>
                <MenuItem value={PlanInterval.ONCE}>Único</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Orden"
              value={formData.uiMetadata.sortOrder}
              onChange={(e) => handleChange('uiMetadata.sortOrder', parseInt(e.target.value) || 0)}
              helperText="Orden de visualización"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.uiMetadata.popular}
                  onChange={(e) => handleChange('uiMetadata.popular', e.target.checked)}
                />
              }
              label="Plan Popular"
            />
          </Grid>

          {/* Features */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Características
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} alignItems="flex-start">
              <TextField
                size="small"
                label="Característica (Español)"
                value={newFeature.es}
                onChange={(e) => setNewFeature({ ...newFeature, es: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Característica (Inglés)"
                value={newFeature.en}
                onChange={(e) => setNewFeature({ ...newFeature, en: e.target.value })}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddFeature}
                disabled={!newFeature.es || !newFeature.en}
                startIcon={<Add />}
              >
                Agregar
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.features.es.map((feature, index) => (
                <Chip
                  key={index}
                  label={`${feature} / ${formData.features.en[index]}`}
                  onDelete={() => handleRemoveFeature(index)}
                  deleteIcon={<Delete />}
                />
              ))}
            </Box>
          </Grid>

          {/* Meeting Permissions */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Permisos de Reuniones
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.meetingPermissions.canCreateMeetings}
                  onChange={(e) => handleChange('meetingPermissions.canCreateMeetings', e.target.checked)}
                />
              }
              label="Puede crear reuniones"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.meetingPermissions.hasLiveMeetingAccess}
                  onChange={(e) => handleChange('meetingPermissions.hasLiveMeetingAccess', e.target.checked)}
                />
              }
              label="Acceso a reuniones en vivo"
            />
          </Grid>

          {formData.meetingPermissions.canCreateMeetings && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reuniones por mes"
                  value={formData.meetingPermissions.maxMeetingsPerMonth}
                  onChange={(e) => handleChange('meetingPermissions.maxMeetingsPerMonth', parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duración máxima (min)"
                  value={formData.meetingPermissions.maxMeetingDuration}
                  onChange={(e) => handleChange('meetingPermissions.maxMeetingDuration', parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Participantes máximos"
                  value={formData.meetingPermissions.maxParticipantsPerMeeting}
                  onChange={(e) => handleChange('meetingPermissions.maxParticipantsPerMeeting', parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.meetingPermissions.canRecordMeetings}
                      onChange={(e) => handleChange('meetingPermissions.canRecordMeetings', e.target.checked)}
                    />
                  }
                  label="Puede grabar"
                />
              </Grid>
            </>
          )}

          {/* Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              }
              label="Plan Activo"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {mode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}