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
import { Close, ContentCopy, CheckCircleOutline, Warning } from '@mui/icons-material';

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
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketType: string;
  status: string;
  createdAt: string;
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
      setRegistrations(response.registrations || []);
    } catch (error) {
      showError('Error al cargar registros del evento');
      setRegistrations([]);
    } finally {
      setLoading(false);
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
      const participants = registrations.map(reg => ({
        userId: reg.user?._id,
        email: reg.user?.email || '',
        firstName: reg.user?.firstName || '',
        lastName: reg.user?.lastName || '',
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
                  <Typography variant="subtitle1" gutterBottom>
                    Participantes ({registrations.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Tipo de Ticket</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Fecha de Registro</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrations.map((registration) => (
                          <TableRow key={registration._id}>
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

            {/* Action Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
      </Stack>
    </Box>
  );
}