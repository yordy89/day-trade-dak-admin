'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  IconButton,
  Autocomplete,
  FormControl,
  FormLabel,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Save,
  Add,
  Delete,
  DragIndicator,
  TrendingUp,
  TrendingDown,
  Info,
} from '@mui/icons-material'
import { useSnackbar } from '@/hooks/use-snackbar'
import { useTranslation } from 'react-i18next'

interface TradingSettingsProps {
  settings: any[]
  onSave: (settings: any[]) => Promise<void>
  loading?: boolean
}

// Popular stocks and ETFs
const AVAILABLE_SYMBOLS = [
  // Major Indices ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', type: 'ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF' },
  // Tech Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Stock' },
  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Stock' },
  { symbol: 'BAC', name: 'Bank of America Corp', type: 'Stock' },
  { symbol: 'GS', name: 'Goldman Sachs', type: 'Stock' },
  { symbol: 'MS', name: 'Morgan Stanley', type: 'Stock' },
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'Stock' },
  { symbol: 'UNH', name: 'UnitedHealth Group', type: 'Stock' },
  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'Stock' },
  { symbol: 'DIS', name: 'Walt Disney Co', type: 'Stock' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'Stock' },
  { symbol: 'MCD', name: 'McDonalds Corp', type: 'Stock' },
  { symbol: 'SBUX', name: 'Starbucks Corp', type: 'Stock' },
]

export function TradingSettings({ settings, onSave, loading }: TradingSettingsProps) {
  const { t } = useTranslation('common')
  const { showSuccess, showError } = useSnackbar()
  
  const [featuredStocks, setFeaturedStocks] = useState<string[]>([])
  const [rotationInterval, setRotationInterval] = useState(30)
  const [enableRotation, setEnableRotation] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(5)

  useEffect(() => {
    // Load current settings
    const featuredSetting = settings.find(s => s.key === 'featured_stocks')
    if (featuredSetting && featuredSetting.value) {
      const value = typeof featuredSetting.value === 'string' 
        ? JSON.parse(featuredSetting.value) 
        : featuredSetting.value
      
      setFeaturedStocks(value.symbols || [])
      setRotationInterval(value.rotationInterval || 30)
      setEnableRotation(value.enableRotation || false)
      setDisplayLimit(value.displayLimit || 5)
    } else {
      // Default featured stocks
      setFeaturedStocks(['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA'])
    }
  }, [settings])

  const handleSave = async () => {
    try {
      const updatedSettings = [
        {
          key: 'featured_stocks',
          value: JSON.stringify({
            symbols: featuredStocks,
            rotationInterval,
            enableRotation,
            displayLimit,
          }),
        },
      ]

      await onSave(updatedSettings)
      showSuccess('Trading settings saved successfully')
    } catch (error) {
      console.error('Error saving trading settings:', error)
      showError('Failed to save trading settings')
    }
  }

  const handleAddStock = (newValue: any) => {
    if (newValue && !featuredStocks.includes(newValue.symbol)) {
      if (featuredStocks.length >= 10) {
        showError('Maximum 10 stocks allowed')
        return
      }
      setFeaturedStocks([...featuredStocks, newValue.symbol])
    }
  }

  const handleRemoveStock = (symbol: string) => {
    setFeaturedStocks(featuredStocks.filter(s => s !== symbol))
  }

  const moveStock = (index: number, direction: 'up' | 'down') => {
    const newStocks = [...featuredStocks]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newStocks.length) {
      [newStocks[index], newStocks[newIndex]] = [newStocks[newIndex], newStocks[index]]
      setFeaturedStocks(newStocks)
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Featured Stocks Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Featured Stocks & ETFs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select up to 10 stocks or ETFs to display on the homepage. These will rotate if rotation is enabled.
            </Typography>

            <Autocomplete
              options={AVAILABLE_SYMBOLS.filter(s => !featuredStocks.includes(s.symbol))}
              getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      {option.symbol}
                      <Chip 
                        label={option.type} 
                        size="small" 
                        sx={{ ml: 1 }}
                        color={option.type === 'ETF' ? 'primary' : 'default'}
                      />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              onChange={(_, newValue) => handleAddStock(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Stock or ETF"
                  placeholder="Search by symbol or name..."
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Selected Stocks Table */}
            {featuredStocks.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}>Order</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {featuredStocks.map((symbol, index) => {
                      const stockInfo = AVAILABLE_SYMBOLS.find(s => s.symbol === symbol)
                      return (
                        <TableRow key={symbol}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                disabled={index === 0}
                                onClick={() => moveStock(index, 'up')}
                              >
                                <TrendingUp fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={index === featuredStocks.length - 1}
                                onClick={() => moveStock(index, 'down')}
                              >
                                <TrendingDown fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {symbol}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {stockInfo?.name || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={stockInfo?.type || 'Stock'}
                              size="small"
                              color={stockInfo?.type === 'ETF' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStock(symbol)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {featuredStocks.length === 0 && (
              <Alert severity="info">
                No stocks selected. Add stocks to display on the homepage.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Display Settings
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Display Limit"
                  value={displayLimit}
                  onChange={(e) => setDisplayLimit(Number(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Number of stocks to display at once (1-10)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableRotation}
                      onChange={(e) => setEnableRotation(e.target.checked)}
                    />
                  }
                  label="Enable Rotation"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Automatically rotate through all selected stocks
                </Typography>
              </Grid>

              {enableRotation && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rotation Interval (seconds)"
                    value={rotationInterval}
                    onChange={(e) => setRotationInterval(Number(e.target.value))}
                    inputProps={{ min: 10, max: 300 }}
                    helperText="How often to rotate stocks (10-300 seconds)"
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                The homepage will display {Math.min(displayLimit, featuredStocks.length)} stocks at a time.
                {enableRotation && featuredStocks.length > displayLimit && (
                  <> Stocks will rotate every {rotationInterval} seconds.</>
                )}
              </Typography>
            </Alert>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Currently displaying:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {featuredStocks.slice(0, displayLimit).map(symbol => (
                  <Chip
                    key={symbol}
                    label={symbol}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading || featuredStocks.length === 0}
            >
              Save Trading Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}