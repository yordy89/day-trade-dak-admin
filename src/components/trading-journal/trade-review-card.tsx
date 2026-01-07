'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Schedule,
  AttachMoney,
  ShowChart,
  Psychology,
  Notes,
  RateReview,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { Trade, MarketType } from '@/types/trading-journal'
import { format } from 'date-fns'
import { FeedbackForm } from './feedback-form'

interface TradeReviewCardProps {
  trade: Trade
  onFeedbackCreated?: () => void
}

export function TradeReviewCard({ trade, onFeedbackCreated }: TradeReviewCardProps) {
  const { t } = useTranslation('trading-journal')
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)

  const isOptions = trade.market === MarketType.OPTIONS

  // Get the display label for direction/option type
  const getDirectionLabel = () => {
    if (isOptions && trade.optionType) {
      return trade.optionType.toUpperCase()
    }
    return trade.direction.toUpperCase()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number | null | undefined) => {
    return `${(value || 0).toFixed(2)}%`
  }

  const getDirectionColor = () => {
    if (isOptions && trade.optionType) {
      return trade.optionType === 'call' ? 'success' : 'error'
    }
    return trade.direction === 'long' ? 'success' : 'error'
  }

  const getPnlColor = (pnl: number | null | undefined) => {
    return (pnl || 0) >= 0 ? 'success.main' : 'error.main'
  }

  const getEmotionChip = (emotion?: string) => {
    if (!emotion) return null

    const emotionColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      confident: 'success',
      neutral: 'default',
      calm: 'info',
      excited: 'warning',
      anxious: 'warning',
      fearful: 'error',
      greedy: 'error',
      frustrated: 'error',
    }

    return (
      <Chip
        label={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
        size="small"
        color={emotionColors[emotion] || 'default'}
        variant="outlined"
      />
    )
  }

  const handleFeedbackSubmit = () => {
    setFeedbackDialogOpen(false)
    onFeedbackCreated?.()
  }

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                {trade.symbol}
              </Typography>
              <Chip
                label={getDirectionLabel()}
                size="small"
                color={getDirectionColor()}
              />
              <Chip label={trade.market.toUpperCase()} size="small" variant="outlined" />
              {trade.isOpen && <Chip label={t('trades.open')} size="small" color="warning" />}
              {trade.isReviewed && (
                <Chip
                  icon={<CheckCircle />}
                  label={t('trades.reviewed')}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Stack>
          }
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<RateReview />}
              onClick={() => setFeedbackDialogOpen(true)}
              disabled={trade.isReviewed}
            >
              {t('trades.provideFeedback')}
            </Button>
          }
        />

        <CardContent>
          <Grid container spacing={3}>
            {/* Performance Summary */}
            <Grid item xs={12}>
              {trade.isOpen ? (
                <Alert severity="info" icon={<ShowChart />}>
                  <Typography variant="body1" fontWeight={600}>
                    {t('tradeDetail.positionOpen')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('tradeDetail.pnlCalculatedOnClose')}
                  </Typography>
                </Alert>
              ) : (
                <Alert
                  severity={(trade.netPnl || 0) >= 0 ? 'success' : 'error'}
                  icon={(trade.netPnl || 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.netPnl')}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={getPnlColor(trade.netPnl)}>
                        {formatCurrency(trade.netPnl || 0)}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.rMultiple')}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {(trade.rMultiple || 0).toFixed(2)}R
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.result')}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {trade.isWinner ? t('tradeDetail.winner') : t('tradeDetail.loser')}
                      </Typography>
                    </Box>
                  </Stack>
                </Alert>
              )}
            </Grid>

            {/* Trade Details */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <Schedule sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {t('tradeDetail.tradeDateAndTime')}
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(trade.tradeDate), 'PPP')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('tradeDetail.entry')}: {format(new Date(trade.entryTime), 'p')}
                    {trade.exitTime && ` • ${t('tradeDetail.exit')}: ${format(new Date(trade.exitTime), 'p')}`}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <AttachMoney sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {t('tradeDetail.entryAndExit')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.entryPrice')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.entryPrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.exitPrice')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : t('common.na')}
                      </Typography>
                    </Grid>
                    {isOptions && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.totalInvestment')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(trade.entryPrice * trade.positionSize * 100)}
                        </Typography>
                      </Grid>
                    )}
                    {trade.stopLoss !== undefined && trade.stopLoss !== null && trade.stopLoss > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.stopLoss')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(trade.stopLoss)}
                        </Typography>
                      </Grid>
                    )}
                    {trade.takeProfit !== undefined && trade.takeProfit !== null && trade.takeProfit > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.takeProfit')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(trade.takeProfit)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <ShowChart sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {t('tradeDetail.positionAndRisk')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.positionSize')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.positionSize} {isOptions ? t('tradeDetail.contracts') : t('tradeDetail.shares')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.riskAmount')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.riskAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.riskPercent')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPercent(trade.riskPercentage)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.commission')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.commission || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Grid>

            {/* Strategy & Analysis */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('tradeDetail.strategyDetails')}
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.setup')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.setup}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.strategy')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.strategy}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.timeframe')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.timeframe}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t('tradeDetail.confidence')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.confidence}/10
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <Psychology sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {t('tradeDetail.emotionalState')}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {trade.emotionBefore && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.before')}
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionBefore)}</Box>
                      </Box>
                    )}
                    {trade.emotionDuring && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.during')}
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionDuring)}</Box>
                      </Box>
                    )}
                    {trade.emotionAfter && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.after')}
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionAfter)}</Box>
                      </Box>
                    )}
                    {trade.exitEmotionState && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('tradeDetail.atExit')}
                        </Typography>
                        <Box>{getEmotionChip(trade.exitEmotionState)}</Box>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {trade.exitReason && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t('tradeDetail.exitReason')}
                      </Typography>
                      <Typography variant="body2">{trade.exitReason}</Typography>
                    </Box>
                  </>
                )}

                {trade.tags && trade.tags.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t('tradeDetail.tags')}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {trade.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            </Grid>

            {/* Notes Section */}
            {(trade.preTradeAnalysis || trade.postTradeNotes || trade.lessonsLearned ||
              trade.exitReasonNotes || trade.lessonsLearnedOnExit) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <Notes sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  {t('tradeDetail.traderNotes')}
                </Typography>
                <Stack spacing={2}>
                  {trade.preTradeAnalysis && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.preTradeAnalysis')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.preTradeAnalysis}
                      </Typography>
                    </Box>
                  )}
                  {trade.postTradeNotes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.postTradeNotes')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.postTradeNotes}
                      </Typography>
                    </Box>
                  )}
                  {trade.lessonsLearned && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.lessonsLearned')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.lessonsLearned}
                      </Typography>
                    </Box>
                  )}
                  {trade.exitReasonNotes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.exitReasonNotes')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.exitReasonNotes}
                      </Typography>
                    </Box>
                  )}
                  {trade.lessonsLearnedOnExit && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.lessonsLearnedOnExit')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.lessonsLearnedOnExit}
                      </Typography>
                    </Box>
                  )}
                  {trade.wouldRepeatTrade !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('tradeDetail.wouldRepeatTrade')}
                      </Typography>
                      <Chip
                        label={trade.wouldRepeatTrade ? t('common.yes') : t('common.no')}
                        size="small"
                        color={trade.wouldRepeatTrade ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('feedback.provideFeedbackFor', { symbol: trade.symbol })}</DialogTitle>
        <DialogContent>
          <FeedbackForm
            trade={trade}
            onSuccess={handleFeedbackSubmit}
            onCancel={() => setFeedbackDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
