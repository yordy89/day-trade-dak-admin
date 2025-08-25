'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Stack,
  Divider,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save, Cancel, Lock } from '@mui/icons-material';
import { useSnackbar } from '@/hooks/use-snackbar';
import { userService } from '@/services/user.service';
import { UserModulePermissionsSection } from './user-module-permissions-section';
import { useAuthStore } from '@/store/auth-store';

interface UserEditFormProps {
  userId?: string;
  initialData?: any;
  onCancel: () => void;
}

export function UserEditForm({ userId, initialData, onCancel }: UserEditFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [loading, setLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    status: 'active',
    bio: '',
    city: '',
    country: '',
    allowLiveMeetingAccess: false,
    allowLiveWeeklyAccess: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        password: '', // Password is not editable in edit mode
        phone: initialData.phone || '',
        role: initialData.role || 'user',
        status: initialData.status || 'active',
        bio: initialData.bio || '',
        city: initialData.city || '',
        country: initialData.country || '',
        allowLiveMeetingAccess: initialData.allowLiveMeetingAccess || false,
        allowLiveWeeklyAccess: initialData.allowLiveWeeklyAccess || false,
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password is required only for new users
    if (!userId && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!userId && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (userId) {
        await userService.updateUser(userId, formData);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        const user = await userService.createUser(formData);
        showSuccess('Usuario creado exitosamente');
        router.push(`/users/${user._id}/edit`);
      }
    } catch (error: any) {
      showError(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword) {
      setPasswordError('La contraseña es requerida');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      setResettingPassword(true);
      setPasswordError('');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        throw new Error('Error al resetear la contraseña');
      }

      showSuccess('Contraseña actualizada exitosamente');
      setResetPasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showError(error.message || 'Error al resetear la contraseña');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Basic Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  disabled={!!userId} // Can't change email for existing users
                />
              </Grid>
              {!userId && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                  />
                </Grid>
              )}
              {userId && (
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setResetPasswordOpen(true)}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Resetear Contraseña
                  </Button>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="País"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Biografía"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Control de Acceso
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol"
                    onChange={(e) => handleChange('role', e.target.value)}
                    disabled={!isSuperAdmin && userId !== undefined} // Only super_admin can edit roles
                  >
                    <MenuItem value="user">Usuario</MenuItem>
                    {/* Show admin/super_admin options if: 
                        1. Current logged-in user is super_admin (can assign these roles), OR
                        2. The user being edited already has these roles (to display current value) */}
                    {(isSuperAdmin || formData.role === 'admin') && (
                      <MenuItem value="admin">Administrador</MenuItem>
                    )}
                    {(isSuperAdmin || formData.role === 'super_admin') && (
                      <MenuItem value="super_admin">Super Administrador</MenuItem>
                    )}
                  </Select>
                </FormControl>
                {!isSuperAdmin && userId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Solo Super Administradores pueden cambiar roles
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.status === 'active'}
                      onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'banned')}
                    />
                  }
                  label={formData.status === 'active' ? 'Activo' : 'Suspendido'}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowLiveMeetingAccess}
                      onChange={(e) => handleChange('allowLiveMeetingAccess', e.target.checked)}
                    />
                  }
                  label="Permitir acceso a reuniones en vivo (sobrescribe restricciones de suscripción)"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowLiveWeeklyAccess}
                      onChange={(e) => handleChange('allowLiveWeeklyAccess', e.target.checked)}
                    />
                  }
                  label="Permitir compra de suscripciones Live Semanal (Live Weekly)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Module Permissions - Only show for existing users */}
        {userId && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Permisos de Módulos CRM
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Otorga acceso a módulos específicos sin necesidad de suscripción
              </Typography>
              <Box sx={{ mt: 2 }}>
                <UserModulePermissionsSection userId={userId} />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error">
            Por favor corrige los errores en el formulario
          </Alert>
        )}

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            startIcon={<Save />}
            loading={loading}
          >
            {userId ? 'Guardar Cambios' : 'Crear Usuario'}
          </LoadingButton>
        </Box>
      </Stack>

      {/* Password Reset Dialog */}
      <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resetear Contraseña</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Ingresa una nueva contraseña para el usuario {formData.email}
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              error={!!passwordError}
              autoFocus
            />
            <TextField
              fullWidth
              label="Confirmar Contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResetPasswordOpen(false);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
          }} disabled={resettingPassword}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleResetPassword}
            loading={resettingPassword}
            variant="contained"
            startIcon={<Lock />}
          >
            Resetear Contraseña
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </form>
  );
}