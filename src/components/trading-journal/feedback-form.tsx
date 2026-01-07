'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
} from '@mui/material'
import {
  Add,
  Star,
  TrendingUp,
  TrendingDown,
  Psychology,
  Security,
  Speed,
  Analytics,
  Lightbulb,
  Warning,
  Pattern,
  MenuBook,
  Task,
  Send,
  Close,
} from '@mui/icons-material'
import { Trade, CreateFeedbackDto, FeedbackRating, MarketType } from '@/types/trading-journal'
import { tradingJournalService } from '@/services/trading-journal.service'
import { useSnackbar } from '@/hooks/use-snackbar'
import { format } from 'date-fns'

interface FeedbackFormProps {
  trade: Trade
  onSuccess?: () => void
  onCancel?: () => void
}

const getRatingLabels = (t: (key: string) => string): { [key: number]: string } => ({
  1: t('feedback.ratingPoor'),
  2: t('feedback.ratingFair'),
  3: t('feedback.ratingGood'),
  4: t('feedback.ratingVeryGood'),
  5: t('feedback.ratingExcellent'),
})

interface RatingCardProps {
  label: string
  value: number
  onChange: (value: number) => void
  icon: React.ReactNode
  color: string
  required?: boolean
  ratingLabels: { [key: number]: string }
  notRatedLabel: string
}

function RatingCard({ label, value, onChange, icon, color, required, ratingLabels, notRatedLabel }: RatingCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': { borderColor: color, bgcolor: `${color}08` },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 36, height: 36 }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ratingLabels[value] || notRatedLabel}
          </Typography>
        </Box>
      </Stack>
      <Rating
        value={value}
        onChange={(_, newValue) => onChange(newValue || 0)}
        size="large"
        sx={{
          '& .MuiRating-iconFilled': { color: color },
          '& .MuiRating-iconHover': { color: color },
        }}
      />
    </Paper>
  )
}

interface TagInputProps {
  label: string
  placeholder: string
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
  color: 'success' | 'warning' | 'info' | 'primary' | 'secondary'
  icon: React.ReactNode
}

