'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material'
import {
  Search,
  Check,
  Block,
  Edit,
  AttachMoney,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/auth-store'
import { useSnackbar } from '@/hooks/use-snackbar'
import axios from 'axios'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  approvedForLocalFinancing: boolean
  localFinancingDetails?: {
    approvedBy: string
    approvedAt: string
    maxAmount: number
    notes: string
  }
  createdAt: string
}

export function FinancingUsers() {
  const { t } = useTranslation('financing')
  const { token } = useAuthStore()
  const { showSuccess, showError } = useSnackbar()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'not_approved'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [approvalData, setApprovalData] = useState({
    maxAmount: 5000,
    notes: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [filterApproved, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/users?`
      
      if (filterApproved !== 'all') {
        url += `approved=${filterApproved === 'approved'}&`
      }
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      showError(t('errors.fetch_users', 'Failed to fetch users'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenApprovalDialog = (user: User) => {
    setSelectedUser(user)
    if (user.localFinancingDetails) {
      setApprovalData({
        maxAmount: user.localFinancingDetails.maxAmount,
        notes: user.localFinancingDetails.notes,
      })
    } else {
      setApprovalData({
        maxAmount: 5000,
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedUser(null)
  }

  const handleApprove = async () => {
    if (!selectedUser) return
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/users/${selectedUser._id}/approve`,
        approvalData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showSuccess(t('success.user_approved', 'User approved for local financing'))
      handleCloseDialog()
      fetchUsers()
    } catch (error: any) {
      showError(error.response?.data?.message || t('errors.approve_user', 'Failed to approve user'))
    }
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm(t('confirm.revoke_user', 'Are you sure you want to revoke financing approval for this user?'))) {
      return
    }
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/users/${userId}/revoke`,
        { reason: 'Admin revoked' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showSuccess(t('success.user_revoked', 'User financing approval revoked'))
      fetchUsers()
    } catch (error: any) {
      showError(error.response?.data?.message || t('errors.revoke_user', 'Failed to revoke user approval'))
    }
  }

  const handleUpdateDetails = async () => {
    if (!selectedUser) return
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/financing/users/${selectedUser._id}/financing-details`,
        approvalData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showSuccess(t('success.details_updated', 'Financing details updated'))
      handleCloseDialog()
      fetchUsers()
    } catch (error: any) {
      showError(error.response?.data?.message || t('errors.update_details', 'Failed to update financing details'))
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('users.title', 'User Financing Approvals')}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={t('users.search', 'Search by name or email...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={filterApproved === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterApproved('all')}
              >
                {t('users.filter.all', 'All Users')}
              </Button>
              <Button
                variant={filterApproved === 'approved' ? 'contained' : 'outlined'}
                onClick={() => setFilterApproved('approved')}
                color="success"
              >
                {t('users.filter.approved', 'Approved')}
              </Button>
              <Button
                variant={filterApproved === 'not_approved' ? 'contained' : 'outlined'}
                onClick={() => setFilterApproved('not_approved')}
              >
                {t('users.filter.not_approved', 'Not Approved')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('users.name', 'Name')}</TableCell>
              <TableCell>{t('users.email', 'Email')}</TableCell>
              <TableCell>{t('users.status', 'Status')}</TableCell>
              <TableCell>{t('users.max_amount', 'Max Amount')}</TableCell>
              <TableCell>{t('users.approved_by', 'Approved By')}</TableCell>
              <TableCell>{t('users.approved_date', 'Approved Date')}</TableCell>
              <TableCell align="right">{t('users.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      user.approvedForLocalFinancing
                        ? t('status.approved', 'Approved')
                        : t('status.not_approved', 'Not Approved')
                    }
                    color={user.approvedForLocalFinancing ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.localFinancingDetails?.maxAmount
                    ? `$${user.localFinancingDetails.maxAmount.toLocaleString()}`
                    : '-'}
                </TableCell>
                <TableCell>
                  {user.localFinancingDetails?.approvedBy || '-'}
                </TableCell>
                <TableCell>
                  {user.localFinancingDetails?.approvedAt
                    ? new Date(user.localFinancingDetails.approvedAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  {user.approvedForLocalFinancing ? (
                    <>
                      <IconButton 
                        onClick={() => handleOpenApprovalDialog(user)} 
                        size="small"
                        title={t('users.edit_details', 'Edit Details')}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleRevoke(user._id)} 
                        size="small" 
                        color="error"
                        title={t('users.revoke', 'Revoke Approval')}
                      >
                        <Block />
                      </IconButton>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      onClick={() => handleOpenApprovalDialog(user)}
                    >
                      {t('users.approve', 'Approve')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser?.approvedForLocalFinancing
            ? t('users.edit_approval_title', 'Edit Financing Details')
            : t('users.approve_title', 'Approve User for Financing')}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('users.max_amount_label', 'Maximum Financing Amount')}
                    value={approvalData.maxAmount}
                    onChange={(e) => setApprovalData({ ...approvalData, maxAmount: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                    helperText={t('users.max_amount_help', 'Maximum amount this user can finance')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={t('users.notes', 'Notes')}
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
                    helperText={t('users.notes_help', 'Internal notes about this approval')}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('actions.cancel', 'Cancel')}</Button>
          <Button 
            onClick={selectedUser?.approvedForLocalFinancing ? handleUpdateDetails : handleApprove} 
            variant="contained"
            color="primary"
          >
            {selectedUser?.approvedForLocalFinancing 
              ? t('actions.update', 'Update') 
              : t('actions.approve', 'Approve')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}