'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Box,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { Event, GroupAdd, Schedule } from '@mui/icons-material'
import { useSnackbar } from '@/hooks/use-snackbar'
import { eventService } from '@/services/event.service'
import { modulePermissionService } from '@/services/module-permission.service'

interface EventAssignmentDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EventAssignmentDialog({
  open,
  onClose,
  onSuccess,
}: EventAssignmentDialogProps) {
  const { showSuccess, showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const [selectedEventId, setSelectedEventId] = useState('')
  const [expirationOption, setExpirationOption] = useState('90')
  const [customDate, setCustomDate] = useState('')

  useEffect(() => {
    if (open) {
      loadEvents()
    }
  }, [open])

  const loadEvents = async () => {
    try {
      setLoadingEvents(true)
      const data = await eventService.getEvents()
      setEvents(data.events)
    } catch (error: any) {
      showError('Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedEventId) {
      showError('Please select an event')
      return
    }

    try {
      setLoading(true)

      // Calculate expiration date
      let expiresAt: Date | undefined
      if (expirationOption === 'custom') {
        if (!customDate) {
          showError('Please select a custom expiration date')
          return
        }
        expiresAt = new Date(customDate)
      } else if (expirationOption !== 'never') {
        const days = parseInt(expirationOption)
        expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + days)
      }

      // Get event details
      const event = events.find((e) => e._id === selectedEventId)
      if (!event) {
        showError('Event not found')
        return
      }

      // Get event participants
      const participants = await eventService.getEventParticipants(selectedEventId)

      if (!participants || participants.length === 0) {
        showError('No registered participants found for this event')
        return
      }

      // Grant permissions
      await modulePermissionService.grantEventPermissions({
        participants: participants.map((p: any) => ({
          userId: p.userId?._id || p.userId,
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
          isRegistered: !!p.userId,
        })),
        moduleTypes: ['tradingJournal'],
        expiresAt: expiresAt?.toISOString(),
        reason: `Trading journal access for event: ${event.name}`,
        eventId: selectedEventId,
        eventName: event.name,
      })

      showSuccess(
        `Successfully granted trading journal access to ${participants.length} participants`
      )
      onSuccess?.()
      handleClose()
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to assign permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedEventId('')
    setExpirationOption('90')
    setCustomDate('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupAdd color="primary" />
          <Typography variant="h6">Assign Trading Journal Access to Event</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            This will grant trading journal access to all registered participants of the
            selected event.
          </Alert>

          {/* Event Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Event</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              label="Select Event"
              disabled={loadingEvents}
            >
              {loadingEvents ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading events...
                </MenuItem>
              ) : events.length === 0 ? (
                <MenuItem disabled>No events available</MenuItem>
              ) : (
                events.map((event) => (
                  <MenuItem key={event._id} value={event._id}>
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {event.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.date).toLocaleDateString()} •{' '}
                        {event.currentRegistrations || 0} registered
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Module Type Display */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Module Permission
            </Typography>
            <Chip label="Trading Journal" color="primary" />
          </Box>

          {/* Expiration Options */}
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              <Schedule sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Access Duration
            </Typography>
            <RadioGroup
              value={expirationOption}
              onChange={(e) => setExpirationOption(e.target.value)}
            >
              <FormControlLabel
                value="30"
                control={<Radio />}
                label="30 days from today"
              />
              <FormControlLabel
                value="60"
                control={<Radio />}
                label="60 days from today"
              />
              <FormControlLabel
                value="90"
                control={<Radio />}
                label="90 days from today (Recommended)"
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label="Custom expiration date"
              />
              <FormControlLabel
                value="never"
                control={<Radio />}
                label="Never expires (Permanent access)"
              />
            </RadioGroup>

            {expirationOption === 'custom' && (
              <TextField
                type="date"
                label="Expiration Date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                }}
              />
            )}
          </Box>

          {selectedEventId && (
            <Alert severity="success">
              Selected event:{' '}
              <strong>{events.find((e) => e._id === selectedEventId)?.name}</strong>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedEventId}
          startIcon={loading ? <CircularProgress size={20} /> : <GroupAdd />}
        >
          {loading ? 'Assigning...' : 'Assign Access'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
