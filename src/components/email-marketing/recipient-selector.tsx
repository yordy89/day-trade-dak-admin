'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  People,
  Email,
  FilterList,
  Save,
} from '@mui/icons-material'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'
import { SubscriptionPlan } from '@/types/subscription'

interface RecipientSelectorProps {
  value?: any
  onChange?: (filters: any, count: number) => void
  showSaveSegment?: boolean
}

const subscriptionPlans = [
  { value: 'LiveWeeklyManual', label: 'Live Weekly Manual' },
  { value: 'LiveWeeklyRecurring', label: 'Live Weekly Recurring' },
  { value: 'MasterClases', label: 'Master Classes' },
  { value: 'LiveRecorded', label: 'Live Recorded' },
  { value: 'Psicotrading', label: 'Psicotrading' },
  { value: 'Classes', label: 'Classes' },
  { value: 'PeaceWithMoney', label: 'Peace with Money' },
  { value: 'MasterCourse', label: 'Master Course' },
  { value: 'CommunityEvent', label: 'Community Event' },
  { value: 'VipEvent', label: 'VIP Event' },
]

const userStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const userRoles = [
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const modulePermissions = [
  { value: 'allowLiveMeetingAccess', label: 'Live Meeting Access' },
  { value: 'allowLiveWeeklyAccess', label: 'Live Weekly Access' },
  { value: 'allowMasterClassesAccess', label: 'Master Classes Access' },
  { value: 'allowLiveRecordedAccess', label: 'Live Recorded Access' },
  { value: 'allowPsicotradingAccess', label: 'Psicotrading Access' },
  { value: 'allowClassesAccess', label: 'Classes Access' },
]

export function RecipientSelector({
  value = {},
  onChange,
  showSaveSegment = false,
}: RecipientSelectorProps) {
  const [filters, setFilters] = useState({
    subscriptions: [],
    noSubscription: false,
    status: [],
    roles: [],
    eventIds: [],
    modulePermissions: [],
    lastLoginDays: '',
    registrationStartDate: '',
    registrationEndDate: '',
    customEmails: '',
    brevoListIds: [],
    excludeListIds: [],
    savedSegmentId: '',
    ...value,
  })

  const [recipientCount, setRecipientCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [brevoLists, setBrevoLists] = useState<any[]>([])
  const [savedSegments, setSavedSegments] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState({
    subscriptions: true,
    users: false,
    events: false,
    lists: false,
    custom: false,
  })
  const [segmentName, setSegmentName] = useState('')
  const [savingSegment, setSavingSegment] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchBrevoLists()
    fetchSavedSegments()
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      calculateRecipientCount()
    }, 500)
    return () => clearTimeout(debounce)
  }, [filters])

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events')
      const eventsWithRegistrations = await Promise.all(
        (response.data.events || []).map(async (event: any) => {
          try {
            // Fetch registration count for each event
            const regResponse = await api.get(`/admin/events/${event._id}/registrations`, {
              params: { limit: 1 } // Just get the count
            })
            return {
              ...event,
              registrationCount: regResponse.data.total || 0
            }
          } catch (error) {
            console.error(`Error fetching registrations for event ${event._id}:`, error)
            return {
              ...event,
              registrationCount: 0
            }
          }
        })
      )
      setEvents(eventsWithRegistrations)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchBrevoLists = async () => {
    try {
      const response = await api.get('/email-marketing/recipients/brevo-lists')
      const lists = response.data || []
      setBrevoLists(lists)
    } catch (error) {
      console.error('Error fetching Brevo lists:', error)
      // Fallback to default lists if API fails
      setBrevoLists([
        { id: 4, name: 'Event List' },
        { id: 5, name: 'Community Event List' },
        { id: 6, name: 'Master Course List' },
        { id: 7, name: 'VIP Event List' },
      ])
    }
  }

  const fetchSavedSegments = async () => {
    try {
      const response = await api.get('/email-marketing/segments')
      setSavedSegments(response.data || [])
    } catch (error) {
      console.error('Error fetching segments:', error)
    }
  }

  const calculateRecipientCount = async () => {
    try {
      setLoading(true)
      
      // Clean up the filters before sending to API - only send non-empty values
      const cleanFilters: any = {}
      
      if (filters.subscriptions?.length) {
        cleanFilters.subscriptions = filters.subscriptions
      }
      if (filters.noSubscription === true) {
        cleanFilters.noSubscription = true
      }
      if (filters.status?.length) {
        cleanFilters.status = filters.status
      }
      if (filters.roles?.length) {
        cleanFilters.roles = filters.roles
      }
      if (filters.eventIds?.length) {
        cleanFilters.eventIds = filters.eventIds
      }
      if (filters.modulePermissions?.length) {
        cleanFilters.modulePermissions = filters.modulePermissions
      }
      if (filters.brevoListIds?.length) {
        cleanFilters.brevoListIds = filters.brevoListIds
      }
      if (filters.excludeListIds?.length) {
        cleanFilters.excludeListIds = filters.excludeListIds
      }
      
      // Only add optional fields if they have valid values
      if (filters.lastLoginDays && filters.lastLoginDays !== '') {
        const days = parseInt(filters.lastLoginDays)
        if (!isNaN(days) && days > 0) {
          cleanFilters.lastLoginDays = days
        }
      }
      
      if (filters.registrationStartDate && filters.registrationStartDate !== '') {
        cleanFilters.registrationStartDate = filters.registrationStartDate
      }
      
      if (filters.registrationEndDate && filters.registrationEndDate !== '') {
        cleanFilters.registrationEndDate = filters.registrationEndDate
      }
      
      if (filters.customEmails && filters.customEmails !== '') {
        // Split custom emails by comma or newline and clean them
        const emails = filters.customEmails
          .split(/[,\n]/)
          .map((email: string) => email.trim())
          .filter((email: string) => email !== '')
        if (emails.length > 0) {
          cleanFilters.customEmails = emails
        }
      }
      
      if (filters.savedSegmentId && filters.savedSegmentId !== '') {
        cleanFilters.savedSegmentId = filters.savedSegmentId
      }
      
      console.log('Sending filters to count endpoint:', cleanFilters)
      console.log('EventIds being sent:', cleanFilters.eventIds)
      
      const response = await api.post('/email-marketing/recipients/count', cleanFilters)
      console.log('Recipient count response:', response.data)
      setRecipientCount(response.data.count || 0)
      
      if (onChange) {
        onChange(cleanFilters, response.data.count || 0)
      }
    } catch (error) {
      console.error('Error calculating recipients:', error)
      setRecipientCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  const handleSaveSegment = async () => {
    if (!segmentName.trim()) {
      toast.error('Please enter a segment name')
      return
    }

    try {
      setSavingSegment(true)
      await api.post('/email-marketing/segments', {
        name: segmentName,
        filters,
        isDynamic: true,
      })
      toast.success('Segment saved successfully')
      setSegmentName('')
      fetchSavedSegments()
    } catch (error) {
      console.error('Error saving segment:', error)
      toast.error('Failed to save segment')
    } finally {
      setSavingSegment(false)
    }
  }

  const loadSavedSegment = async (segmentId: string) => {
    try {
      const response = await api.get(`/email-marketing/segments/${segmentId}`)
      setFilters(response.data.filters)
      handleFilterChange('savedSegmentId', segmentId)
    } catch (error) {
      console.error('Error loading segment:', error)
      toast.error('Failed to load segment')
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Recipient Selection
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Chip
                icon={<People />}
                label={`${recipientCount.toLocaleString()} Recipients`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Saved Segments */}
        {savedSegments.length > 0 && (
          <Box mb={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Load Saved Segment</InputLabel>
              <Select
                value={filters.savedSegmentId}
                onChange={(e) => loadSavedSegment(e.target.value)}
                label="Load Saved Segment"
              >
                <MenuItem value="">None</MenuItem>
                {savedSegments.map((segment: any) => (
                  <MenuItem key={segment._id} value={segment._id}>
                    {segment.name} ({segment.estimatedCount} recipients)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Subscription Filters */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleSection('subscriptions')}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Subscription Filters
            </Typography>
            <IconButton size="small">
              {expandedSections.subscriptions ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.subscriptions}>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.noSubscription}
                        onChange={(e) => handleFilterChange('noSubscription', e.target.checked)}
                      />
                    }
                    label="Users without active subscription"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Subscriptions</InputLabel>
                    <Select
                      multiple
                      value={filters.subscriptions}
                      onChange={(e) => handleFilterChange('subscriptions', e.target.value)}
                      input={<OutlinedInput label="Subscriptions" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip
                              key={value}
                              label={subscriptionPlans.find(p => p.value === value)?.label || value}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                      disabled={filters.noSubscription}
                    >
                      {subscriptionPlans.map((plan) => (
                        <MenuItem key={plan.value} value={plan.value}>
                          <Checkbox checked={filters.subscriptions.includes(plan.value)} />
                          <ListItemText primary={plan.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* User Filters */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleSection('users')}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              User Filters
            </Typography>
            <IconButton size="small">
              {expandedSections.users ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.users}>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      input={<OutlinedInput label="Status" />}
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      {userStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Checkbox checked={filters.status.includes(status.value)} />
                          <ListItemText primary={status.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={filters.roles}
                      onChange={(e) => handleFilterChange('roles', e.target.value)}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      {userRoles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Checkbox checked={filters.roles.includes(role.value)} />
                          <ListItemText primary={role.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Module Permissions</InputLabel>
                    <Select
                      multiple
                      value={filters.modulePermissions}
                      onChange={(e) => handleFilterChange('modulePermissions', e.target.value)}
                      input={<OutlinedInput label="Module Permissions" />}
                      renderValue={(selected) =>
                        (selected as string[]).length > 0
                          ? `${(selected as string[]).length} selected`
                          : ''
                      }
                    >
                      {modulePermissions.map((perm) => (
                        <MenuItem key={perm.value} value={perm.value}>
                          <Checkbox checked={filters.modulePermissions.includes(perm.value)} />
                          <ListItemText primary={perm.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Last Login (days ago)"
                    type="number"
                    value={filters.lastLoginDays}
                    onChange={(e) => handleFilterChange('lastLoginDays', e.target.value)}
                    placeholder="e.g., 30"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Registration Start Date"
                    type="date"
                    value={filters.registrationStartDate}
                    onChange={(e) => handleFilterChange('registrationStartDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Registration End Date"
                    type="date"
                    value={filters.registrationEndDate}
                    onChange={(e) => handleFilterChange('registrationEndDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Event Filters */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleSection('events')}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Event Participants
            </Typography>
            <IconButton size="small">
              {expandedSections.events ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.events}>
            <Box mt={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Events</InputLabel>
                <Select
                  multiple
                  value={filters.eventIds}
                  onChange={(e) => handleFilterChange('eventIds', e.target.value)}
                  input={<OutlinedInput label="Events" />}
                  renderValue={(selected) =>
                    `${(selected as string[]).length} event(s) selected`
                  }
                >
                  {events.map((event: any) => {
                    const eventDate = event.date ? new Date(event.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Sin fecha'
                    
                    return (
                      <MenuItem key={event._id} value={event._id}>
                        <Checkbox checked={filters.eventIds.includes(event._id)} />
                        <ListItemText
                          primary={`${event.name || event.title} - ${eventDate}`}
                          secondary={`${event.registrationCount || 0} registrations`}
                        />
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Brevo Lists */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleSection('lists')}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Marketing Lists
            </Typography>
            <IconButton size="small">
              {expandedSections.lists ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.lists}>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Include Lists</InputLabel>
                    <Select
                      multiple
                      value={filters.brevoListIds}
                      onChange={(e) => handleFilterChange('brevoListIds', e.target.value)}
                      input={<OutlinedInput label="Include Lists" />}
                      renderValue={(selected) =>
                        `${(selected as number[]).length} list(s) selected`
                      }
                    >
                      {brevoLists.map((list: any) => (
                        <MenuItem key={list.id} value={list.id}>
                          <Checkbox checked={filters.brevoListIds.includes(list.id)} />
                          <ListItemText 
                            primary={list.name} 
                            secondary={`${list.totalSubscribers || 0} subscribers`}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Exclude Lists</InputLabel>
                    <Select
                      multiple
                      value={filters.excludeListIds}
                      onChange={(e) => handleFilterChange('excludeListIds', e.target.value)}
                      input={<OutlinedInput label="Exclude Lists" />}
                      renderValue={(selected) =>
                        `${(selected as number[]).length} list(s) excluded`
                      }
                    >
                      {brevoLists.map((list: any) => (
                        <MenuItem key={list.id} value={list.id}>
                          <Checkbox checked={filters.excludeListIds.includes(list.id)} />
                          <ListItemText 
                            primary={list.name} 
                            secondary={`${list.totalSubscribers || 0} subscribers`}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Custom Emails */}
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleSection('custom')}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Custom Recipients
            </Typography>
            <IconButton size="small">
              {expandedSections.custom ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.custom}>
            <Box mt={2}>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                label="Custom Email Addresses"
                placeholder="Enter email addresses separated by commas or new lines"
                value={filters.customEmails}
                onChange={(e) => handleFilterChange('customEmails', e.target.value)}
                helperText="Add specific email addresses to include in the campaign"
              />
            </Box>
          </Collapse>
        </Box>

        {/* Save Segment */}
        {showSaveSegment && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                label="Segment Name"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g., Active Premium Users"
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={handleSaveSegment}
                disabled={savingSegment || !segmentName.trim()}
              >
                Save Segment
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  )
}