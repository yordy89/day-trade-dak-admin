'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { api } from '@/lib/api-client';

interface SubscriptionPlan {
  _id?: string;
  planId: string;
  displayName: string;
  displayNameES?: string;
  description: string;
  type: string;
  amount?: number;
  currency?: string;
  pricing?: {
    baseAmount: number;
    currency: string;
    interval: string;
    intervalCount: number;
  };
  isActive: boolean;
}

interface SubscriptionSelectorProps {
  selectedSubscriptions: string[];
  onSubscriptionsChange: (subscriptions: string[]) => void;
  restrictedToSubscriptions?: boolean;
  onRestrictedChange?: (restricted: boolean) => void;
  error?: string;
  helperText?: string;
}

export function SubscriptionSelector({
  selectedSubscriptions,
  onSubscriptionsChange,
  restrictedToSubscriptions = false,
  onRestrictedChange,
  error,
  helperText,
}: SubscriptionSelectorProps) {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      console.log('Fetching subscription plans...');
      setFetchError(null);
      const response = await api.get('/subscriptions/plans');
      console.log('Subscription plans response:', response.data);
      setSubscriptionPlans(response.data);
    } catch (error: any) {
      console.error('Failed to fetch subscription plans:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setFetchError(error.response?.data?.message || error.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onSubscriptionsChange(typeof value === 'string' ? value.split(',') : value);
  };

  const formatPlanDisplay = (plan: SubscriptionPlan) => {
    // Handle both old and new API response formats
    let amount: string;
    let currency: string;
    
    if (plan.pricing) {
      // New format
      amount = plan.pricing.baseAmount.toFixed(2);
      currency = plan.pricing.currency;
    } else if (plan.amount !== undefined && plan.currency) {
      // Old format - keeping division for backward compatibility
      amount = (plan.amount / 100).toFixed(2);
      currency = plan.currency;
    } else {
      // Fallback
      return plan.displayName;
    }
    
    return `${plan.displayName} - $${amount} ${currency.toUpperCase()}`;
  };

  return (
    <Box>
      {onRestrictedChange && (
        <FormControlLabel
          control={
            <Switch
              checked={restrictedToSubscriptions}
              onChange={(e) => onRestrictedChange(e.target.checked)}
              color="primary"
            />
          }
          label="Restrict to specific subscriptions"
          sx={{ mb: 2 }}
        />
      )}

      {restrictedToSubscriptions && (
        <>
          <FormControl fullWidth error={!!error}>
            <InputLabel>Required Subscriptions</InputLabel>
            <Select
              multiple
              value={selectedSubscriptions}
              onChange={handleChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const plan = subscriptionPlans.find(p => p.planId === value);
                    return (
                      <Chip 
                        key={value} 
                        label={plan?.displayName || value} 
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading subscription plans...
                </MenuItem>
              ) : fetchError ? (
                <MenuItem disabled>
                  <Box sx={{ width: '100%', textAlign: 'center', py: 1 }}>
                    <Box sx={{ color: 'error.main', mb: 1 }}>Error: {fetchError}</Box>
                    <Button size="small" onClick={fetchSubscriptionPlans}>
                      Retry
                    </Button>
                  </Box>
                </MenuItem>
              ) : subscriptionPlans.length === 0 ? (
                <MenuItem disabled>No subscription plans available</MenuItem>
              ) : (
                subscriptionPlans.map((plan) => (
                  <MenuItem key={plan.planId} value={plan.planId}>
                    <Checkbox checked={selectedSubscriptions.indexOf(plan.planId) > -1} />
                    <ListItemText 
                      primary={formatPlanDisplay(plan)}
                      secondary={plan.description}
                    />
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {error || helperText || 'Select the subscription plans that users must have to access this meeting'}
            </FormHelperText>
          </FormControl>

          {selectedSubscriptions.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No subscriptions selected. Only admins and users with allowLiveMeetingAccess flag will be able to join.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}