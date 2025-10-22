'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { Flag, Info, Save } from '@mui/icons-material';

interface FeatureSettingsProps {
  settings: any[];
  onChange: (settings: any[]) => void;
  onSave: (settings: any[]) => void;
}

export function FeatureSettings({ settings, onChange, onSave }: FeatureSettingsProps) {
  const [localSettings, setLocalSettings] = useState<any[]>([]);

  // Initialize local state from props
  useEffect(() => {
    console.log('FeatureSettings received settings:', settings);

    // If settings is empty or doesn't have the referral code setting, create a default one
    if (!settings || settings.length === 0 || !settings.find(s => s.key === 'enable_referral_code')) {
      const defaultSetting = {
        key: 'enable_referral_code',
        value: false,
        type: 'boolean',
        category: 'features',
        metadata: {
          label: 'Enable Referral Code System',
          description: 'Show referral code input field in Master Course registration',
          visible: true,
          editable: true,
          order: 1,
        },
      };
      setLocalSettings([defaultSetting]);
    } else {
      setLocalSettings(settings);
    }
  }, [settings]);

  const getSetting = (key: string) => {
    const setting = localSettings.find((s) => s.key === key);
    console.log(`Getting setting ${key}:`, setting?.value);
    return setting?.value ?? false;
  };

  const handleToggle = (key: string) => {
    console.log(`Toggle clicked for ${key}`);
    const currentValue = getSetting(key);
    const newValue = !currentValue;
    console.log(`Changing from ${currentValue} to ${newValue}`);

    // Check if setting exists in array
    const settingExists = localSettings.find((s) => s.key === key);

    let updatedSettings;
    if (settingExists) {
      // Update existing setting
      updatedSettings = localSettings.map((setting) =>
        setting.key === key ? { ...setting, value: newValue } : setting
      );
    } else {
      // Add new setting if it doesn't exist
      updatedSettings = [
        ...localSettings,
        {
          key,
          value: newValue,
          type: 'boolean',
          category: 'features',
          metadata: {
            label: 'Enable Referral Code System',
            description: 'Show referral code input field in Master Course registration',
          },
        },
      ];
    }

    console.log('Updated settings:', updatedSettings);
    setLocalSettings(updatedSettings);
    onChange(updatedSettings);
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Flag color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Feature Flags
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
                },
              }}
            >
              Save Features
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Control feature availability across the platform. Changes take effect immediately after saving.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Referral Code Feature */}
          <Box
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: getSetting('enable_referral_code')
                ? 'rgba(22, 163, 74, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Referral Code System
                  </Typography>
                  <Chip
                    label={getSetting('enable_referral_code') ? 'Enabled' : 'Disabled'}
                    size="small"
                    color={getSetting('enable_referral_code') ? 'success' : 'default'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Show referral code input field in Master Course registration form.
                  Allows users to apply affiliate discount codes during checkout.
                </Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Impact:</strong> When enabled, users will see a referral code field in the
                    Master Course registration modal. The affiliate system remains functional regardless
                    of this setting.
                  </Typography>
                </Alert>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={getSetting('enable_referral_code')}
                    onChange={() => handleToggle('enable_referral_code')}
                    color="success"
                  />
                }
                label=""
                sx={{ ml: 2 }}
              />
            </Stack>
          </Box>

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="caption">
              <strong>Tip:</strong> Click &quot;Save Features&quot; above or &quot;Save All&quot; in the header to apply your changes.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
