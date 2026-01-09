'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import { Event, Group, Timer, CheckCircle } from '@mui/icons-material';
import { eventService } from '@/services/event.service';
import { modulePermissionService } from '@/services/module-permission.service';
import { useSnackbar } from '@/hooks/use-snackbar';
import { formatDate } from '@/lib/utils';
import {
  ModuleType,
  MODULE_DISPLAY_NAMES,
} from '@/types/module-permission';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { Close, ContentCopy, CheckCircleOutline, Warning, RemoveCircle } from '@mui/icons-material';

interface EventData {
  _id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  type: string;
  status: string;
  registrations?: number;
}

interface EventRegistration {
  _id: string;
  user: {
    _id: string | null;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Registration-level fields (fallback when user not linked)
  firstName?: string;
  lastName?: string;
  email?: string;
  ticketType: string;
  status: string;
  createdAt: string;
}

interface UserPermissions {
  [userId: string]: ModuleType[];
}

interface CreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  userId: string;
}

interface ResultError {
  email: string;
  error: string;
}

interface PermissionResultData {
  permissionsGranted: number;
  usersCreated: number;
  usersUpdated: number;
  totalProcessed: number;
  createdUsers: CreatedUser[];
  errors: ResultError[];
}

interface RevokeResultData {
  permissionsRevoked: number;
  usersAffected: number;
  affectedUsers: Array<{
    userId: string;
    email: string;
    modulesRevoked: string[];
  }>;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

export function EventModulePermissions() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    data: PermissionResultData | null;
  }>({ open: false, data: null });

  // Revoke functionality state
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [revokeModules, setRevokeModules] = useState<ModuleType[]>([]);
  const [revoking, setRevoking] = useState(false);
  const [confirmRevokeDialog, setConfirmRevokeDialog] = useState(false);
  const [revokeResultDialog, setRevokeResultDialog] = useState<{
    open: boolean;
    data: RevokeResultData | null;
  }>({ open: false, data: null });
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventRegistrations(selectedEvent._id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents();
      // Filter out any invalid events and ensure data integrity
      const validEvents = (response.events || []).filter(event => 
        event && typeof event === 'object' && event._id && event.title
      );
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await eventService.getEventRegistrations(eventId);
      const regs = response.registrations || [];
      setRegistrations(regs);

      // Fetch permissions for each registered user
      if (regs.length > 0) {
        fetchUserPermissions(regs);
      }
    } catch (error) {
      showError('Error al cargar registros del evento');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (regs: EventRegistration[]) => {
    try {
      setLoadingPermissions(true);
      const permissionsMap: UserPermissions = {};

      // Fetch permissions for each user in parallel
      // Only include registrations with a linked user account (user._id is not null)
      const userIds = regs
        .filter((r): r is EventRegistration & { user: { _id: string } } => !!r.user?._id)
        .map(r => r.user._id);

      const uniqueUserIds = [...new Set(userIds)];

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const permissions = await modulePermissionService.getUserPermissions(userId);

            // Only show admin/event-granted permissions (not from subscriptions)
            // These are the ones that can be revoked via this interface
            // Filter by: no subscriptionId (subscription permissions have this set)
            const activeModules = permissions
              .filter(p => p.hasAccess && p.isActive && !p.subscriptionId)
              .map(p => p.moduleType as ModuleType);

            permissionsMap[userId] = activeModules;
          } catch (error) {
            // User might not have any permissions
            permissionsMap[userId] = [];
          }
        })
      );

      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleGrantPermissions = async () => {
    if (!selectedEvent || selectedModules.length === 0 || registrations.length === 0) {
      showError('Por favor selecciona un evento y al menos un módulo');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare participants data with user info
      // Use registration-level fields as fallback when user account not linked
      const participants = registrations.map(reg => ({
        userId: reg.user?._id || undefined,
        email: reg.user?.email || reg.email || '',
        firstName: reg.user?.firstName || reg.firstName || '',
        lastName: reg.user?.lastName || reg.lastName || '',
        isRegistered: !!reg.user?._id,
      }));

      // Call the new endpoint that handles user creation
      const result = await modulePermissionService.grantEventPermissions({
        participants,
        moduleTypes: selectedModules,
        expiresAt: expiresAt?.toISOString(),
        reason: reason || `Acceso por evento: ${selectedEvent.title}`,
        eventId: selectedEvent._id,
        eventName: selectedEvent.title,
      });

      // Show results dialog
      setResultDialog({
        open: true,
        data: result,
      });

      // Show success message
      if (result.usersCreated > 0) {
        showSuccess(
          `✅ Proceso completado: ${result.permissionsGranted} permisos otorgados, ${result.usersCreated} nuevos usuarios creados`
        );
      } else {
        showSuccess(
          `✅ Permisos otorgados exitosamente: ${result.permissionsGranted} permisos para ${result.totalProcessed} usuarios`
        );
      }

      // Reset form
      setSelectedModules([]);
      setExpiresAt(null);
      setReason('');

      // Refresh permissions to show updated state
      if (registrations.length > 0) {
        fetchUserPermissions(registrations);
      }
    } catch (error: any) {
      showError(error.message || 'Error al otorgar permisos');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleModule = (moduleType: ModuleType) => {
    setSelectedModules(prev =>
      prev.includes(moduleType)
        ? prev.filter(m => m !== moduleType)
        : [...prev, moduleType]
    );
  };

  // Revoke functionality handlers
  const handleSelectParticipant = (userId: string) => {
    setSelectedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      // Update selectAllChecked based on selection
      const registeredUserIds = registrations
        .filter((r): r is EventRegistration & { user: { _id: string } } => !!r.user?._id)
        .map(r => r.user._id);
      setSelectAllChecked(registeredUserIds.every(id => newSet.has(id)));
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedParticipants(new Set());
      setSelectAllChecked(false);
    } else {
      const registeredUserIds = registrations
        .filter((r): r is EventRegistration & { user: { _id: string } } => !!r.user?._id)
        .map(r => r.user._id);
      setSelectedParticipants(new Set(registeredUserIds));
      setSelectAllChecked(true);
    }
  };

  const toggleRevokeModule = (moduleType: ModuleType) => {
    setRevokeModules(prev =>
      prev.includes(moduleType)
        ? prev.filter(m => m !== moduleType)
        : [...prev, moduleType]
    );
  };

  const handleRevokePermissions = async () => {
    if (selectedParticipants.size === 0 || revokeModules.length === 0) {
      showError('Por favor selecciona usuarios y al menos un módulo para revocar');
      return;
    }

    try {
      setRevoking(true);
      setConfirmRevokeDialog(false);

      const result = await modulePermissionService.revokeEventPermissions({
        userIds: Array.from(selectedParticipants),
        moduleTypes: revokeModules,
        eventId: selectedEvent?._id,
        reason: `Revocación por evento: ${selectedEvent?.title}`,
      });

      // Show results dialog
      setRevokeResultDialog({
        open: true,
        data: result,
      });

      // Show success message
      showSuccess(
        `✅ Revocación completada: ${result.permissionsRevoked} permisos revocados de ${result.usersAffected} usuarios`
      );

      // Reset revoke state
      setSelectedParticipants(new Set());
      setSelectAllChecked(false);
      setRevokeModules([]);

      // Refresh permissions to show updated state
      if (registrations.length > 0) {
        fetchUserPermissions(registrations);
      }
    } catch (error: any) {
      showError(error.message || 'Error al revocar permisos');
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado al portapapeles');
  };

  const ResultDialog = () => {
    if (!resultDialog.data) return null;

    const { usersCreated, usersUpdated, permissionsGranted, createdUsers, errors } = resultDialog.data;

    return (
      <Dialog
        open={resultDialog.open}
        onClose={() => setResultDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Resultado del Proceso de Permisos
            </Typography>
            <IconButton
              onClick={() => setResultDialog({ open: false, data: null })}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Summary Stats */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {permissionsGranted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permisos Otorgados
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {usersCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Creados
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {usersUpdated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Actualizados
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Created Users List */}
            {createdUsers && createdUsers.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <CheckCircleOutline sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: 'success.main' }} />
                  Nuevos Usuarios Creados
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Se han enviado correos electrónicos a los nuevos usuarios con sus credenciales de acceso.
                </Alert>
                <List dense>
                  {createdUsers.map((user, index) => (
                    <React.Fragment key={user.userId}>
                      <ListItem>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption">
                                Email: {user.email}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption">
                                  Contraseña temporal: {user.temporaryPassword}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(user.temporaryPassword)}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {index < createdUsers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Errors */}
            {errors && errors.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom color="error">
                  <Warning sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  Errores Encontrados
                </Typography>
                <List dense>
                  {errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={error.email}
                        secondary={error.error}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog({ open: false, data: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Event Selector */}
        <Autocomplete
          options={events}
          getOptionLabel={(option) => {
            if (!option || typeof option === 'string') return option || ''
            return `${option.title || 'Sin título'} - ${formatDate(option.date)}`
          }}
          value={selectedEvent}
          onChange={(_, newValue) => setSelectedEvent(newValue)}
          loading={loading}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props as any;
            if (!option || typeof option === 'string') {
              return <Box key={key} component="li" {...otherProps}>{option || 'Invalid option'}</Box>
            }
            return (
              <Box key={key} component="li" {...otherProps}>
                <Stack sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{option.title || 'Sin título'}</Typography>
                    {option.type && (
                      <Chip 
                        size="small" 
                        label={option.type} 
                        color={option.status === 'active' ? 'success' : 'default'}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(option.date)} • {option.location || 'Online'}
                    {option.registrations !== undefined && ` • ${option.registrations} registros`}
                  </Typography>
                </Stack>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccionar Evento"
              placeholder="Buscar por nombre del evento..."
              InputProps={{
                ...params.InputProps,
                startAdornment: <Event sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          )}
        />

        {/* Event Info & Registrations */}
        {selectedEvent && (
          <>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedEvent.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      icon={<Event />}
                      label={formatDate(selectedEvent.date)}
                      size="small"
                    />
                    <Chip
                      icon={<Group />}
                      label={`${registrations.length} participantes`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Module Selection */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Seleccionar Módulos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {Object.values(ModuleType).map((moduleType) => (
                    <FormControlLabel
                      key={moduleType}
                      control={
                        <Checkbox
                          checked={selectedModules.includes(moduleType)}
                          onChange={() => toggleModule(moduleType)}
                        />
                      }
                      label={MODULE_DISPLAY_NAMES[moduleType]?.es || moduleType}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Expiration Date and Reason */}
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Fecha de Expiración (Opcional)"
                      value={expiresAt}
                      onChange={setExpiresAt}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: 'Dejar vacío para acceso permanente',
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <TextField
                    label="Razón o Notas"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder={`Ej: Acceso por participación en ${selectedEvent.title}`}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Participants Table */}
            {registrations.length > 0 && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      Participantes ({registrations.length})
                      {selectedParticipants.size > 0 && (
                        <Chip
                          label={`${selectedParticipants.size} seleccionados`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectAllChecked}
                              indeterminate={selectedParticipants.size > 0 && !selectAllChecked}
                              onChange={handleSelectAll}
                            />
                          </TableCell>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Tipo de Ticket</TableCell>
                          <TableCell>Permisos Actuales</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Fecha de Registro</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrations.map((registration) => (
                          <TableRow
                            key={registration._id}
                            selected={!!registration.user?._id && selectedParticipants.has(registration.user._id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={!!registration.user?._id && selectedParticipants.has(registration.user._id)}
                                onChange={() => registration.user?._id && handleSelectParticipant(registration.user._id)}
                                disabled={!registration.user?._id}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {registration.user?.firstName?.[0] || registration.user?.email?.[0] || '?'}
                                </Avatar>
                                <Typography variant="body2">
                                  {registration.user?.firstName || ''} {registration.user?.lastName || ''}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {registration.user?.email || 'Sin email'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={registration.ticketType}
                                size="small"
                                color={registration.ticketType === 'vip' ? 'secondary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {loadingPermissions ? (
                                <CircularProgress size={16} />
                              ) : registration.user?._id && userPermissions[registration.user._id]?.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                                  {userPermissions[registration.user._id].map((module) => (
                                    <Chip
                                      key={module}
                                      label={MODULE_DISPLAY_NAMES[module]?.es?.substring(0, 10) || module.substring(0, 10)}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Sin permisos
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={registration.status}
                                size="small"
                                color={registration.status === 'confirmed' ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDate(registration.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Revoke Module Selection - Only visible when participants are selected */}
            {selectedParticipants.size > 0 && (
              <Card sx={{ borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    <RemoveCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Seleccionar Módulos a Revocar
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Se revocarán los permisos de los módulos seleccionados de los {selectedParticipants.size} usuario(s) marcados.
                  </Alert>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {Object.values(ModuleType).map((moduleType) => (
                      <FormControlLabel
                        key={`revoke-${moduleType}`}
                        control={
                          <Checkbox
                            checked={revokeModules.includes(moduleType)}
                            onChange={() => toggleRevokeModule(moduleType)}
                            color="error"
                          />
                        }
                        label={MODULE_DISPLAY_NAMES[moduleType]?.es || moduleType}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {selectedParticipants.size > 0 && revokeModules.length > 0 && (
                <LoadingButton
                  variant="contained"
                  size="large"
                  color="error"
                  onClick={() => setConfirmRevokeDialog(true)}
                  loading={revoking}
                  startIcon={<RemoveCircle />}
                >
                  Revocar de {selectedParticipants.size} Usuario(s)
                </LoadingButton>
              )}
              <LoadingButton
                variant="contained"
                size="large"
                onClick={handleGrantPermissions}
                loading={submitting}
                disabled={selectedModules.length === 0 || registrations.length === 0}
                startIcon={<CheckCircle />}
              >
                Otorgar Permisos a {registrations.length} Usuarios
              </LoadingButton>
            </Box>
          </>
        )}

        {/* Empty State */}
        {!selectedEvent && !loading && (
          <Alert severity="info">
            Selecciona un evento para gestionar los permisos de sus participantes
          </Alert>
        )}

        {/* Result Dialog */}
        <ResultDialog />

        {/* Confirm Revoke Dialog */}
        <Dialog
          open={confirmRevokeDialog}
          onClose={() => setConfirmRevokeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="error" />
              <Typography variant="h6">Confirmar Revocación de Permisos</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta acción revocará los permisos de los módulos seleccionados. Los usuarios perderán acceso inmediatamente.
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Estás a punto de revocar los siguientes permisos:
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Usuarios afectados: <strong>{selectedParticipants.size}</strong>
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Módulos a revocar:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {revokeModules.map((module) => (
                  <Chip
                    key={module}
                    label={MODULE_DISPLAY_NAMES[module]?.es || module}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmRevokeDialog(false)}>
              Cancelar
            </Button>
            <LoadingButton
              onClick={handleRevokePermissions}
              loading={revoking}
              color="error"
              variant="contained"
            >
              Sí, Revocar Permisos
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Revoke Result Dialog */}
        <Dialog
          open={revokeResultDialog.open}
          onClose={() => setRevokeResultDialog({ open: false, data: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Resultado de Revocación de Permisos
              </Typography>
              <IconButton
                onClick={() => setRevokeResultDialog({ open: false, data: null })}
                size="small"
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {revokeResultDialog.data && (
              <Stack spacing={3}>
                {/* Summary Stats */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                    <CardContent>
                      <Typography variant="h4" color="error">
                        {revokeResultDialog.data.permissionsRevoked}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Permisos Revocados
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ flex: 1, minWidth: 150 }}>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {revokeResultDialog.data.usersAffected}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Usuarios Afectados
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Affected Users List */}
                {revokeResultDialog.data.affectedUsers && revokeResultDialog.data.affectedUsers.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      <RemoveCircle sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                      Usuarios con Permisos Revocados
                    </Typography>
                    <List dense>
                      {revokeResultDialog.data.affectedUsers.map((user, index) => (
                        <React.Fragment key={user.userId}>
                          <ListItem>
                            <ListItemText
                              primary={user.email}
                              secondary={
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {user.modulesRevoked.map((module) => (
                                    <Chip
                                      key={module}
                                      label={MODULE_DISPLAY_NAMES[module as ModuleType]?.es || module}
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < revokeResultDialog.data!.affectedUsers.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Errors */}
                {revokeResultDialog.data.errors && revokeResultDialog.data.errors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom color="error">
                      <Warning sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                      Errores Encontrados
                    </Typography>
                    <List dense>
                      {revokeResultDialog.data.errors.map((error, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={error.userId}
                            secondary={error.error}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRevokeResultDialog({ open: false, data: null })}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}