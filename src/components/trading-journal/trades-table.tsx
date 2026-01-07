'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Paper,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  RateReview,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  FilterList,
  Visibility,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { Trade, MarketType } from '@/types/trading-journal'
import { format } from 'date-fns'
import { FeedbackForm } from './feedback-form'

interface TradesTableProps {
  trades: Trade[]
  totalTrades: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onFeedbackCreated?: () => void
  loading?: boolean
}

interface ExpandedRowProps {
  trade: Trade
  onProvideFeedback: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}

function ExpandedRow({ trade, onProvideFeedback, t }: ExpandedRowProps) {
  const isOptions = trade.market === MarketType.OPTIONS

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
      <Grid container spacing={3}>
        {/* Trade Details */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t('trades.tradeDetails')}
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.entryPrice')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(trade.entryPrice)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.exitPrice')}{isOptions ? ` ${t('tradeDetail.perShare')}` : ''}</Typography>
              <Typography variant="body2" fontWeight={600}>{trade.exitPrice ? formatCurrency(trade.exitPrice) : t('trades.open')}</Typography>
            </Box>
            {isOptions && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.totalInvestment')}</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(trade.entryPrice * trade.positionSize * 100)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.positionSize')}</Typography>
              <Typography variant="body2" fontWeight={600}>{trade.positionSize} {isOptions ? t('tradeDetail.contracts') : t('tradeDetail.shares')}</Typography>
            </Box>
            {trade.strikePrice && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.strikePrice')}</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(trade.strikePrice)}</Typography>
              </Box>
            )}
            {trade.expirationDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.expiration')}</Typography>
                <Typography variant="body2" fontWeight={600}>{format(new Date(trade.expirationDate), 'MMM dd, yyyy')}</Typography>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Risk & Performance */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t('trades.riskPerformance')}
          </Typography>
          <Stack spacing={1}>
            {trade.riskAmount !== undefined && trade.riskAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.riskAmount')}</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(trade.riskAmount)}</Typography>
              </Box>
            )}
            {trade.riskPercentage !== undefined && trade.riskPercentage > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.riskPercent')}</Typography>
                <Typography variant="body2" fontWeight={600}>{trade.riskPercentage.toFixed(2)}%</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.rMultiple')}</Typography>
              <Typography variant="body2" fontWeight={600}>{(trade.rMultiple || 0).toFixed(2)}R</Typography>
            </Box>
            {trade.confidence !== undefined && trade.confidence > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('tradeDetail.confidence')}</Typography>
                <Typography variant="body2" fontWeight={600}>{trade.confidence}/10</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.commission')}</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(trade.commission || 0)}</Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Emotions */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t('tradeDetail.emotionalState')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {trade.emotionBefore && (
              <Chip label={`${t('tradeDetail.before')}: ${trade.emotionBefore}`} size="small" variant="outlined" />
            )}
            {trade.exitEmotionState && (
              <Chip label={`${t('tradeDetail.atExit')}: ${trade.exitEmotionState}`} size="small" variant="outlined" />
            )}
          </Stack>
          {trade.wouldRepeatTrade !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">{t('tradeDetail.wouldRepeat')}:</Typography>
              <Chip
                label={trade.wouldRepeatTrade ? t('common.yes') : t('common.no')}
                size="small"
                color={trade.wouldRepeatTrade ? 'success' : 'error'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
        </Grid>

        {/* Notes */}
        {(trade.preTradeAnalysis || trade.exitReasonNotes || trade.lessonsLearnedOnExit) && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('tradeDetail.traderNotes')}
            </Typography>
            <Stack spacing={2}>
              {trade.preTradeAnalysis && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('tradeDetail.preTradeAnalysis')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {trade.preTradeAnalysis}
                  </Typography>
                </Paper>
              )}
              {trade.exitReasonNotes && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('tradeDetail.exitReason')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {trade.exitReasonNotes}
                  </Typography>
                </Paper>
              )}
              {trade.lessonsLearnedOnExit && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('tradeDetail.lessonsLearned')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {trade.lessonsLearnedOnExit}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>
        )}

        {/* Action */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RateReview />}
              onClick={onProvideFeedback}
              disabled={trade.isReviewed}
            >
              {trade.isReviewed ? t('trades.alreadyReviewed') : t('trades.provideFeedback')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export function TradesTable({
  trades,
  totalTrades,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onFeedbackCreated,
  loading,
}: TradesTableProps) {
  const { t } = useTranslation('trading-journal')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [feedbackTrade, setFeedbackTrade] = useState<Trade | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterResult, setFilterResult] = useState<string>('all')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getTypeLabel = (trade: Trade) => {
    if (trade.market === MarketType.OPTIONS && trade.optionType) {
      return trade.optionType.toUpperCase()
    }
    return trade.direction.toUpperCase()
  }

  const getTypeColor = (trade: Trade): 'success' | 'error' => {
    if (trade.market === MarketType.OPTIONS && trade.optionType) {
      return trade.optionType === 'call' ? 'success' : 'error'
    }
    return trade.direction === 'long' ? 'success' : 'error'
  }

  const handleExpandClick = (tradeId: string) => {
    setExpandedRow(expandedRow === tradeId ? null : tradeId)
  }

  const handleFeedbackSuccess = () => {
    setFeedbackTrade(null)
    onFeedbackCreated?.()
  }

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'reviewed' && !trade.isReviewed) return false
      if (filterStatus === 'pending' && trade.isReviewed) return false
    }
    if (filterResult !== 'all') {
      if (filterResult === 'winners' && !trade.isWinner) return false
      if (filterResult === 'losers' && trade.isWinner) return false
    }
    return true
  })

  return (
    <>
      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FilterList color="action" />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('trades.reviewStatus')}</InputLabel>
          <Select
            value={filterStatus}
            label={t('trades.reviewStatus')}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">{t('trades.all')}</MenuItem>
            <MenuItem value="pending">{t('trades.needsReview')}</MenuItem>
            <MenuItem value="reviewed">{t('trades.reviewed')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('trades.result')}</InputLabel>
          <Select
            value={filterResult}
            label={t('trades.result')}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <MenuItem value="all">{t('trades.all')}</MenuItem>
            <MenuItem value="winners">{t('trades.winners')}</MenuItem>
            <MenuItem value="losers">{t('trades.losers')}</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {t('trades.showingTrades', { showing: filteredTrades.length, total: totalTrades })}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell width={50} />
              <TableCell>{t('trades.date')}</TableCell>
              <TableCell>{t('trades.symbol')}</TableCell>
              <TableCell>{t('trades.type')}</TableCell>
              <TableCell>{t('trades.market')}</TableCell>
              <TableCell align="right">{t('trades.entry')}</TableCell>
              <TableCell align="right">{t('trades.exit')}</TableCell>
              <TableCell align="right">{t('trades.pnl')}</TableCell>
              <TableCell align="center">{t('trades.status')}</TableCell>
              <TableCell align="center">{t('trades.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('trades.noTrades')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTrades.map((trade) => (
                <React.Fragment key={trade._id}>
                  <TableRow
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer',
                      bgcolor: expandedRow === trade._id ? 'action.selected' : 'inherit',
                    }}
                    onClick={() => handleExpandClick(trade._id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedRow === trade._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {format(new Date(trade.tradeDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(trade.entryTime), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {trade.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(trade)}
                        size="small"
                        color={getTypeColor(trade)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trade.market.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(trade.entryPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {trade.isOpen ? (
                        <Chip label={t('trades.open')} size="small" color="warning" />
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={(trade.netPnl || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(trade.netPnl || 0)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {trade.isReviewed ? (
                        <Tooltip title={t('trades.reviewed')}>
                          <CheckCircle color="success" />
                        </Tooltip>
                      ) : (
                        <Chip
                          label={t('trades.needsReview')}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={t('trades.provideFeedback')}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setFeedbackTrade(trade)}
                            disabled={trade.isReviewed}
                          >
                            <RateReview />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0, borderBottom: expandedRow === trade._id ? 1 : 0, borderColor: 'divider' }}>
                      <Collapse in={expandedRow === trade._id} timeout="auto" unmountOnExit>
                        <ExpandedRow
                          trade={trade}
                          onProvideFeedback={() => setFeedbackTrade(trade)}
                          t={t}
                        />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalTrades}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackTrade}
        onClose={() => setFeedbackTrade(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        {feedbackTrade && (
          <DialogContent sx={{ p: 3 }}>
            <FeedbackForm
              trade={feedbackTrade}
              onSuccess={handleFeedbackSuccess}
              onCancel={() => setFeedbackTrade(null)}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
