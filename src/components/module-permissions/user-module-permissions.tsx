'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete, Edit, Save, Cancel, Timer, CheckCircle } from '@mui/icons-material';
import { userService, type User } from '@/services/user.service';
import { modulePermissionService } from '@/services/module-permission.service';
import { useSnackbar } from '@/hooks/use-snackbar';
import { formatDate } from '@/lib/utils';
import {
  ModuleType,
  ModulePermission,
  MODULE_DISPLAY_NAMES,
} from '@/types/module-permission';

export function UserModulePermissions() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    expiresAt?: Date | null;
    reason?: string;
  }>({});
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.users);
    } catch (error) {
      showError('Error al cargar usuarios');
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      const data = await modulePermissionService.getUserPermissions(userId);
      setPermissions(data);
    } catch (error) {
      showError('Error al cargar permisos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (moduleType: ModuleType) => {
    if (!selectedUser) return;

    try {
      await modulePermissionService.create({
        userId: selectedUser._id,
        moduleType,
        hasAccess: true,
      });
      showSuccess('Permiso otorgado exitosamente');
      fetchUserPermissions(selectedUser._id);
    } catch (error: any) {
      showError(error.message || 'Error al otorgar permiso');
    }
  };

  const handleRevokePermission = async (moduleType: ModuleType) => {
    if (!selectedUser) return;

    try {
      await modulePermissionService.revoke(selectedUser._id, moduleType);
      showSuccess('Permiso revocado exitosamente');
      fetchUserPermissions(selectedUser._id);
    } catch (error: any) {
      showError(error.message || 'Error al revocar permiso');
    }
  };

  const handleUpdatePermission = async (moduleType: ModuleType) => {
    if (!selectedUser) return;

    try {
      await modulePermissionService.update(selectedUser._id, moduleType, {
        expiresAt: editForm.expiresAt?.toISOString(),
        reason: editForm.reason,
      });
      showSuccess('Permiso actualizado exitosamente');
      setEditingModule(null);
      setEditForm({});
      fetchUserPermissions(selectedUser._id);
    } catch (error: any) {
      showError(error.message || 'Error al actualizar permiso');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'moduleType',
      headerName: 'Módulo',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {MODULE_DISPLAY_NAMES[params.value as ModuleType]?.es || params.value}
        </Typography>
      ),
    },
    {
      field: 'hasAccess',
      headerName: 'Acceso',
      width: 100,
      renderCell: (params) => {
        const permission = permissions.find(p => p.moduleType === params.row.moduleType);
        return (
          <Switch
            checked={permission?.hasAccess || false}
            onChange={(e) => {
              if (e.target.checked) {
                handleGrantPermission(params.row.moduleType);
              } else {
                handleRevokePermission(params.row.moduleType);
              }
            }}
            disabled={selectedUser?.role === 'super_admin'}
          />
        );
      },
    },
    {
      field: 'expiresAt',
      headerName: 'Expira',
      width: 180,
      renderCell: (params) => {
        const permission = permissions.find(p => p.moduleType === params.row.moduleType);
        if (!permission?.hasAccess) return '-';
        
        if (editingModule === params.row.moduleType) {
          return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                value={editForm.expiresAt || null}
                onChange={(date) => setEditForm({ ...editForm, expiresAt: date })}
                slotProps={{
                  textField: {
                    size: 'small',
                    variant: 'standard',
                  },
                }}
              />
            </LocalizationProvider>
          );
        }

        if (permission.expiresAt) {
          return (
            <Chip
              size="small"
              icon={<Timer />}
              label={formatDate(permission.expiresAt)}
              color={new Date(permission.expiresAt) < new Date() ? 'error' : 'default'}
            />
          );
        }
        
        return (
          <Chip
            size="small"
            icon={<CheckCircle />}
            label="Permanente"
            color="success"
          />
        );
      },
    },
    {
      field: 'reason',
      headerName: 'Razón',
      flex: 1,
      renderCell: (params) => {
        const permission = permissions.find(p => p.moduleType === params.row.moduleType);
        if (!permission?.hasAccess) return '-';
        
        if (editingModule === params.row.moduleType) {
          return (
            <TextField
              size="small"
              variant="standard"
              value={editForm.reason || ''}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              placeholder="Razón del permiso"
              fullWidth
            />
          );
        }

        return (
          <Typography variant="body2" color="text.secondary">
            {permission.reason || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => {
        const permission = permissions.find(p => p.moduleType === params.row.moduleType);
        if (!permission?.hasAccess || selectedUser?.role === 'super_admin') return null;

        if (editingModule === params.row.moduleType) {
          return (
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleUpdatePermission(params.row.moduleType)}
              >
                <Save />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setEditingModule(null);
                  setEditForm({});
                }}
              >
                <Cancel />
              </IconButton>
            </Stack>
          );
        }

        return (
          <IconButton
            size="small"
            onClick={() => {
              setEditingModule(params.row.moduleType);
              setEditForm({
                expiresAt: permission.expiresAt ? new Date(permission.expiresAt) : null,
                reason: permission.reason,
              });
            }}
          >
            <Edit />
          </IconButton>
        );
      },
    },
  ];

  const rows = Object.values(ModuleType).map(moduleType => ({
    id: moduleType,
    moduleType,
    hasAccess: permissions.some(p => p.moduleType === moduleType && p.hasAccess),
  }));

  return (
    <Box>
      <Stack spacing={3}>
        {/* User Selector */}
        <Autocomplete
          options={users}
          getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''}`.trim() + ` - ${option.email}` || option.email}
          value={selectedUser}
          onChange={(_, newValue) => setSelectedUser(newValue)}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Stack>
                <Typography variant="body2">
                  {`${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.email} • {option.role}
                </Typography>
              </Stack>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccionar Usuario"
              placeholder="Buscar por nombre o email..."
            />
          )}
        />

        {/* User Info */}
        {selectedUser && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
                <Chip
                  label={selectedUser.role === 'super_admin' ? 'Super Admin' : selectedUser.role}
                  color={selectedUser.role === 'super_admin' ? 'primary' : 'default'}
                />
              </Stack>
              {selectedUser.role === 'super_admin' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Los Super Admin tienen acceso completo a todos los módulos
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Permissions Grid */}
        {selectedUser && (
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
              pageSizeOptions={[10]}
              disableColumnMenu
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}