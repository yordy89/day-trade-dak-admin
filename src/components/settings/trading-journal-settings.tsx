'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { Save, DoneAll, Clear } from '@mui/icons-material'
import { useSnackbar } from '@/hooks/use-snackbar'
import { settingsService } from '@/services/settings.service'
import { useAuthStore } from '@/store/auth-store'

interface MarketOption {
  value: string
  label: string
  description: string
}

const MARKET_OPTIONS: MarketOption[] = [
  {
    value: 'stocks',
    label: 'Stocks',
    description: 'Allow trading stocks (AAPL, MSFT, TSLA, etc.)',
  },
  {
    value: 'forex',
    label: 'Forex',
    description: 'Allow forex pairs (EUR/USD, GBP/USD, etc.)',
  },
  {
    value: 'crypto',
    label: 'Cryptocurrency',
    description: 'Allow cryptocurrencies (BTC, ETH, SOL, etc.)',
  },
  {
    value: 'futures',
    label: 'Futures',
    description: 'Allow futures contracts (ES, NQ, etc.)',
  },
  {
    value: 'options',
    label: 'Options',
    description: 'Allow options trading',
  },
]

export function TradingJournalSettings() {
  const { showSuccess, showError } = useSnackbar()
  const { user } = useAuthStore()
  const [enabledMarkets, setEnabledMarkets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const value = await settingsService.getValue('trading_journal_enabled_markets')
      console.log('Loaded trading journal markets from API:', value)

      // Ensure value is an array
      if (Array.isArray(value)) {
        setEnabledMarkets(value)
      } else {
        console.warn('Invalid value format, using defaults:', value)
        setEnabledMarkets(['stocks', 'forex', 'crypto', 'futures', 'options'])
      }
    } catch (error) {
      console.error('Error loading trading journal settings:', error)
      // If setting doesn't exist, default to all markets
      setEnabledMarkets(['stocks', 'forex', 'crypto', 'futures', 'options'])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMarket = (market: string) => {
    setEnabledMarkets((prev) => {
      if (prev.includes(market)) {
        return prev.filter((m) => m !== market)
      } else {
        return [...prev, market]
      }
    })
    setHasChanges(true)
  }

  const handleSelectAll = () => {
    setEnabledMarkets(MARKET_OPTIONS.map((m) => m.value))
    setHasChanges(true)
  }

  const handleDeselectAll = () => {
    setEnabledMarkets([])
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('Saving trading journal markets:', enabledMarkets)
      console.log('User ID:', user?._id || user?.id)

      const result = await settingsService.updateSettingValue(
        'trading_journal_enabled_markets',
        enabledMarkets,
        user?._id || user?.id
      )

      console.log('Save result:', result)
      showSuccess('Trading journal settings saved successfully')
      setHasChanges(false)

      // Reload to verify
      await loadSettings()
    } catch (error: any) {
      console.error('Error saving trading journal settings:', error)
      console.error('Error response:', error.response?.data)
      showError(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading settings...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trading Journal Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure which markets are available for users to track in their trading journal
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Users will only see the enabled markets in their trading journal dropdown. Disabling
              a market won't delete existing trades.
            </Alert>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Available Markets
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<DoneAll />}
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Clear />}
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </Stack>
              </Stack>

              <FormGroup>
                {MARKET_OPTIONS.map((market) => (
                  <Box
                    key={market.value}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: enabledMarkets.includes(market.value)
                        ? 'action.selected'
                        : 'background.paper',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enabledMarkets.includes(market.value)}
                          onChange={() => handleToggleMarket(market.value)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {market.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {market.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </FormGroup>
            </Box>

            {enabledMarkets.length === 0 && (
              <Alert severity="warning">
                No markets are enabled. Users won't be able to create new trades.
              </Alert>
            )}

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={loadSettings}
                disabled={!hasChanges || saving}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
