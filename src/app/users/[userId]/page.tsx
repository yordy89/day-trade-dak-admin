'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  Email,
  Block,
  CheckCircle,
} from '@mui/icons-material'
import { useUser } from '@/hooks/use-users'
import { UserDetailsTab } from '@/components/users/user-details-tab'
import { UserSubscriptionsTab } from '@/components/users/user-subscriptions-tab'
import { UserActivityTab } from '@/components/users/user-activity-tab'
import { toast } from 'react-hot-toast'
import { userService } from '@/services/user.service'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function UserDetailsPage() {
  const { t } = useTranslation('users')
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [activeTab, setActiveTab] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: user, isLoading, error } = useUser(userId)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm(t('dialogs.confirmDelete', 'Are you sure you want to delete this user?'))) {
      return
    }

    setIsDeleting(true)
    try {
      await userService.deleteUser(userId)
      toast.success(t('messages.userDeleted', 'User deleted successfully'))
      router.push('/users')
    } catch (error) {
      toast.error(t('messages.error', 'Failed to delete user'))
      setIsDeleting(false)
    }
  }

  const handleStatusToggle = async () => {
    try {
      const newStatus = user?.status === 'active' ? 'banned' : 'active'
      await userService.updateUserStatus(userId, newStatus)
      toast.success(t('messages.statusUpdated', 'User status updated successfully'))
      // Refetch user data
      window.location.reload()
    } catch (error) {
      toast.error(t('messages.error', 'Failed to update user status'))
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Paper>
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Container>
    )
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('messages.userNotFound', 'User not found')}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/users')}
          sx={{ mt: 2 }}
        >
          {t('actions.back', 'Back to Users')}
        </Button>
      </Container>
    )
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/users')} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight={600}>
            {fullName}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => router.push(`/communications/email?userId=${userId}`)}
          >
            {t('actions.sendEmail', 'Send Email')}
          </Button>
          <Button
            variant="outlined"
            color={user.status === 'active' ? 'error' : 'success'}
            startIcon={user.status === 'active' ? <Block /> : <CheckCircle />}
            onClick={handleStatusToggle}
          >
            {user.status === 'active' ? t('actions.ban', 'Ban User') : t('actions.activate', 'Activate User')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            {t('actions.edit', 'Edit')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {t('actions.delete', 'Delete')}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={t('tabs.details', 'Details')} />
            <Tab label={t('tabs.subscriptions', 'Subscriptions')} />
            <Tab label={t('tabs.activity', 'Activity')} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <UserDetailsTab user={user} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <UserSubscriptionsTab userId={userId} subscriptions={user.subscriptions} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <UserActivityTab userId={userId} />
        </TabPanel>
      </Paper>
    </Container>
  )
}