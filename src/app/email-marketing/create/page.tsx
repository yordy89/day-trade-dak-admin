'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  IconButton,
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Send,
  Schedule,
  Save,
  Email,
  CheckCircle,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { RecipientSelector } from '@/components/email-marketing/recipient-selector'
import { EmailEditorComponent } from '@/components/email-marketing/email-editor'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const steps = ['Campaign Setup', 'Select Recipients', 'Design Email', 'Review & Send']

export default function CreateCampaignPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  // Campaign data
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    previewText: '',
    type: 'immediate',
    recipientFilters: {},
    recipientCount: 0,
    htmlContent: '',
    jsonContent: null,
    testEmails: '',
    scheduledDate: '',
  })

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!campaign.name || !campaign.subject) {
        toast.error('Please fill in all required fields')
        return
      }
    } else if (activeStep === 1) {
      if (campaign.recipientCount === 0) {
        toast.error('Please select at least one recipient')
        return
      }
    } else if (activeStep === 2) {
      if (!campaign.htmlContent) {
        toast.error('Please design your email template')
        return
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSaveDraft = async () => {
    try {
      setLoading(true)
      const response = await api.post('/email-marketing/campaigns', {
        ...campaign,
        status: 'draft',
      })
      toast.success('Campaign saved as draft')
      router.push(`/email-marketing/${response.data._id}/edit`)
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!campaign.testEmails) {
      toast.error('Please enter test email addresses')
      return
    }

    try {
      setSendingTest(true)
      const emails = campaign.testEmails.split(',').map((e) => e.trim())
      
      // First save the campaign as draft
      const campaignResponse = await api.post('/email-marketing/campaigns', {
        ...campaign,
        status: 'draft',
      })

      // Then send test email
      await api.post('/email-marketing/campaigns/test', {
        campaignId: campaignResponse.data._id,
        testEmails: emails,
      })

      toast.success(`Test email sent to ${emails.length} recipient(s)`)
    } catch (error) {
      console.error('Error sending test:', error)
      toast.error('Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  const handleSendCampaign = async () => {
    try {
      setLoading(true)
      const response = await api.post('/email-marketing/campaigns', campaign)
      
      if (campaign.type === 'scheduled' && campaign.scheduledDate) {
        await api.post(`/email-marketing/campaigns/${response.data._id}/schedule`, {
          scheduledDate: campaign.scheduledDate,
        })
        toast.success('Campaign scheduled successfully')
      } else {
        await api.post(`/email-marketing/campaigns/${response.data._id}/send`)
        toast.success('Campaign sent successfully')
      }
      
      router.push('/email-marketing')
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Campaign Name"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                  helperText="Internal name for your reference"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email Subject"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                  helperText="This is what recipients will see in their inbox"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preview Text"
                  value={campaign.previewText}
                  onChange={(e) => setCampaign({ ...campaign, previewText: e.target.value })}
                  helperText="Optional text that appears after the subject in some email clients"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Campaign Type</InputLabel>
                  <Select
                    value={campaign.type}
                    onChange={(e) => setCampaign({ ...campaign, type: e.target.value })}
                    label="Campaign Type"
                  >
                    <MenuItem value="immediate">Send Immediately</MenuItem>
                    <MenuItem value="scheduled">Schedule for Later</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {campaign.type === 'scheduled' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Scheduled Date & Time"
                    value={campaign.scheduledDate}
                    onChange={(e) => setCampaign({ ...campaign, scheduledDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        )

      case 1:
        return (
          <RecipientSelector
            value={campaign.recipientFilters}
            onChange={(filters, count) => {
              setCampaign({
                ...campaign,
                recipientFilters: filters,
                recipientCount: count,
              })
            }}
            showSaveSegment
          />
        )

      case 2:
        return (
          <EmailEditorComponent
            value={campaign.htmlContent}
            jsonContent={campaign.jsonContent}
            onChange={(html, json) => {
              setCampaign({
                ...campaign,
                htmlContent: html,
                jsonContent: json,
              })
            }}
            height="600px"
          />
        )

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Campaign Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Campaign Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {campaign.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Subject
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {campaign.subject}
                      </Typography>
                    </Grid>
                    {campaign.previewText && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Preview Text
                        </Typography>
                        <Typography variant="body1">
                          {campaign.previewText}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Recipients
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {campaign.recipientCount.toLocaleString()} recipients
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Send Time
                      </Typography>
                      <Typography variant="body1">
                        {campaign.type === 'scheduled' && campaign.scheduledDate
                          ? format(new Date(campaign.scheduledDate), 'PPpp')
                          : 'Immediately after confirmation'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Preview
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
                  </Paper>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Send Test Email
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Email Addresses"
                  value={campaign.testEmails}
                  onChange={(e) => setCampaign({ ...campaign, testEmails: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                  helperText="Separate multiple emails with commas"
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  startIcon={sendingTest ? <CircularProgress size={20} /> : <Email />}
                >
                  {sendingTest ? 'Sending...' : 'Send Test'}
                </Button>
              </Card>

              <Alert severity="info">
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Pre-send Checklist
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  <li>Review subject line for typos</li>
                  <li>Check all links are working</li>
                  <li>Verify merge tags are correct</li>
                  <li>Send test email to yourself</li>
                  <li>Confirm recipient selection</li>
                </Box>
              </Alert>
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/email-marketing')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              Create Campaign
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save as Draft
          </Button>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Box display="flex" gap={2}>
            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleSendCampaign}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} />
                    ) : campaign.type === 'scheduled' ? (
                      <Schedule />
                    ) : (
                      <Send />
                    )
                  }
                >
                  {loading
                    ? 'Processing...'
                    : campaign.type === 'scheduled'
                    ? 'Schedule Campaign'
                    : 'Send Campaign'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </AdminLayout>
  )
}