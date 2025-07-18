'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Stack,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from 'react-i18next';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: theme.palette.mode === 'dark'
          ? 'radial-gradient(at 47% 33%, hsl(200, 100%, 10%) 0, transparent 59%), radial-gradient(at 82% 65%, hsl(198, 100%, 10%) 0, transparent 55%)'
          : 'none',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              {/* Header */}
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 48, color: 'primary.contrastText' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {t('admin_login_title', 'Admin Login')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin_login_subtitle', 'Sign in to access the admin dashboard')}
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label={t('email', 'Email')}
                    type="email"
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
                  />

                  <TextField
                    fullWidth
                    label={t('password', 'Password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ py: 1.5 }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('sign_in', 'Sign In')
                    )}
                  </Button>
                </Stack>
              </Box>

              {/* Footer */}
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  {t('admin_access_only', 'This area is restricted to administrators only')}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}