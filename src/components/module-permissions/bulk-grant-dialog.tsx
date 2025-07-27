'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Box,
  Autocomplete,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import { Group, Timer } from '@mui/icons-material';
import { userService, type User } from '@/services/user.service';
import { modulePermissionService } from '@/services/module-permission.service';
import { useSnackbar } from '@/hooks/use-snackbar';
import {
  ModuleType,
  MODULE_DISPLAY_NAMES,
} from '@/types/module-permission';

interface BulkGrantDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BulkGrantDialog({ open, onClose }: BulkGrantDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleType | ''>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  // Fetch users when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.users.filter((user: User) => user.role !== 'super_admin'));
    } catch (error) {
      showError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModule || selectedUsers.length === 0) {
      showError('Por favor selecciona un módulo y al menos un usuario');
      return;
    }

    try {
      setSubmitting(true);
      const result = await modulePermissionService.bulkGrant({
        userIds: selectedUsers.map(u => u._id),
        moduleType: selectedModule as ModuleType,
        expiresAt: expiresAt?.toISOString(),
        reason,
      });

      showSuccess(`Permisos otorgados exitosamente: ${result.granted} de ${result.total}`);
      handleClose();
    } catch (error: any) {
      showError(error.message || 'Error al otorgar permisos');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSelectedModule('');
    setExpiresAt(null);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Asignar Permisos en Lote</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            Otorga acceso a un módulo específico para múltiples usuarios al mismo tiempo
          </Alert>

          {/* Module Selection */}
          <FormControl fullWidth required>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as ModuleType)}
              label="Módulo"
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

          {/* User Selection */}
          <Autocomplete
            multiple
            options={users}
            loading={loading}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack>
                  <Typography variant="body2">
                    {`${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                </Stack>
              </Box>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  size="small"
                  label={`${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuarios"
                placeholder="Seleccionar usuarios..."
                required
              />
            )}
          />

          {/* Expiration Date */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Fecha de Expiración (Opcional)"
              value={expiresAt}
              onChange={setExpiresAt}
              minDate={new Date()}
            />
          </LocalizationProvider>

          {/* Reason */}
          <TextField
            label="Razón (Opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            placeholder="Ej: Acceso temporal para curso especial..."
            fullWidth
          />

          {/* Summary */}
          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen:
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Group fontSize="small" />
                <Typography variant="body2">
                  {selectedUsers.length} usuario(s) seleccionado(s)
                </Typography>
              </Stack>
              {expiresAt && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Timer fontSize="small" />
                  <Typography variant="body2">
                    Expira: {expiresAt.toLocaleDateString()}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={submitting}
          variant="contained"
          disabled={!selectedModule || selectedUsers.length === 0}
        >
          Otorgar Permisos
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}