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

export function EventModulePermissions() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      setEvents(response.events || []);
    } catch (error) {
      showError('Error al cargar eventos');
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
      
      // Get unique user IDs from registrations
      const userIds = [...new Set(registrations.map(reg => reg.user._id))];
      
      // Grant permissions for each selected module
      const results = await Promise.all(
        selectedModules.map(moduleType =>
          modulePermissionService.bulkGrant({
            userIds,
            moduleType,
            expiresAt: expiresAt?.toISOString(),
            reason: reason || `Acceso por evento: ${selectedEvent.title}`,
          })
        )
      );

      const totalGranted = results.reduce((sum, result) => sum + result.granted, 0);
      const totalAttempted = results.reduce((sum, result) => sum + result.total, 0);

      showSuccess(
        `Permisos otorgados exitosamente: ${totalGranted} de ${totalAttempted} para ${userIds.length} usuarios`
      );
      
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

  return (
    <Box>
      <Stack spacing={3}>
        {/* Event Selector */}
        <Autocomplete
          options={events}
          getOptionLabel={(option) => `${option.title} - ${formatDate(option.date)}`}
          value={selectedEvent}
          onChange={(_, newValue) => setSelectedEvent(newValue)}
          loading={loading}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Stack sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">{option.title}</Typography>
                  <Chip 
                    size="small" 
                    label={option.type} 
                    color={option.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(option.date)} • {option.location || 'Online'}
                  {option.registrations !== undefined && ` • ${option.registrations} registros`}
                </Typography>
              </Stack>
            </Box>
          )}
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
                                  {registration.user.firstName?.[0] || registration.user.email[0]}
                                </Avatar>
                                <Typography variant="body2">
                                  {registration.user.firstName} {registration.user.lastName}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {registration.user.email}
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
      </Stack>
    </Box>
  );
}