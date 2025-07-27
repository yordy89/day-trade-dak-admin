'use client'

import { useState, useMemo } from 'react'
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
} from '@mui/material'
import { 
  Edit, 
  Delete, 
  MoreVert, 
  Email,
  Visibility
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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data, isLoading, deleteUser, updateUserStatus } = useUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery,
    ...filters,
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
      case 'ban':
        handleUpdateStatus(user._id, 'banned')
        break
      case 'activate':
        handleUpdateStatus(user._id, 'active')
        break
      case 'email':
        router.push(`/communications/email?userId=${user._id}`)
        break
    }
  }

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await updateUserStatus(userId, status)
      toast.success(t('messages.statusUpdated', 'User status updated successfully'))
    } catch (error) {
      toast.error(t('messages.error', 'Failed to update user status'))
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
      headerName: t('columns.user', 'User'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()
        const displayName = fullName || params.row.email
        const initials = fullName 
          ? `${params.row.firstName?.charAt(0) || ''}${params.row.lastName?.charAt(0) || ''}`
          : params.row.email?.charAt(0)?.toUpperCase() || '?'
        
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              src={params.row.profileImage} 
              alt={displayName}
              sx={{ width: 40, height: 40 }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'role',
      headerName: t('columns.role', 'Role'),
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const roleColors: Record<string, any> = {
          user: 'default',
          moderator: 'secondary',
          admin: 'warning',
          super_admin: 'error',
        }
        return (
          <Chip 
            label={String(t(`roles.${params.value}`, params.value))} 
            size="small"
            color={roleColors[params.value] || 'default'}
          />
        )
      },
    },
    {
      field: 'subscriptions',
      headerName: t('columns.subscriptions', 'Subscriptions'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const subscriptions = params.row.subscriptions || []
        if (subscriptions.length === 0) {
          return <Chip label={t('subscriptions.none', 'No subscriptions')} size="small" variant="outlined" />
        }
        
        // Show active subscriptions count
        const activeCount = subscriptions.filter((sub: any) => !sub.expiresAt || new Date(sub.expiresAt) > new Date()).length
        const totalCount = subscriptions.length
        
        return (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Chip 
              label={`${activeCount} active`} 
              size="small"
              color="success"
              variant={activeCount > 0 ? 'filled' : 'outlined'}
            />
            {totalCount > activeCount && (
              <Chip 
                label={`${totalCount - activeCount} expired`} 
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        )
      },
    },
    {
      field: 'activeSubscriptions',
      headerName: t('columns.plans', 'Active Plans'),
      width: 250,
      renderCell: (params: GridRenderCellParams) => {
        const subscriptions = params.row.subscriptions || []
        const activeSubscriptions = subscriptions.filter((sub: any) => 
          !sub.expiresAt || new Date(sub.expiresAt) > new Date()
        )
        
        if (activeSubscriptions.length === 0) {
          return (
            <Typography variant="caption" color="text.secondary">
              {t('subscriptions.noActive', 'No active plans')}
            </Typography>
          )
        }
        
        return (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {activeSubscriptions.slice(0, 3).map((sub: any, index: number) => (
              <Chip 
                key={sub._id || index}
                label={sub.plan} 
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            {activeSubscriptions.length > 3 && (
              <Chip 
                label={`+${activeSubscriptions.length - 3} more`} 
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )
      },
    },
    {
      field: 'stripeCustomerId',
      headerName: t('columns.customer', 'Customer ID'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="caption" color="text.secondary">
              {t('customer.none', 'No customer ID')}
            </Typography>
          )
        }
        return (
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        )
      },
    },
    {
      field: 'actions',
      headerName: t('columns.actions', 'Actions'),
      width: 80,
      sortable: false,
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

  return (
    <>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data?.users || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={data?.total || 0}
          paginationMode="server"
          sortingMode="server"
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
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
              user: selectedUser?.fullName || selectedUser?.email,
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