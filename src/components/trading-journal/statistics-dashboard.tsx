'use client'

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShowChart,
  Timer,
  Timeline,
  CheckCircle,
  Cancel,
} from '@mui/icons-material'
import { TradeStatistics } from '@/types/trading-journal'

interface StatisticsDashboardProps {
  statistics: TradeStatistics
  loading?: boolean
}

export function StatisticsDashboard({ statistics, loading }: StatisticsDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number | null | undefined, decimals: number = 2) => {
    return (value || 0).toFixed(decimals)
  }

  const formatTime = (minutes: number | null | undefined) => {
    const mins = minutes || 0;
    if (mins < 60) return `${Math.round(mins)}m`
    const hours = Math.floor(mins / 60)
    const remainder = Math.round(mins % 60)
    return `${hours}h ${remainder}m`
  }

  const getWinRateColor = (rate: number | null | undefined) => {
    const r = rate || 0;
    if (r >= 60) return 'success.main'
    if (r >= 50) return 'warning.main'
    return 'error.main'
  }

  const getProfitFactorColor = (factor: number | null | undefined) => {
    const f = factor || 0;
    if (f >= 2) return 'success.main'
    if (f >= 1) return 'warning.main'
    return 'error.main'
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            Loading statistics...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={3}>
      {/* Overview Stats */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShowChart color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Trades
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700}>
                {statistics.totalTrades || 0}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<CheckCircle />}
                  label={`${statistics.winners || 0} Winners`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<Cancel />}
                  label={`${statistics.losers || 0} Losers`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUp color="success" />
                <Typography variant="body2" color="text.secondary">
                  Win Rate
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} color={getWinRateColor(statistics.winRate)}>
                {formatNumber(statistics.winRate, 1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={statistics.winRate}
                color={statistics.winRate >= 50 ? 'success' : 'error'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AttachMoney color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total P&L
                </Typography>
              </Stack>
              <Typography
                variant="h4"
                fontWeight={700}
                color={statistics.totalPnl >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(statistics.totalPnl)}
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Gross: {formatCurrency(statistics.totalGross)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fees: {formatCurrency(statistics.totalCommission)}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Timeline color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Profit Factor
                </Typography>
              </Stack>
              <Typography
                variant="h4"
                fontWeight={700}
                color={getProfitFactorColor(statistics.profitFactor)}
              >
                {formatNumber(statistics.profitFactor, 2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(statistics.profitFactor || 0) >= 1 ? 'Profitable' : 'Unprofitable'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Average Win
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    {formatCurrency(statistics.avgWin || 0)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Average Loss
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    {formatCurrency(Math.abs(statistics.avgLoss || 0))}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Largest Win
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    {formatCurrency(statistics.largestWin || 0)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Largest Loss
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    {formatCurrency(Math.abs(statistics.largestLoss || 0))}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Avg R-Multiple
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatNumber(statistics.avgRMultiple, 2)}R
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Expectancy
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color={(statistics.expectancy || 0) >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(statistics.expectancy || 0)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Avg Holding Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatTime(statistics.avgHoldingTime)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total Volume
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(statistics.totalVolume || 0)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Strategy Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance by Strategy
            </Typography>
            {statistics.strategyStats && statistics.strategyStats.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Strategy</TableCell>
                      <TableCell align="center">Trades</TableCell>
                      <TableCell align="center">Win Rate</TableCell>
                      <TableCell align="right">P&L</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.strategyStats.map((strategy, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {strategy._id || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={strategy.trades} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            color={
                              (strategy.winRate || 0) >= 50 ? 'success.main' : 'error.main'
                            }
                            fontWeight={600}
                          >
                            {formatNumber(strategy.winRate, 1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={(strategy.pnl || 0) >= 0 ? 'success.main' : 'error.main'}
                            fontWeight={600}
                          >
                            {formatCurrency(strategy.pnl || 0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No strategy data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Market Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance by Market
            </Typography>
            {statistics.marketStats && statistics.marketStats.length > 0 ? (
              <Grid container spacing={2}>
                {statistics.marketStats.map((market, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={600} textTransform="uppercase">
                          {market._id || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {market.trades} trades
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={(market.pnl || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(market.pnl || 0)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No market data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
