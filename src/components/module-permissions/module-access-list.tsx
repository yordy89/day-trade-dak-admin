'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Chip,
  Avatar,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Timer, CheckCircle, Person, AccountCircle } from '@mui/icons-material';
import { modulePermissionService } from '@/services/module-permission.service';
import { useSnackbar } from '@/hooks/use-snackbar';
import { formatDate } from '@/lib/utils';
import {
  ModuleType,
  UserWithModuleAccess,
  MODULE_DISPLAY_NAMES,
} from '@/types/module-permission';

export function ModuleAccessList() {
  const [selectedModule, setSelectedModule] = useState<ModuleType>(ModuleType.CLASSES);
  const [users, setUsers] = useState<UserWithModuleAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useSnackbar();

  useEffect(() => {
    if (selectedModule) {
      fetchModuleUsers(selectedModule);
    }
  }, [selectedModule]);

  const fetchModuleUsers = async (moduleType: ModuleType) => {
    try {
      setLoading(true);
      const data = await modulePermissionService.getModuleUsers(moduleType);
      setUsers(data);
    } catch (error) {
      showError('Error al cargar usuarios con acceso al módulo');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 36, height: 36 }}>
            {params.value.profileImage ? (
              <img src={params.value.profileImage} alt="" style={{ width: '100%', height: '100%' }} />
            ) : (
              <AccountCircle />
            )}
          </Avatar>
          <Box>
            <Typography variant="body2">
              {params.value.firstName} {params.value.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.value.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'grantedAt',
      headerName: 'Otorgado',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.row.permission.grantedAt)}
        </Typography>
      ),
    },
    {
      field: 'expiresAt',
      headerName: 'Expira',
      width: 200,
      renderCell: (params) => {
        const expiresAt = params.row.permission.expiresAt;
        if (!expiresAt) {
          return (
            <Chip
              size="small"
              icon={<CheckCircle />}
              label="Permanente"
              color="success"
            />
          );
        }

        const isExpired = new Date(expiresAt) < new Date();
        const daysRemaining = Math.ceil(
          (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <Chip
            size="small"
            icon={<Timer />}
            label={isExpired ? 'Expirado' : `${daysRemaining} días`}
            color={isExpired ? 'error' : daysRemaining <= 3 ? 'warning' : 'default'}
          />
        );
      },
    },
    {
      field: 'reason',
      headerName: 'Razón',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.permission.reason || '-'}
        </Typography>
      ),
    },
  ];

  const rows = users.map((userAccess, index) => ({
    id: index,
    user: userAccess.user,
    permission: userAccess.permission,
  }));

  return (
    <Box>
      <Stack spacing={3}>
        {/* Module Selector */}
        <FormControl fullWidth>
          <InputLabel>Seleccionar Módulo</InputLabel>
          <Select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value as ModuleType)}
            label="Seleccionar Módulo"
          >
            {Object.entries(MODULE_DISPLAY_NAMES).map(([key, names]) => (
              <MenuItem key={key} value={key}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography>{names.es}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({names.en})
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Module Stats */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios con acceso
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {users.filter(u => !u.permission.expiresAt).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acceso permanente
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {users.filter(u => u.permission.expiresAt).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acceso temporal
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
          />
        </Box>

        {/* No users message */}
        {!loading && users.length === 0 && (
          <Alert severity="info">
            No hay usuarios con acceso a este módulo
          </Alert>
        )}
      </Stack>
    </Box>
  );
}