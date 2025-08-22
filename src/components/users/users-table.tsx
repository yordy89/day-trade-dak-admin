'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridActionsCellItem,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid'
import { 
  Box, 
  Chip, 
  Avatar, 
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material'
import { 
  Edit, 
  Delete, 
  MoreVert, 
  Email,
  Visibility,
  Person,
  AdminPanelSettings
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useUsers } from '@/hooks/use-users'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface UsersTableProps {
  searchQuery: string
  filters: {
    status: string
    subscription: string
    role: string
  }
}

export function UsersTable({ searchQuery, filters }: UsersTableProps) {
  const { t } = useTranslation('users')
  const router = useRouter()
  
  // Initialize pagination with a stable default
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(() => ({
    page: 0,
    pageSize: 25,
  }))
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  
  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ searchQuery, ...filters })
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  // Reset pagination when filters change
  useEffect(() => {
    const currentFilters = { searchQuery, ...filters }
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)
    
    if (filtersChanged && isMountedRef.current) {
      setPaginationModel(prev => ({ ...prev, page: 0 }))
      prevFiltersRef.current = currentFilters
    }
  }, [searchQuery, filters])

  const { data, isLoading, deleteUser, updateUserStatus } = useUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery,
    status: filters.status,
    subscription: filters.subscription,
    role: filters.role,
    sortBy: sortModel[0]?.field,
    sortOrder: sortModel[0]?.sort as 'asc' | 'desc' | undefined,
  })

  const handleAction = (action: string, user: any) => {
    setSelectedUser(user)
    setAnchorEl(null)

    switch (action) {
      case 'view':
        router.push(`/users/${user._id}`)
        break
      case 'edit':
        router.push(`/users/${user._id}/edit`)
        break
      case 'delete':
        setDeleteDialogOpen(true)
        break
      case 'email':
        router.push(`/communications/email?userId=${user._id}`)
        break
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser._id)
      toast.success(t('messages.userDeleted', 'User deleted successfully'))
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(t('messages.error', 'Failed to delete user'))
    }
  }

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'user',
      headerName: t('users:table.user'),
      flex: 1,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams) => {
        const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()
        const displayName = fullName || params.row.email
        const initials = fullName 
          ? `${params.row.firstName?.charAt(0) || ''}${params.row.lastName?.charAt(0) || ''}`
          : params.row.email?.charAt(0)?.toUpperCase() || '?'
        
        return (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              src={params.row.profileImage} 
              alt={displayName}
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: params.row.profileImage ? 'transparent' : 'primary.main',
                fontSize: '0.875rem'
              }}
            >
              {!params.row.profileImage && initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayName}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'role',
      headerName: t('users:table.role'),
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const roleConfig: Record<string, any> = {
          user: { color: 'default', icon: <Person fontSize="small" /> },
          admin: { color: 'warning', icon: <AdminPanelSettings fontSize="small" /> },
          super_admin: { color: 'error', icon: <AdminPanelSettings fontSize="small" /> },
        }
        
        const config = roleConfig[params.value] || roleConfig.user
        
        return (
          <Chip 
            label={String(t(`roles.${params.value}`, params.value))} 
            size="small"
            color={config.color}
            icon={config.icon}
            variant={params.value === 'user' ? 'outlined' : 'filled'}
          />
        )
      },
    },
    {
      field: 'subscriptionStatus',
      headerName: t('users:table.status'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        // First check the user's actual status field
        const userStatus = params.row.status
        const isActive = userStatus === 'active'
        
        // Optionally also check if they have active subscriptions
        const subscriptions = params.row.subscriptions || []
        const hasActiveSubscriptions = subscriptions.some((sub: any) => 
          !sub.expiresAt || new Date(sub.expiresAt) > new Date()
        )
        
        // User is active if their status is 'active' OR they have active subscriptions
        const isUserActive = isActive || hasActiveSubscriptions
        
        return (
          <Chip 
            label={isUserActive ? t('status.active', 'Active') : t('status.inactive', 'Inactive')} 
            size="small"
            color={isUserActive ? 'success' : 'default'}
            variant={isUserActive ? 'filled' : 'outlined'}
          />
        )
      },
    },
    {
      field: 'plans',
      headerName: t('users:table.subscription'),
      width: 280,
      renderCell: (params: GridRenderCellParams) => {
        const subscriptions = params.row.subscriptions || []
        const activeSubscriptions = subscriptions.filter((sub: any) => 
          !sub.expiresAt || new Date(sub.expiresAt) > new Date()
        )
        
        if (activeSubscriptions.length === 0) {
          return (
            <Box display="flex" alignItems="center" height="100%">
              <Typography variant="caption" color="text.secondary">
                {t('subscriptions.noActive', 'No active plans')}
              </Typography>
            </Box>
          )
        }
        
        return (
          <Box display="flex" gap={0.5} alignItems="center" height="100%">
            {activeSubscriptions.slice(0, 2).map((sub: any, index: number) => (
              <Tooltip key={sub._id || index} title={sub.expiresAt ? `Expires: ${formatDateTime(new Date(sub.expiresAt))}` : 'No expiration'}>
                <Chip 
                  label={sub.plan} 
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              </Tooltip>
            ))}
            {activeSubscriptions.length > 2 && (
              <Tooltip title={activeSubscriptions.slice(2).map((s: any) => s.plan).join(', ')}>
                <Chip 
                  label={`+${activeSubscriptions.length - 2}`} 
                  size="small"
                  variant="filled"
                  color="primary"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              </Tooltip>
            )}
          </Box>
        )
      },
    },
    {
      field: 'totalSubscriptions',
      headerName: t('users:table.totalPlans'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const total = params.row.subscriptions?.length || 0
        const active = params.row.subscriptions?.filter((sub: any) => 
          !sub.expiresAt || new Date(sub.expiresAt) > new Date()
        ).length || 0
        
        return (
          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} height="100%">
            <Typography variant="body2" fontWeight={600}>
              {active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / {total}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'hasStripeCustomer',
      headerName: t('users:table.payment'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const hasStripe = !!params.row.stripeCustomerId
        
        return (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Tooltip title={hasStripe ? params.row.stripeCustomerId : t('customer.noStripe', 'No Stripe customer')}>
              <Chip 
                label={hasStripe ? 'Stripe' : 'None'} 
                size="small"
                color={hasStripe ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            </Tooltip>
          </Box>
        )
      },
    },
    {
      field: 'allowLiveMeetingAccess',
      headerName: t('users:table.liveAccess'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const hasAccess = params.value || false
        
        return (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Chip 
              label={hasAccess ? t('access.granted', 'Granted') : t('access.denied', 'Denied')} 
              size="small"
              color={hasAccess ? 'success' : 'default'}
              variant={hasAccess ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.75rem', height: 24 }}
            />
          </Box>
        )
      },
    },
    {
      field: 'allowLiveWeeklyAccess',
      headerName: t('users:table.liveWeekly'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const hasAccess = params.value || false
        
        return (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Chip 
              label={hasAccess ? t('access.granted', 'Granted') : t('access.denied', 'Denied')} 
              size="small"
              color={hasAccess ? 'warning' : 'default'}
              variant={hasAccess ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.75rem', height: 24 }}
            />
          </Box>
        )
      },
    },
    {
      field: 'actions',
      headerName: t('users:table.actions'),
      width: 80,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
              setSelectedUser(params.row)
            }}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedUser?._id === params.row._id}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => handleAction('view', params.row)}>
              <Visibility sx={{ mr: 1, fontSize: 20 }} />
              {t('actions.view', 'View Details')}
            </MenuItem>
            <MenuItem onClick={() => handleAction('edit', params.row)}>
              <Edit sx={{ mr: 1, fontSize: 20 }} />
              {t('actions.edit', 'Edit User')}
            </MenuItem>
            <MenuItem onClick={() => handleAction('email', params.row)}>
              <Email sx={{ mr: 1, fontSize: 20 }} />
              {t('actions.sendEmail', 'Send Email')}
            </MenuItem>
            <MenuItem 
              onClick={() => handleAction('delete', params.row)}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1, fontSize: 20 }} />
              {t('actions.delete', 'Delete User')}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ], [t, anchorEl, selectedUser])

  // Create a stable key for the DataGrid based on filters
  const dataGridKey = useMemo(() => {
    return `${filters.status}-${filters.subscription}-${filters.role}`
  }, [filters])

  // Handle pagination change
  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    // Only update if actually changed to prevent unnecessary re-renders
    setPaginationModel(current => {
      if (current.page === newModel.page && current.pageSize === newModel.pageSize) {
        return current
      }
      return newModel
    })
  }, [])

  return (
    <>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          key={dataGridKey}
          rows={data?.users || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={data?.total || 0}
          paginationMode="server"
          sortingMode="server"
          disableRowSelectionOnClick
          disableColumnMenu
          keepNonExistentRowsSelected={false}
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.default',
              borderBottom: 2,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeader': {
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 1,
              borderColor: 'divider',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
            '& .MuiDataGrid-root': {
              border: 'none',
            },
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {t('dialogs.deleteTitle', 'Delete User')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('dialogs.deleteMessage', 'Are you sure you want to delete {{user}}? This action cannot be undone.', {
              user: selectedUser ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email})`.trim() : '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}