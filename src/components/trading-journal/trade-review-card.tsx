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
import { Trade } from '@/types/trading-journal'
import { format } from 'date-fns'
import { FeedbackForm } from './feedback-form'

interface TradeReviewCardProps {
  trade: Trade
  onFeedbackCreated?: () => void
}

export function TradeReviewCard({ trade, onFeedbackCreated }: TradeReviewCardProps) {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)

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

  const getDirectionColor = (direction: string) => {
    return direction === 'long' ? 'success' : 'error'
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
                label={trade.direction.toUpperCase()}
                size="small"
                color={getDirectionColor(trade.direction)}
              />
              <Chip label={trade.market.toUpperCase()} size="small" variant="outlined" />
              {trade.isOpen && <Chip label="OPEN" size="small" color="warning" />}
              {trade.isReviewed && (
                <Chip
                  icon={<CheckCircle />}
                  label="Reviewed"
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
              Provide Feedback
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
                    Position is currently OPEN
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    P&L will be calculated when the position is closed
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
                        Net P&L
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={getPnlColor(trade.netPnl)}>
                        {formatCurrency(trade.netPnl || 0)}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        R-Multiple
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {(trade.rMultiple || 0).toFixed(2)}R
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Result
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {trade.isWinner ? 'Winner' : 'Loser'}
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
                    Trade Date & Time
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(trade.tradeDate), 'PPP')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entry: {format(new Date(trade.entryTime), 'p')}
                    {trade.exitTime && ` • Exit: ${format(new Date(trade.exitTime), 'p')}`}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <AttachMoney sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Entry & Exit
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Entry Price
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.entryPrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Exit Price
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Stop Loss
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.stopLoss || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Take Profit
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.takeProfit ? formatCurrency(trade.takeProfit) : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <ShowChart sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Position & Risk
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Position Size
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.positionSize} shares
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Risk Amount
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(trade.riskAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Risk %
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPercent(trade.riskPercentage)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Commission
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
                    Strategy Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Setup
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.setup}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Strategy
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.strategy}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Timeframe
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {trade.timeframe}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Confidence
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
                    Emotional State
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {trade.emotionBefore && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Before
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionBefore)}</Box>
                      </Box>
                    )}
                    {trade.emotionDuring && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          During
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionDuring)}</Box>
                      </Box>
                    )}
                    {trade.emotionAfter && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          After
                        </Typography>
                        <Box>{getEmotionChip(trade.emotionAfter)}</Box>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {trade.exitReason && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Exit Reason
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
                        Tags
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
            {(trade.preTradeAnalysis || trade.postTradeNotes || trade.lessonsLearned) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <Notes sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  Trader Notes
                </Typography>
                <Stack spacing={2}>
                  {trade.preTradeAnalysis && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Pre-Trade Analysis
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.preTradeAnalysis}
                      </Typography>
                    </Box>
                  )}
                  {trade.postTradeNotes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Post-Trade Notes
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.postTradeNotes}
                      </Typography>
                    </Box>
                  )}
                  {trade.lessonsLearned && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Lessons Learned
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {trade.lessonsLearned}
                      </Typography>
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
        <DialogTitle>Provide Feedback for {trade.symbol}</DialogTitle>
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
