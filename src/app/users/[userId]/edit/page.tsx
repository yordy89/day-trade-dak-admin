'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { UserEditForm } from '@/components/users/user-edit-form';
import { userService } from '@/services/user.service';
import { useSnackbar } from '@/hooks/use-snackbar';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useSnackbar();

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);
      setUser(user);
    } catch (error) {
      showError('Error al cargar usuario');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box
            component="button"
            onClick={() => router.push(`/users/${userId}`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'text.primary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <ArrowBack />
            <Typography variant="h5" fontWeight={700}>
              Editar Usuario
            </Typography>
          </Box>
        </Stack>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <UserEditForm
            userId={userId}
            initialData={user}
            onCancel={() => router.push(`/users/${userId}`)}
          />
        ) : (
          <Alert severity="error">
            Usuario no encontrado
          </Alert>
        )}
      </Box>
    </AdminLayout>
  );
}