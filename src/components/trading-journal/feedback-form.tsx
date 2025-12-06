'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Rating,
  Stack,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Add, Close } from '@mui/icons-material'
import { Trade, CreateFeedbackDto, FeedbackRating } from '@/types/trading-journal'
import { tradingJournalService } from '@/services/trading-journal.service'
import { useSnackbar } from '@/hooks/use-snackbar'

interface FeedbackFormProps {
  trade: Trade
  onSuccess?: () => void
  onCancel?: () => void
}

export function FeedbackForm({ trade, onSuccess, onCancel }: FeedbackFormProps) {
  const { showSuccess, showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateFeedbackDto>>({
    tradeId: trade._id,
    studentId: trade.userId,
    overallRating: FeedbackRating.THREE,
    riskManagementRating: FeedbackRating.THREE,
    executionRating: FeedbackRating.THREE,
    psychologyRating: FeedbackRating.THREE,
    analysisRating: FeedbackRating.THREE,
    strengths: [],
    improvements: [],
    patternsIdentified: [],
    recommendations: [],
    suggestedResources: [],
    actionItems: [],
    requiresFollowUp: false,
    isPinned: false,
  })

  const [newStrength, setNewStrength] = useState('')
  const [newImprovement, setNewImprovement] = useState('')
  const [newPattern, setNewPattern] = useState('')
  const [newRecommendation, setNewRecommendation] = useState('')
  const [newResource, setNewResource] = useState('')
  const [newActionItem, setNewActionItem] = useState('')

  const handleAddItem = (
    field: keyof CreateFeedbackDto,
    value: string,
    setValue: (value: string) => void
  ) => {
    if (!value.trim()) return

    const currentArray = (formData[field] as string[]) || []
    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()],
    })
    setValue('')
  }

  const handleRemoveItem = (field: keyof CreateFeedbackDto, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validate required fields
      if (
        !formData.overallRating ||
        !formData.riskManagementRating ||
        !formData.executionRating
      ) {
        showError('Please provide all required ratings')
        return
      }

      await tradingJournalService.createFeedback(formData as CreateFeedbackDto)
      showSuccess('Feedback submitted successfully')
      onSuccess?.()
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Providing detailed feedback helps traders improve their performance and learn from their
        trades.
      </Alert>

      <Grid container spacing={3}>
        {/* Ratings Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Performance Ratings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Overall Rating *
                </Typography>
                <Rating
                  value={formData.overallRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, overallRating: value as FeedbackRating })
                  }
                  size="large"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Risk Management *
                </Typography>
                <Rating
                  value={formData.riskManagementRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, riskManagementRating: value as FeedbackRating })
                  }
                  size="large"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Execution *
                </Typography>
                <Rating
                  value={formData.executionRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, executionRating: value as FeedbackRating })
                  }
                  size="large"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Psychology
                </Typography>
                <Rating
                  value={formData.psychologyRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, psychologyRating: value as FeedbackRating })
                  }
                  size="large"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Analysis
                </Typography>
                <Rating
                  value={formData.analysisRating}
                  onChange={(_, value) =>
                    setFormData({ ...formData, analysisRating: value as FeedbackRating })
                  }
                  size="large"
                />
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Strengths */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Strengths
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a strength..."
              value={newStrength}
              onChange={(e) => setNewStrength(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('strengths', newStrength, setNewStrength)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => handleAddItem('strengths', newStrength, setNewStrength)}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.strengths?.map((strength, index) => (
                <Chip
                  key={index}
                  label={strength}
                  onDelete={() => handleRemoveItem('strengths', index)}
                  color="success"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Improvements */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Areas for Improvement
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add an improvement area..."
              value={newImprovement}
              onChange={(e) => setNewImprovement(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('improvements', newImprovement, setNewImprovement)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => handleAddItem('improvements', newImprovement, setNewImprovement)}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.improvements?.map((improvement, index) => (
                <Chip
                  key={index}
                  label={improvement}
                  onDelete={() => handleRemoveItem('improvements', index)}
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Patterns Identified */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Patterns Identified
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a pattern..."
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('patternsIdentified', newPattern, setNewPattern)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => handleAddItem('patternsIdentified', newPattern, setNewPattern)}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.patternsIdentified?.map((pattern, index) => (
                <Chip
                  key={index}
                  label={pattern}
                  onDelete={() => handleRemoveItem('patternsIdentified', index)}
                  color="info"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Detailed Analysis */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Entry Analysis"
            value={formData.entryAnalysis || ''}
            onChange={(e) => setFormData({ ...formData, entryAnalysis: e.target.value })}
            placeholder="Analyze the trade entry timing, setup quality, and execution..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Exit Analysis"
            value={formData.exitAnalysis || ''}
            onChange={(e) => setFormData({ ...formData, exitAnalysis: e.target.value })}
            placeholder="Analyze the exit strategy, timing, and decision-making..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Risk Management Review"
            value={formData.riskManagementReview || ''}
            onChange={(e) => setFormData({ ...formData, riskManagementReview: e.target.value })}
            placeholder="Review position sizing, stop loss, and risk/reward ratio..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Psychology Notes"
            value={formData.psychologyNotes || ''}
            onChange={(e) => setFormData({ ...formData, psychologyNotes: e.target.value })}
            placeholder="Comment on emotional control, discipline, and mindset..."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Setup Quality Review"
            value={formData.setupQualityReview || ''}
            onChange={(e) => setFormData({ ...formData, setupQualityReview: e.target.value })}
            placeholder="Evaluate the quality of the trade setup and execution..."
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a recommendation..."
              value={newRecommendation}
              onChange={(e) => setNewRecommendation(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('recommendations', newRecommendation, setNewRecommendation)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleAddItem('recommendations', newRecommendation, setNewRecommendation)
                    }
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.recommendations?.map((rec, index) => (
                <Chip
                  key={index}
                  label={rec}
                  onDelete={() => handleRemoveItem('recommendations', index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Suggested Resources
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a resource (URL or description)..."
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('suggestedResources', newResource, setNewResource)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleAddItem('suggestedResources', newResource, setNewResource)
                    }
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.suggestedResources?.map((resource, index) => (
                <Chip
                  key={index}
                  label={resource}
                  onDelete={() => handleRemoveItem('suggestedResources', index)}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Action Items */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Action Items
          </Typography>
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add an action item..."
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem('actionItems', newActionItem, setNewActionItem)
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => handleAddItem('actionItems', newActionItem, setNewActionItem)}
                  >
                    <Add />
                  </IconButton>
                ),
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {formData.actionItems?.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => handleRemoveItem('actionItems', index)}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Follow-up Options */}
        <Grid item xs={12}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.requiresFollowUp || false}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresFollowUp: e.target.checked })
                  }
                />
              }
              label="Requires Follow-up"
            />
            {formData.requiresFollowUp && (
              <TextField
                type="date"
                label="Follow-up Date"
                value={
                  formData.followUpDate
                    ? new Date(formData.followUpDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUpDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPinned || false}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                />
              }
              label="Pin this feedback (highlight as important)"
            />
          </Stack>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
