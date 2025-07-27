'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { UserEditForm } from '@/components/users/user-edit-form';

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box
            component="button"
            onClick={() => router.push('/users')}
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
              Crear Usuario
            </Typography>
          </Box>
        </Stack>

        {/* Form */}
        <UserEditForm
          onCancel={() => router.push('/users')}
        />
      </Box>
    </AdminLayout>
  );
}