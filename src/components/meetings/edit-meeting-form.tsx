'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Stack,
  Grid,
  Autocomplete,
  Chip,
  FormHelperText,
  Alert,
} from '@mui/material'
import {
  Save,
  Cancel,
  CalendarMonth,
  AccessTime,
  People,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useUpdateMeeting } from '@/hooks/use-meetings'
import { useUsers, useAdminHosts } from '@/hooks/use-users'
import { toast } from 'react-hot-toast'

interface EditMeetingFormProps {
  meeting: any
  onSuccess: () => void
  onCancel: () => void
}

export function EditMeetingForm({ meeting, onSuccess, onCancel }: EditMeetingFormProps) {
  const { t } = useTranslation('meetings')
  const updateMeeting = useUpdateMeeting()
  const { data: usersData } = useUsers({ limit: 100 })
  const { data: adminHosts } = useAdminHosts()

  const [formData, setFormData] = useState({
    title: meeting.title || '',
    description: meeting.description || '',
    scheduledAt: new Date(meeting.scheduledAt),
    duration: meeting.duration || 60,
    participants: meeting.participants?.map((p: any) => p._id || p) || [],
    maxParticipants: meeting.maxParticipants || 100,
    isPublic: meeting.isPublic || false,
    requiresApproval: meeting.requiresApproval || false,
    enableRecording: meeting.enableRecording || false,
    enableChat: meeting.enableChat || true,
    enableScreenShare: meeting.enableScreenShare || true,
    enableWaitingRoom: meeting.enableWaitingRoom || false,
    meetingType: meeting.meetingType || 'other',
    hostId: meeting.host?._id || meeting.host || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title) {
      newErrors.title = t('errors.titleRequired', 'Title is required')
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = t('errors.dateRequired', 'Date is required')
    }

    if (formData.duration < 15) {
      newErrors.duration = t('errors.durationMin', 'Duration must be at least 15 minutes')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await updateMeeting.mutateAsync({
        id: meeting._id,
        data: {
          ...formData,
          participants: formData.participants,
        }
      })
      toast.success(t('messages.meetingUpdated', 'Meeting updated successfully'))
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || t('messages.updateError', 'Failed to update meeting'))
    } finally {
      setLoading(false)
    }
  }

  const users = usersData?.users || []
  const selectedUsers = users.filter((user: any) => formData.participants.includes(user._id))

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('sections.basicInfo', 'Basic Information')}
              </Typography>
              <Stack spacing={2}>
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
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('fields.host', 'Meeting Host')}</InputLabel>
                      <Select
                        value={formData.hostId}
                        label={t('fields.host', 'Meeting Host')}
                        onChange={(e) => handleChange('hostId', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{t('fields.keepCurrentHost', 'Keep current host')}</em>
                        </MenuItem>
                        {adminHosts?.map((host) => (
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
                        ))}
                      </Select>
                      <FormHelperText>
                        {t('fields.hostHelperText', 'Only admins and super-admins can host meetings')}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            {/* Schedule */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('sections.schedule', 'Schedule')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label={t('fields.startDateTime', 'Start Date & Time')}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('fields.duration', 'Duration (minutes)')}
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    InputProps={{
                      inputProps: { min: 15, max: 480, step: 15 }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Participants */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('sections.participants', 'Participants')}
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  multiple
                  options={users}
                  value={selectedUsers}
                  onChange={(e, value) => {
                    handleChange('participants', value.map((u: any) => u._id))
                  }}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('fields.participants', 'Select Participants')}
                      placeholder={t('fields.participantsPlaceholder', 'Search users...')}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`${option.firstName} ${option.lastName}`}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label={t('fields.maxParticipants', 'Maximum Participants')}
                  value={formData.maxParticipants}
                  onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value) || 0)}
                  InputProps={{
                    inputProps: { min: 2, max: 1000 }
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Meeting Settings */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('sections.settings', 'Meeting Settings')}
              </Typography>
              <Stack spacing={1}>
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
                  label={t('fields.requiresApproval', 'Requires Approval')}
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
              </Stack>
            </Paper>

            {/* Features */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('sections.features', 'Meeting Features')}
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableRecording}
                      onChange={(e) => handleChange('enableRecording', e.target.checked)}
                    />
                  }
                  label={t('fields.recording', 'Enable Recording')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableChat}
                      onChange={(e) => handleChange('enableChat', e.target.checked)}
                    />
                  }
                  label={t('fields.chat', 'Enable Chat')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableScreenShare}
                      onChange={(e) => handleChange('enableScreenShare', e.target.checked)}
                    />
                  }
                  label={t('fields.screenShare', 'Enable Screen Share')}
                />
              </Stack>
            </Paper>

            {/* Meeting Info */}
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('info.meetingId', 'Meeting ID')}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                {meeting.meetingId}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('info.roomUrl', 'Meeting URL')}
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {meeting.roomUrl}
              </Typography>
            </Paper>

            {/* Actions */}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? t('actions.saving', 'Saving...') : t('actions.save', 'Save Changes')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={loading}
              >
                {t('actions.cancel', 'Cancel')}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}