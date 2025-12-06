'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import { 
  Shield, 
  RestartAlt, 
  Save,
  Person,
  SupervisorAccount,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/page-header'
import { usePermissionService } from '@/services/permission.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { AdminUserWithPermissions, PermissionSet } from '@/types/permission'
import { Grid } from '@mui/material'

export default function PermissionsPage() {
  const { t } = useTranslation(['permissions', 'common'])
  const permissionService = usePermissionService()
  const { showSuccess, showError } = useSnackbar()
  
  const [admins, setAdmins] = useState<AdminUserWithPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUserWithPermissions | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<PermissionSet | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const permissionLabels: Record<keyof PermissionSet, string> = {
    dashboard: t('permissions:permissions.dashboard'),
    users: t('permissions:permissions.users'),
    subscriptions: t('permissions:permissions.subscriptions'),
    payments: t('permissions:permissions.payments'),
    meetings: t('permissions:permissions.meetings'),
    events: t('permissions:permissions.events'),
    emailMarketing: t('permissions:permissions.emailMarketing'),
    financing: t('permissions:permissions.financing'),
    affiliates: t('permissions:permissions.affiliates'),
    messages: t('permissions:permissions.messages'),
    content: t('permissions:permissions.content'),
    courses: t('permissions:permissions.courses'),
    announcements: t('permissions:permissions.announcements'),
    analytics: t('permissions:permissions.analytics'),
    transactions: t('permissions:permissions.transactions'),
    reports: t('permissions:permissions.reports'),
    settings: t('permissions:permissions.settings'),
    auditLogs: t('permissions:permissions.auditLogs'),
    permissions: t('permissions:permissions.permissions'),
    contactMessages: t('permissions:permissions.contactMessages'),
    modulePermissions: t('permissions:permissions.modulePermissions'),
    tradingJournal: t('permissions:permissions.tradingJournal'),
  }

  const permissionGroups = [
    {
      title: t('permissions:groups.general'),
      permissions: ['dashboard', 'users', 'settings'] as (keyof PermissionSet)[],
    },
    {
      title: t('permissions:groups.payments'),
      permissions: ['subscriptions', 'payments', 'transactions', 'financing', 'affiliates'] as (keyof PermissionSet)[],
    },
    {
      title: t('permissions:groups.education'),
      permissions: ['content', 'courses', 'meetings', 'events', 'tradingJournal'] as (keyof PermissionSet)[],
    },
    {
      title: t('permissions:groups.communication'),
      permissions: ['announcements', 'emailMarketing', 'messages', 'contactMessages'] as (keyof PermissionSet)[],
    },
    {
      title: t('permissions:groups.administration'),
      permissions: ['analytics', 'reports', 'auditLogs', 'permissions', 'modulePermissions'] as (keyof PermissionSet)[],
    },
  ]

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const data = await permissionService.getAllAdminPermissions()
      setAdmins(data)
    } catch (error) {
      showError(t('permissions:messages.error'))
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleUserSelect = (user: AdminUserWithPermissions) => {
    setSelectedUser(user)
    setEditedPermissions({ ...user.permissions })
  }

  const handlePermissionChange = (permission: keyof PermissionSet, checked: boolean) => {
    if (!editedPermissions) return
    
    setEditedPermissions({
      ...editedPermissions,
      [permission]: checked,
    })
  }

  const handleSave = async () => {
    if (!selectedUser || !editedPermissions) return
    
    try {
      setIsSaving(true)
      
      // Debug: Log what we're sending
      console.log('Saving permissions for user:', selectedUser._id)
      console.log('Permissions being sent:', editedPermissions)
      console.log('All keys present:', Object.keys(editedPermissions))
      
      await permissionService.updateUserPermissions(selectedUser._id, editedPermissions)
      showSuccess(t('permissions:messages.updated'))
      
      // Refresh the data
      await fetchAdmins()
      
      // Re-select the user to refresh the UI
      const updatedAdmins = await permissionService.getAllAdminPermissions()
      const updatedUser = updatedAdmins.find(u => u._id === selectedUser._id)
      if (updatedUser) {
        handleUserSelect(updatedUser)
      }
    } catch (error: any) {
      showError(error.message || t('permissions:messages.error'))
      console.error('Error saving permissions:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!selectedUser) return
    
    try {
      setIsSaving(true)
      await permissionService.resetUserPermissions(selectedUser._id)
      showSuccess(t('permissions:messages.reset'))
      setResetDialogOpen(false)
      fetchAdmins()
      handleUserSelect(selectedUser)
    } catch (error: any) {
      showError(error.message || t('permissions:messages.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = () => {
    if (!selectedUser || !editedPermissions) return false
    
    return Object.keys(editedPermissions).some(
      (key) => editedPermissions[key as keyof PermissionSet] !== selectedUser.permissions[key as keyof PermissionSet]
    )
  }

  return (
    <AdminLayout>
      <Box>
        <PageHeader
          title={t('permissions:title')}
          subtitle={t('permissions:subtitle')}
        />

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {/* User List */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('permissions:users.title')}
                  </Typography>
                  
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {admins.map((admin) => (
                      <Box
                        key={admin._id}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: selectedUser?._id === admin._id ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          cursor: admin.role === 'super_admin' ? 'default' : 'pointer',
                          bgcolor: selectedUser?._id === admin._id ? 'action.selected' : 'background.paper',
                          '&:hover': admin.role !== 'super_admin' ? {
                            bgcolor: 'action.hover',
                          } : {},
                        }}
                        onClick={() => admin.role !== 'super_admin' && handleUserSelect(admin)}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {admin.firstName[0]}{admin.lastName[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {admin.firstName} {admin.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {admin.email}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            icon={admin.role === 'super_admin' ? <SupervisorAccount /> : <Person />}
                            label={admin.role === 'super_admin' ? t('permissions:users.super_admin') : t('permissions:users.admin')}
                            color={admin.role === 'super_admin' ? 'primary' : 'default'}
                          />
                        </Stack>
                        {admin.role === 'super_admin' && (
                          <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                            <Typography variant="caption">
                              {t('permissions:users.super_admin_note')}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Permission Editor */}
            <Grid item xs={12} md={8}>
              {selectedUser ? (
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Box>
                        <Typography variant="h6">
                          {t('permissions:editor.title', { name: `${selectedUser.firstName} ${selectedUser.lastName}` })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('permissions:editor.subtitle')}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<RestartAlt />}
                          onClick={() => setResetDialogOpen(true)}
                          disabled={isSaving}
                        >
                          {t('permissions:editor.reset')}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          disabled={!hasChanges() || isSaving}
                        >
                          {t('permissions:editor.save')}
                        </Button>
                      </Stack>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('permissions:editor.module')}</TableCell>
                            <TableCell align="center">{t('permissions:editor.access')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {permissionGroups.map((group) => (
                            <>
                              <TableRow key={group.title}>
                                <TableCell colSpan={2} sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>
                                  {group.title}
                                </TableCell>
                              </TableRow>
                              {group.permissions.map((permission) => (
                                <TableRow key={permission}>
                                  <TableCell sx={{ pl: 4 }}>
                                    {permissionLabels[permission]}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Switch
                                      checked={editedPermissions?.[permission] || false}
                                      onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                      disabled={isSaving}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <Box 
                      display="flex" 
                      flexDirection="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      height={400}
                    >
                      <Shield sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t('permissions:messages.select_user')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('permissions:users.super_admin_note')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {/* Reset Dialog */}
        <Dialog
          open={resetDialogOpen}
          onClose={() => setResetDialogOpen(false)}
        >
          <DialogTitle>{t('permissions:dialog.reset.title')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('permissions:dialog.reset.message', { 
                name: `${selectedUser?.firstName} ${selectedUser?.lastName}` 
              })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)}>
              {t('permissions:dialog.reset.cancel')}
            </Button>
            <Button 
              onClick={handleReset} 
              color="primary" 
              variant="contained"
              disabled={isSaving}
            >
              {t('permissions:dialog.reset.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  )
}