'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Typography,
  Alert,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
  IconButton,
} from '@mui/material'
import {
  CalendarMonth,
  AccessTime,
  People,
  VideoCall,
  Repeat,
  Close,
  Add,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useCreateMeeting } from '@/hooks/use-meetings'
import { useUsers, useAdminHosts } from '@/hooks/use-users'
import { toast } from 'react-hot-toast'
import { SubscriptionSelector } from './subscription-selector'

interface CreateMeetingDialogProps {
  open: boolean
  onClose: () => void
  isRecurring?: boolean
}

export function CreateMeetingDialog({ open, onClose, isRecurring = false }: CreateMeetingDialogProps) {
  const { t } = useTranslation('meetings')
  const createMeeting = useCreateMeeting()
  const { data: usersData } = useUsers({ limit: 100 })
  const { data: adminHosts, isLoading: hostsLoading, error: hostsError } = useAdminHosts()
  
  // Debug logging
  console.log('Admin hosts data:', adminHosts)
  console.log('Hosts loading:', hostsLoading)
  console.log('Hosts error:', hostsError)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: new Date(),
    duration: 60,
    participants: [] as string[],
    isRecurring: isRecurring,
    recurringType: 'daily' as 'daily' | 'weekly' | 'monthly',
    recurringDays: [] as number[],
    recurringEndDate: null as Date | null,
    recurringTime: '09:00',
    maxParticipants: 100,
    isPublic: false,
    requiresApproval: false,
    enableRecording: false,
    enableChat: true,
    enableScreenShare: true,
    enableWaitingRoom: false,
    meetingType: 'other',
    hostId: '',
    provider: 'zoom' as 'zoom' | 'videosdk' | 'livekit',
    // Subscription fields
    allowedSubscriptions: [] as string[],
    restrictedToSubscriptions: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title) {
      newErrors.title = t('validation.titleRequired', 'Title is required')
    }
    
    if (!formData.scheduledAt) {
      newErrors.scheduledAt = t('validation.dateRequired', 'Date is required')
    }
    
    if (!formData.hostId) {
      newErrors.hostId = t('validation.hostRequired', 'Please select a meeting host')
    }
    
    if (formData.isRecurring) {
      if (formData.recurringType === 'weekly' && formData.recurringDays.length === 0) {
        newErrors.recurringDays = t('validation.selectDays', 'Select at least one day')
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await createMeeting.mutateAsync({
        ...formData,
        recurringEndDate: formData.recurringEndDate || undefined
      })
      toast.success(
        formData.isRecurring 
          ? t('messages.recurringMeetingCreated', 'Recurring meeting created successfully')
          : t('messages.meetingCreated', 'Meeting created successfully')
      )
      onClose()
      resetForm()
    } catch (error: any) {
      // Handle specific error messages from the API
      const errorMessage = error?.response?.data?.message || error?.message || t('messages.error', 'Failed to create meeting')
      toast.error(errorMessage)
      
      // If it's a validation error for hostId, set it in the form errors
      if (errorMessage.toLowerCase().includes('host')) {
        setErrors(prev => ({ ...prev, hostId: errorMessage }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledAt: new Date(),
      duration: 60,
      participants: [],
      isRecurring: false,
      recurringType: 'daily' as 'daily' | 'weekly' | 'monthly',
      recurringDays: [],
      recurringEndDate: null,
      recurringTime: '09:00',
      maxParticipants: 100,
      isPublic: false,
      requiresApproval: false,
      enableRecording: false,
      enableChat: true,
      enableScreenShare: true,
      enableWaitingRoom: false,
      meetingType: 'other',
      hostId: '',
      provider: 'zoom' as 'zoom' | 'videosdk' | 'livekit',
      allowedSubscriptions: [],
      restrictedToSubscriptions: false,
    })
    setErrors({})
  }

  const weekDays = [
    { value: 1, label: t('days.monday', 'Monday') },
    { value: 2, label: t('days.tuesday', 'Tuesday') },
    { value: 3, label: t('days.wednesday', 'Wednesday') },
    { value: 4, label: t('days.thursday', 'Thursday') },
    { value: 5, label: t('days.friday', 'Friday') },
    { value: 6, label: t('days.saturday', 'Saturday') },
    { value: 0, label: t('days.sunday', 'Sunday') },
  ]

  const applyDailyLivePreset = () => {
    setFormData(prev => ({
      ...prev,
      title: 'Daily Live Trading Session',
      description: 'Join our daily live trading session where we analyze the market and discuss trading strategies.',
      meetingType: 'daily_live',
      isRecurring: true,
      recurringType: 'weekly' as 'daily' | 'weekly' | 'monthly',
      recurringDays: [1, 2, 3, 4, 5], // Monday to Friday
      recurringTime: '08:45',
      duration: 90,
      enableRecording: true,
      maxParticipants: 500,
      // Keep current hostId selection
    }))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <VideoCall />
            <Typography variant="h6">
              {formData.isRecurring 
                ? t('titles.createRecurringMeeting', 'Create Recurring Meeting')
                : t('titles.createMeeting', 'Create Meeting')
              }
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Quick Presets */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('presets.title', 'Quick Presets')}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={applyDailyLivePreset}
              startIcon={<CalendarMonth />}
            >
              {t('presets.dailyLive', 'Daily Live (Mon-Fri 8:45 AM)')}
            </Button>
          </Box>

          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('sections.basicInfo', 'Basic Information')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label={t('fields.title', 'Meeting Title')}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('fields.description', 'Description')}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>{t('fields.meetingType', 'Meeting Type')}</InputLabel>
                <Select
                  value={formData.meetingType}
                  label={t('fields.meetingType', 'Meeting Type')}
                  onChange={(e) => handleChange('meetingType', e.target.value)}
                >
                  <MenuItem value="daily_live">{t('meetingTypes.dailyLive', 'Daily Live Trading')}</MenuItem>
                  <MenuItem value="mentorship">{t('meetingTypes.mentorship', 'Mentorship')}</MenuItem>
                  <MenuItem value="support">{t('meetingTypes.support', 'Support')}</MenuItem>
                  <MenuItem value="special_event">{t('meetingTypes.specialEvent', 'Special Event')}</MenuItem>
                  <MenuItem value="other">{t('meetingTypes.other', 'Other')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>{t('fields.provider', 'Meeting Provider')}</InputLabel>
                <Select
                  value={formData.provider}
                  label={t('fields.provider', 'Meeting Provider')}
                  onChange={(e) => handleChange('provider', e.target.value)}
                >
                  <MenuItem value="zoom">{t('providers.zoom', 'Zoom')}</MenuItem>
                  <MenuItem value="videosdk">{t('providers.videosdk', 'VideoSDK')}</MenuItem>
                  <MenuItem value="livekit">{t('providers.livekit', 'LiveKit (Self-Hosted)')}</MenuItem>
                </Select>
                <FormHelperText>
                  {formData.provider === 'livekit' 
                    ? t('fields.providerHelperTextLiveKit', 'LiveKit is self-hosted on your own servers')
                    : t('fields.providerHelperText', 'Select the video platform for this meeting')
                  }
                </FormHelperText>
              </FormControl>
              <FormControl fullWidth error={!!errors.hostId}>
                <InputLabel>{t('fields.host', 'Meeting Host')}</InputLabel>
                <Select
                  value={formData.hostId}
                  label={t('fields.host', 'Meeting Host')}
                  onChange={(e) => handleChange('hostId', e.target.value)}
                  displayEmpty
                  disabled={hostsLoading}
                  required
                >
                  <MenuItem value="" disabled>
                    <em>{t('fields.selectHost', 'Select a host')}</em>
                  </MenuItem>
                  {hostsLoading && (
                    <MenuItem disabled>
                      <em>Loading hosts...</em>
                    </MenuItem>
                  )}
                  {hostsError && (
                    <MenuItem disabled>
                      <em>Error loading hosts</em>
                    </MenuItem>
                  )}
                  {adminHosts && adminHosts.length > 0 ? (
                    adminHosts.map((host) => (
                      <MenuItem key={host._id} value={host._id}>
                        <Box>
                          <Typography variant="body2">
                            {host.fullName || 
                             (host.firstName && host.lastName ? `${host.firstName} ${host.lastName}` : '') || 
                             host.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {host.role === 'super_admin' ? 'Super Admin' : 'Admin'} - {host.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    !hostsLoading && !hostsError && (
                      <MenuItem disabled>
                        <em>No admin users found</em>
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>
                  {errors.hostId || t('fields.hostHelperText', 'Select an admin user to host this meeting. Only admins and super-admins can host meetings.')}
                </FormHelperText>
              </FormControl>
            </Box>
          </Box>

          {/* Schedule */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('sections.schedule', 'Schedule')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) => handleChange('isRecurring', e.target.checked)}
                  />
                }
                label={t('fields.recurringMeeting', 'Recurring Meeting')}
              />

              {!formData.isRecurring ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={t('fields.dateTime', 'Date & Time')}
                    value={formData.scheduledAt}
                    onChange={(value) => handleChange('scheduledAt', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.scheduledAt,
                        helperText: errors.scheduledAt,
                      },
                    }}
                  />
                </LocalizationProvider>
              ) : (
                <>
                  <FormControl fullWidth>
                    <InputLabel>{t('fields.recurringType', 'Recurrence Pattern')}</InputLabel>
                    <Select
                      value={formData.recurringType}
                      label={t('fields.recurringType', 'Recurrence Pattern')}
                      onChange={(e) => handleChange('recurringType', e.target.value)}
                    >
                      <MenuItem value="daily">{t('recurrence.daily', 'Daily')}</MenuItem>
                      <MenuItem value="weekly">{t('recurrence.weekly', 'Weekly')}</MenuItem>
                      <MenuItem value="monthly">{t('recurrence.monthly', 'Monthly')}</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.recurringType === 'weekly' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('fields.selectDays', 'Select Days')}
                      </Typography>
                      <ToggleButtonGroup
                        value={formData.recurringDays}
                        onChange={(e, value) => handleChange('recurringDays', value)}
                        aria-label="weekdays"
                        size="small"
                      >
                        {weekDays.map(day => (
                          <ToggleButton key={day.value} value={day.value}>
                            {day.label.substring(0, 3)}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {errors.recurringDays && (
                        <FormHelperText error>{errors.recurringDays}</FormHelperText>
                      )}
                    </Box>
                  )}

                  <TextField
                    type="time"
                    label={t('fields.meetingTime', 'Meeting Time')}
                    value={formData.recurringTime}
                    onChange={(e) => handleChange('recurringTime', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={t('fields.endDate', 'End Date (Optional)')}
                      value={formData.recurringEndDate}
                      onChange={(value) => handleChange('recurringEndDate', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}

              <TextField
                type="number"
                label={t('fields.duration', 'Duration (minutes)')}
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                fullWidth
                InputProps={{
                  inputProps: { min: 15, max: 480, step: 15 }
                }}
              />
            </Box>
          </Box>

          {/* Participants */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('sections.participants', 'Participants')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Autocomplete
                multiple
                options={usersData?.users || []}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                value={usersData?.users.filter(u => formData.participants.includes(u._id)) || []}
                onChange={(e, value) => handleChange('participants', value.map(v => v._id))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('fields.inviteParticipants', 'Invite Participants')}
                    placeholder={t('placeholders.searchUsers', 'Search users...')}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={`${option.firstName} ${option.lastName}`}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />

              <TextField
                type="number"
                label={t('fields.maxParticipants', 'Max Participants')}
                value={formData.maxParticipants}
                onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
                fullWidth
                InputProps={{
                  inputProps: { min: 2, max: 500 }
                }}
              />
            </Box>
          </Box>

          {/* Subscription Access */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('sections.subscriptionAccess', 'Subscription Access')}
            </Typography>
            <SubscriptionSelector
              selectedSubscriptions={formData.allowedSubscriptions}
              onSubscriptionsChange={(subscriptions) => handleChange('allowedSubscriptions', subscriptions)}
              restrictedToSubscriptions={formData.restrictedToSubscriptions}
              onRestrictedChange={(restricted) => handleChange('restrictedToSubscriptions', restricted)}
              helperText={t('fields.subscriptionHelperText', 'Choose which subscription plans are required to access this meeting')}
            />
          </Box>

          {/* Settings */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('sections.settings', 'Meeting Settings')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => handleChange('isPublic', e.target.checked)}
                  />
                }
                label={t('fields.publicMeeting', 'Public Meeting')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requiresApproval}
                    onChange={(e) => handleChange('requiresApproval', e.target.checked)}
                  />
                }
                label={t('fields.requiresApproval', 'Requires Approval to Join')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableWaitingRoom}
                    onChange={(e) => handleChange('enableWaitingRoom', e.target.checked)}
                  />
                }
                label={t('fields.waitingRoom', 'Enable Waiting Room')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableRecording}
                    onChange={(e) => handleChange('enableRecording', e.target.checked)}
                  />
                }
                label={t('fields.enableRecording', 'Enable Recording')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableChat}
                    onChange={(e) => handleChange('enableChat', e.target.checked)}
                  />
                }
                label={t('fields.enableChat', 'Enable Chat')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableScreenShare}
                    onChange={(e) => handleChange('enableScreenShare', e.target.checked)}
                  />
                }
                label={t('fields.enableScreenShare', 'Enable Screen Sharing')}
              />
            </Box>
          </Box>

          {formData.isRecurring && (
            <Alert severity="info">
              {formData.meetingType === 'daily_live' 
                ? t('info.dailyLiveMeeting', 'This will create a single reusable meeting that updates its schedule daily at midnight.')
                : t('info.recurringMeeting', 'This will create multiple meeting instances based on your recurrence pattern.')
              }
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={createMeeting.isPending}
          startIcon={formData.isRecurring ? <Repeat /> : <VideoCall />}
        >
          {formData.isRecurring 
            ? t('common.createRecurring', 'Create Recurring Meeting')
            : t('common.create', 'Create Meeting')
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}