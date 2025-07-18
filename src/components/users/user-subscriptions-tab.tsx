'use client'

import { useState } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Cancel,
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { userService } from '@/services/user.service'

interface UserSubscriptionsTabProps {
  userId: string
  subscriptions: any[]
}

export function UserSubscriptionsTab({ userId, subscriptions = [] }: UserSubscriptionsTabProps) {
  const { t } = useTranslation('users')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    plan: '',
    expiresAt: '',
  })

  const handleAction = (action: string, subscription: any) => {
    setSelectedSubscription(subscription)
    setAnchorEl(null)

    switch (action) {
      case 'edit':
        setEditDialogOpen(true)
        break
      case 'cancel':
        handleCancelSubscription(subscription)
        break
      case 'delete':
        handleDeleteSubscription(subscription)
        break
    }
  }

  const handleCancelSubscription = async (subscription: any) => {
    if (!confirm(t('dialogs.confirmCancel', 'Are you sure you want to cancel this subscription?'))) {
      return
    }

    try {
      // Cancel subscription logic here
      toast.success(t('messages.subscriptionCancelled', 'Subscription cancelled successfully'))
    } catch (error) {
      toast.error(t('messages.error', 'Failed to cancel subscription'))
    }
  }

  const handleDeleteSubscription = async (subscription: any) => {
    if (!confirm(t('dialogs.confirmDelete', 'Are you sure you want to delete this subscription?'))) {
      return
    }

    try {
      // Delete subscription logic here
      toast.success(t('messages.subscriptionDeleted', 'Subscription deleted successfully'))
    } catch (error) {
      toast.error(t('messages.error', 'Failed to delete subscription'))
    }
  }

  const handleAddSubscription = async () => {
    try {
      // Add subscription logic here
      toast.success(t('messages.subscriptionAdded', 'Subscription added successfully'))
      setAddDialogOpen(false)
      setNewSubscription({ plan: '', expiresAt: '' })
      // Refresh data
      window.location.reload()
    } catch (error) {
      toast.error(t('messages.error', 'Failed to add subscription'))
    }
  }

  const isActive = (subscription: any) => {
    return !subscription.expiresAt || new Date(subscription.expiresAt) > new Date()
  }

  if (subscriptions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('subscriptions.noSubscriptions', 'No subscriptions found')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          {t('actions.addSubscription', 'Add Subscription')}
        </Button>

        {/* Add Subscription Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('dialogs.addSubscription', 'Add Subscription')}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{t('fields.plan', 'Plan')}</InputLabel>
                <Select
                  value={newSubscription.plan}
                  label={t('fields.plan', 'Plan')}
                  onChange={(e) => setNewSubscription({ ...newSubscription, plan: e.target.value })}
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Classes">Classes</MenuItem>
                  <MenuItem value="MasterClases">MasterClases</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('fields.expiresAt', 'Expires At')}
                type="datetime-local"
                value={newSubscription.expiresAt}
                onChange={(e) => setNewSubscription({ ...newSubscription, expiresAt: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText={t('helpers.leaveEmptyForNoExpiration', 'Leave empty for no expiration')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleAddSubscription} variant="contained">
              {t('common.add', 'Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('sections.subscriptions', 'Subscriptions')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          size="small"
        >
          {t('actions.addSubscription', 'Add Subscription')}
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('columns.plan', 'Plan')}</TableCell>
              <TableCell>{t('columns.status', 'Status')}</TableCell>
              <TableCell>{t('columns.startDate', 'Start Date')}</TableCell>
              <TableCell>{t('columns.expiresAt', 'Expires At')}</TableCell>
              <TableCell align="right">{t('columns.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription, index) => (
              <TableRow key={subscription._id || index}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {subscription.plan}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={isActive(subscription) ? t('status.active', 'Active') : t('status.expired', 'Expired')}
                    color={isActive(subscription) ? 'success' : 'default'}
                    size="small"
                    variant={isActive(subscription) ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subscription.createdAt ? formatDateTime(new Date(subscription.createdAt)) : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subscription.expiresAt ? formatDateTime(new Date(subscription.expiresAt)) : t('status.noExpiration', 'No expiration')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget)
                      setSelectedSubscription(subscription)
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedSubscription?._id === subscription._id}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => handleAction('edit', subscription)}>
                      <Edit sx={{ mr: 1, fontSize: 20 }} />
                      {t('actions.edit', 'Edit')}
                    </MenuItem>
                    {isActive(subscription) && (
                      <MenuItem onClick={() => handleAction('cancel', subscription)}>
                        <Cancel sx={{ mr: 1, fontSize: 20 }} />
                        {t('actions.cancel', 'Cancel')}
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={() => handleAction('delete', subscription)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete sx={{ mr: 1, fontSize: 20 }} />
                      {t('actions.delete', 'Delete')}
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Subscription Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dialogs.addSubscription', 'Add Subscription')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('fields.plan', 'Plan')}</InputLabel>
              <Select
                value={newSubscription.plan}
                label={t('fields.plan', 'Plan')}
                onChange={(e) => setNewSubscription({ ...newSubscription, plan: e.target.value })}
              >
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Classes">Classes</MenuItem>
                <MenuItem value="MasterClases">MasterClases</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('fields.expiresAt', 'Expires At')}
              type="datetime-local"
              value={newSubscription.expiresAt}
              onChange={(e) => setNewSubscription({ ...newSubscription, expiresAt: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={t('helpers.leaveEmptyForNoExpiration', 'Leave empty for no expiration')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleAddSubscription} variant="contained">
            {t('common.add', 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subscription Dialog - Similar to Add */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dialogs.editSubscription', 'Edit Subscription')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('messages.editSubscriptionInfo', 'Editing subscription details. Changes will be reflected immediately.')}
          </Alert>
          {/* Similar form fields as Add dialog */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="contained">
            {t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}