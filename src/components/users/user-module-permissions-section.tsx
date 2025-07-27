'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Timer, CheckCircle, Edit, Save, Cancel } from '@mui/icons-material';
import { modulePermissionService } from '@/services/module-permission.service';
import { useSnackbar } from '@/hooks/use-snackbar';
import { formatDate } from '@/lib/utils';
import {
  ModuleType,
  ModulePermission,
  MODULE_DISPLAY_NAMES,
} from '@/types/module-permission';

interface UserModulePermissionsSectionProps {
  userId: string;
}

interface EditingState {
  moduleType: ModuleType | null;
  expiresAt: Date | null;
  reason: string;
}

export function UserModulePermissionsSection({ userId }: UserModulePermissionsSectionProps) {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState>({
    moduleType: null,
    expiresAt: null,
    reason: '',
  });
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await modulePermissionService.getUserPermissions(userId);
      setPermissions(data);
    } catch (error) {
      showError('Error al cargar permisos de módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (moduleType: ModuleType, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await modulePermissionService.revoke(userId, moduleType);
        showSuccess('Permiso revocado');
      } else {
        await modulePermissionService.create({
          userId,
          moduleType,
          hasAccess: true,
        });
        showSuccess('Permiso otorgado');
      }
      fetchPermissions();
    } catch (error: any) {
      showError(error.message || 'Error al actualizar permiso');
    }
  };

  const handleStartEdit = (moduleType: ModuleType, permission?: ModulePermission) => {
    setEditing({
      moduleType,
      expiresAt: permission?.expiresAt ? new Date(permission.expiresAt) : null,
      reason: permission?.reason || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editing.moduleType) return;

    try {
      await modulePermissionService.update(userId, editing.moduleType, {
        expiresAt: editing.expiresAt?.toISOString(),
        reason: editing.reason,
      });
      showSuccess('Permiso actualizado');
      setEditing({ moduleType: null, expiresAt: null, reason: '' });
      fetchPermissions();
    } catch (error: any) {
      showError(error.message || 'Error al actualizar permiso');
    }
  };

  const handleCancelEdit = () => {
    setEditing({ moduleType: null, expiresAt: null, reason: '' });
  };

  const getPermissionForModule = (moduleType: ModuleType) => {
    return permissions.find(p => p.moduleType === moduleType && p.hasAccess);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={2}>
        <Alert severity="info">
          Los permisos otorgados aquí permiten acceso a los módulos sin necesidad de suscripción activa
        </Alert>

        <Grid container spacing={2}>
          {Object.entries(MODULE_DISPLAY_NAMES).map(([moduleType, names]) => {
            const permission = getPermissionForModule(moduleType as ModuleType);
            const isEditing = editing.moduleType === moduleType;

            return (
              <Grid item xs={12} key={moduleType}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: permission ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!permission}
                            onChange={() => handleTogglePermission(moduleType as ModuleType, !!permission)}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {names.es}
                            <Typography variant="caption" color="text.secondary" component="span">
                              {' '}({names.en})
                            </Typography>
                          </Typography>
                        }
                      />
                    </Grid>

                    {permission && (
                      <>
                        <Grid item xs={12} sm={3}>
                          {isEditing ? (
                            <DateTimePicker
                              value={editing.expiresAt}
                              onChange={(date) => setEditing(prev => ({ ...prev, expiresAt: date }))}
                              minDate={new Date()}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  placeholder: 'Sin expiración',
                                },
                              }}
                            />
                          ) : (
                            <Box>
                              {permission.expiresAt ? (
                                <Chip
                                  size="small"
                                  icon={<Timer />}
                                  label={formatDate(permission.expiresAt)}
                                  color={new Date(permission.expiresAt) < new Date() ? 'error' : 'default'}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  icon={<CheckCircle />}
                                  label="Permanente"
                                  color="success"
                                />
                              )}
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          {isEditing ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={editing.reason}
                              onChange={(e) => setEditing(prev => ({ ...prev, reason: e.target.value }))}
                              placeholder="Razón del permiso"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {permission.reason || '-'}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={1}>
                          {isEditing ? (
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                                <Save fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={handleCancelEdit}>
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Tooltip title="Editar detalles">
                              <IconButton 
                                size="small" 
                                onClick={() => handleStartEdit(moduleType as ModuleType, permission)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    </LocalizationProvider>
  );
}