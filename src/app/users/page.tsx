'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { 
  Search, 
  FilterList, 
  PersonAdd, 
  Download,
  MoreVert 
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { UsersTable } from '@/components/users/users-table'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const { t } = useTranslation('users')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    subscription: 'all',
    role: 'all',
  })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export users')
    setAnchorEl(null)
  }

  return (
    <AdminLayout>
      <Box>
        {/* Page Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start" 
          mb={4}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {t('title', 'Users Management')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('subtitle', 'Manage your platform users, subscriptions, and permissions')}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => router.push('/users/new')}
            >
              {t('actions.addUser', 'Add User')}
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={handleExport}>
                <Download sx={{ mr: 1, fontSize: 20 }} />
                {t('actions.export', 'Export Users')}
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Filters Bar */}
        <Box 
          display="flex" 
          gap={2} 
          mb={3}
          flexWrap="wrap"
          alignItems="center"
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder={t('search.placeholder', 'Search by name, email, or ID...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('filters.status', 'Status')}</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label={t('filters.status', 'Status')}
            >
              <MenuItem value="all">{t('filters.all', 'All')}</MenuItem>
              <MenuItem value="active">{t('filters.active', 'Active')}</MenuItem>
              <MenuItem value="inactive">{t('filters.inactive', 'Inactive')}</MenuItem>
              <MenuItem value="banned">{t('filters.banned', 'Banned')}</MenuItem>
            </Select>
          </FormControl>

          {/* Subscription Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('filters.subscription', 'Subscription')}</InputLabel>
            <Select
              value={filters.subscription}
              onChange={(e) => handleFilterChange('subscription', e.target.value)}
              label={t('filters.subscription', 'Subscription')}
            >
              <MenuItem value="all">{t('filters.all', 'All')}</MenuItem>
              <MenuItem value="free">{t('filters.free', 'Free')}</MenuItem>
              <MenuItem value="basic">{t('filters.basic', 'Basic')}</MenuItem>
              <MenuItem value="pro">{t('filters.pro', 'Pro')}</MenuItem>
              <MenuItem value="enterprise">{t('filters.enterprise', 'Enterprise')}</MenuItem>
            </Select>
          </FormControl>

          {/* Role Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('filters.role', 'Role')}</InputLabel>
            <Select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              label={t('filters.role', 'Role')}
            >
              <MenuItem value="all">{t('filters.all', 'All')}</MenuItem>
              <MenuItem value="user">{t('filters.user', 'User')}</MenuItem>
              <MenuItem value="moderator">{t('filters.moderator', 'Moderator')}</MenuItem>
              <MenuItem value="admin">{t('filters.admin', 'Admin')}</MenuItem>
              <MenuItem value="super_admin">{t('filters.superAdmin', 'Super Admin')}</MenuItem>
            </Select>
          </FormControl>

          {/* Clear Filters */}
          {(searchQuery || filters.status !== 'all' || filters.subscription !== 'all' || filters.role !== 'all') && (
            <Button
              size="small"
              onClick={() => {
                setSearchQuery('')
                setFilters({ status: 'all', subscription: 'all', role: 'all' })
              }}
            >
              {t('filters.clear', 'Clear Filters')}
            </Button>
          )}
        </Box>

        {/* Active Filters Display */}
        {(searchQuery || filters.status !== 'all' || filters.subscription !== 'all' || filters.role !== 'all') && (
          <Box display="flex" gap={1} mb={3} flexWrap="wrap">
            {searchQuery && (
              <Chip
                label={`${t('search.label', 'Search')}: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}
            {filters.status !== 'all' && (
              <Chip
                label={`${t('filters.status', 'Status')}: ${t(`filters.${filters.status}`, filters.status)}`}
                onDelete={() => handleFilterChange('status', 'all')}
                size="small"
              />
            )}
            {filters.subscription !== 'all' && (
              <Chip
                label={`${t('filters.subscription', 'Subscription')}: ${t(`filters.${filters.subscription}`, filters.subscription)}`}
                onDelete={() => handleFilterChange('subscription', 'all')}
                size="small"
              />
            )}
            {filters.role !== 'all' && (
              <Chip
                label={`${t('filters.role', 'Role')}: ${t(`filters.${filters.role}`, filters.role)}`}
                onDelete={() => handleFilterChange('role', 'all')}
                size="small"
              />
            )}
          </Box>
        )}

        {/* Users Table */}
        <UsersTable 
          searchQuery={searchQuery}
          filters={filters}
        />
      </Box>
    </AdminLayout>
  )
}