function TagInput({ label, placeholder, tags, onAdd, onRemove, color, icon }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
      </Stack>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton size="small" onClick={handleAdd} disabled={!inputValue.trim()}>
              <Add />
            </IconButton>
          ),
          sx: { borderRadius: 2 },
        }}
      />
      {tags.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => onRemove(index)}
              color={color}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1.5 }}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export function FeedbackForm({ trade, onSuccess, onCancel }: FeedbackFormProps) {
  const { t } = useTranslation('trading-journal')
  const { showSuccess, showError } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const ratingLabels = getRatingLabels(t)
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
  })

  const isOptions = trade.market === MarketType.OPTIONS

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleAddItem = (field: keyof CreateFeedbackDto, value: string) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData({
      ...formData,
      [field]: [...currentArray, value],
    })
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

      if (
        !formData.overallRating ||
        !formData.riskManagementRating ||
        !formData.executionRating
      ) {
        showError(t('feedback.requiredRatingsError'))
        return
      }

      await tradingJournalService.createFeedback(formData as CreateFeedbackDto)
      showSuccess(t('feedback.submitSuccess'))
      onSuccess?.()
    } catch (error: any) {
      showError(error.response?.data?.message || t('feedback.submitFailed'))
    } finally {
      setLoading(false)
    }
  }

  const completionScore = [
    formData.overallRating,
    formData.riskManagementRating,
    formData.executionRating,
    formData.strengths?.length ? 1 : 0,
    formData.improvements?.length ? 1 : 0,
    formData.entryAnalysis ? 1 : 0,
    formData.recommendations?.length ? 1 : 0,
  ].filter(Boolean).length

  const completionPercentage = Math.round((completionScore / 7) * 100)

  return (
    <Box sx={{ mt: 1 }}>
      {/* Trade Summary Header */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          background: (trade.netPnl || 0) >= 0
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: '1px solid',
          borderColor: (trade.netPnl || 0) >= 0 ? 'success.main' : 'error.main',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: (trade.netPnl || 0) >= 0 ? 'success.main' : 'error.main',
                  width: 48,
                  height: 48,
                }}
              >
                {(trade.netPnl || 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {trade.symbol}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={isOptions && trade.optionType ? trade.optionType.toUpperCase() : trade.direction.toUpperCase()}
                    size="small"
                    color={isOptions && trade.optionType
                      ? (trade.optionType === 'call' ? 'success' : 'error')
                      : (trade.direction === 'long' ? 'success' : 'error')
                    }
                  />
                  <Chip label={trade.market.toUpperCase()} size="small" variant="outlined" />
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="caption" color="text.secondary">{t('feedback.date')}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {format(new Date(trade.tradeDate), 'MMM dd, yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="caption" color="text.secondary">{t('feedback.entryExit')}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(trade.entryPrice)} → {trade.exitPrice ? formatCurrency(trade.exitPrice) : t('feedback.open')}
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="caption" color="text.secondary">{t('feedback.rMultiple')}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {(trade.rMultiple || 0).toFixed(2)}R
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="caption" color="text.secondary">{t('feedback.netPnl')}</Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={(trade.netPnl || 0) >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(trade.netPnl || 0)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Completion Progress */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              {t('feedback.feedbackCompletion')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: completionPercentage >= 70 ? 'success.main' : 'warning.main',
                },
              }}
            />
          </Box>
          <Typography variant="h6" fontWeight={700} color={completionPercentage >= 70 ? 'success.main' : 'warning.main'}>
            {completionPercentage}%
          </Typography>
        </Stack>
      </Paper>

      {/* Ratings Section */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t('feedback.ratings')}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <RatingCard
            label={t('feedback.overallRating')}
            value={formData.overallRating || 0}
            onChange={(value) => setFormData({ ...formData, overallRating: value as FeedbackRating })}
            icon={<Star fontSize="small" />}
            color="#f59e0b"
            required
            ratingLabels={ratingLabels}
            notRatedLabel={t('feedback.notRated')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RatingCard
            label={t('feedback.riskManagementRating')}
            value={formData.riskManagementRating || 0}
            onChange={(value) => setFormData({ ...formData, riskManagementRating: value as FeedbackRating })}
            icon={<Security fontSize="small" />}
            color="#3b82f6"
            required
            ratingLabels={ratingLabels}
            notRatedLabel={t('feedback.notRated')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RatingCard
            label={t('feedback.executionRating')}
            value={formData.executionRating || 0}
            onChange={(value) => setFormData({ ...formData, executionRating: value as FeedbackRating })}
            icon={<Speed fontSize="small" />}
            color="#22c55e"
            required
            ratingLabels={ratingLabels}
            notRatedLabel={t('feedback.notRated')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <RatingCard
            label={t('feedback.psychologyRating')}
            value={formData.psychologyRating || 0}
            onChange={(value) => setFormData({ ...formData, psychologyRating: value as FeedbackRating })}
            icon={<Psychology fontSize="small" />}
            color="#a855f7"
            ratingLabels={ratingLabels}
            notRatedLabel={t('feedback.notRated')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <RatingCard
            label={t('feedback.analysisRating')}
            value={formData.analysisRating || 0}
            onChange={(value) => setFormData({ ...formData, analysisRating: value as FeedbackRating })}
            icon={<Analytics fontSize="small" />}
            color="#06b6d4"
            ratingLabels={ratingLabels}
            notRatedLabel={t('feedback.notRated')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Quick Feedback Tags */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t('feedback.quickFeedback')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.strengths')}
            placeholder={t('feedback.strengthsPlaceholder')}
            tags={formData.strengths || []}
            onAdd={(tag) => handleAddItem('strengths', tag)}
            onRemove={(index) => handleRemoveItem('strengths', index)}
            color="success"
            icon={<Lightbulb fontSize="small" color="success" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.improvements')}
            placeholder={t('feedback.improvementsPlaceholder')}
            tags={formData.improvements || []}
            onAdd={(tag) => handleAddItem('improvements', tag)}
            onRemove={(index) => handleRemoveItem('improvements', index)}
            color="warning"
            icon={<Warning fontSize="small" color="warning" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.patterns')}
            placeholder={t('feedback.patternsPlaceholder')}
            tags={formData.patternsIdentified || []}
            onAdd={(tag) => handleAddItem('patternsIdentified', tag)}
            onRemove={(index) => handleRemoveItem('patternsIdentified', index)}
            color="info"
            icon={<Pattern fontSize="small" color="info" />}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Detailed Analysis */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t('feedback.detailedAnalysis')}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('feedback.entryAnalysis')}
            value={formData.entryAnalysis || ''}
            onChange={(e) => setFormData({ ...formData, entryAnalysis: e.target.value })}
            placeholder={t('feedback.entryAnalysisPlaceholder')}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('feedback.exitAnalysis')}
            value={formData.exitAnalysis || ''}
            onChange={(e) => setFormData({ ...formData, exitAnalysis: e.target.value })}
            placeholder={t('feedback.exitAnalysisPlaceholder')}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('feedback.riskManagement')}
            value={formData.riskManagementReview || ''}
            onChange={(e) => setFormData({ ...formData, riskManagementReview: e.target.value })}
            placeholder={t('feedback.riskManagementPlaceholder')}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('feedback.psychology')}
            value={formData.psychologyNotes || ''}
            onChange={(e) => setFormData({ ...formData, psychologyNotes: e.target.value })}
            placeholder={t('feedback.psychologyPlaceholder')}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Recommendations & Resources */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t('feedback.recommendationsAndResources')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.recommendations')}
            placeholder={t('feedback.recommendationsPlaceholder')}
            tags={formData.recommendations || []}
            onAdd={(tag) => handleAddItem('recommendations', tag)}
            onRemove={(index) => handleRemoveItem('recommendations', index)}
            color="primary"
            icon={<Lightbulb fontSize="small" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.resources')}
            placeholder={t('feedback.resourcesPlaceholder')}
            tags={formData.suggestedResources || []}
            onAdd={(tag) => handleAddItem('suggestedResources', tag)}
            onRemove={(index) => handleRemoveItem('suggestedResources', index)}
            color="secondary"
            icon={<MenuBook fontSize="small" color="secondary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TagInput
            label={t('feedback.actionItems')}
            placeholder={t('feedback.actionItemsPlaceholder')}
            tags={formData.actionItems || []}
            onAdd={(tag) => handleAddItem('actionItems', tag)}
            onRemove={(index) => handleRemoveItem('actionItems', index)}
            color="info"
            icon={<Task fontSize="small" color="info" />}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<Close />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {t('feedback.cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? t('feedback.submitting') : t('feedback.submit')}
        </Button>
      </Stack>
    </Box>
  )
}
