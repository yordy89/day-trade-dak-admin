'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Skeleton,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Cancel,
} from '@mui/icons-material'
import { useUser, useUpdateUser } from '@/hooks/use-users'
import { toast } from 'react-hot-toast'

export default function EditUserPage() {
  const { t } = useTranslation('users')
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  
  const { data: user, isLoading } = useUser(userId)
  const updateUser = useUpdateUser()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    bio: '',
    city: '',
    country: '',
    allowLiveMeetingAccess: false,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        status: user.status || 'active',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        allowLiveMeetingAccess: user.allowLiveMeetingAccess || false,
      })
    }
  }, [user])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = t('validation.emailRequired', 'Email is required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail', 'Invalid email format')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await updateUser.mutateAsync({ userId, data: formData })
      toast.success(t('messages.userUpdated', 'User updated successfully'))
      router.push(`/users/${userId}`)
    } catch (error) {
      toast.error(t('messages.error', 'Failed to update user'))
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('messages.userNotFound', 'User not found')}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 4 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => router.push(`/users/${userId}`)} size="small">
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                {t('titles.editUser', 'Edit User')}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => router.push(`/users/${userId}`)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={updateUser.isPending}
              >
                {t('common.save', 'Save Changes')}
              </Button>
            </Box>
          </Box>

          {/* Form */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('fields.firstName', 'First Name')}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('fields.lastName', 'Last Name')}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('fields.email', 'Email')}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('fields.phone', 'Phone')}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('fields.role', 'Role')}</InputLabel>
                <Select
                  value={formData.role}
                  label={t('fields.role', 'Role')}
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <MenuItem value="user">{t('roles.user', 'User')}</MenuItem>
                  <MenuItem value="admin">{t('roles.admin', 'Admin')}</MenuItem>
                  <MenuItem value="super_admin">{t('roles.super_admin', 'Super Admin')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'banned')}
                  />
                }
                label={formData.status === 'active' ? t('status.active', 'Active') : t('status.banned', 'Banned')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowLiveMeetingAccess}
                    onChange={(e) => handleChange('allowLiveMeetingAccess', e.target.checked)}
                  />
                }
                label={t('fields.allowLiveMeetingAccess', 'Allow Live Meeting Access')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('fields.city', 'City')}
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('fields.country', 'Country')}
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('fields.bio', 'Bio')}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </Grid>
          </Grid>

          {updateUser.isError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {t('messages.error', 'Failed to update user. Please try again.')}
            </Alert>
          )}
        </Paper>
      </form>
    </Container>
  )
}