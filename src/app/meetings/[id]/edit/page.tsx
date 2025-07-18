'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { EditMeetingForm } from '@/components/meetings/edit-meeting-form'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useMeeting } from '@/hooks/use-meetings'

export default function EditMeetingPage() {
  const { t } = useTranslation('meetings')
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const { data: meeting, isLoading, error } = useMeeting(meetingId)

  if (isLoading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  if (error || !meeting) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message || 'Meeting not found'}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/meetings')}
          >
            Back to Meetings
          </Button>
        </Box>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/meetings')}
            sx={{ minWidth: 'auto' }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={600}>
            {t('edit.title', 'Edit Meeting')}
          </Typography>
        </Box>

        {/* Edit Form */}
        <EditMeetingForm
          meeting={meeting}
          onSuccess={() => {
            router.push('/meetings')
          }}
          onCancel={() => {
            router.push('/meetings')
          }}
        />
      </Box>
    </AdminLayout>
  )
}