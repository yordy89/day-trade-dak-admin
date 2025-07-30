import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  Paper,
  InputAdornment,
} from '@mui/material'
import { Save, Facebook, Instagram, YouTube, Twitter, LinkedIn } from '@mui/icons-material'
import { ISetting } from '@/types/setting'

interface SocialMediaSettingsProps {
  settings: ISetting[]
  onChange: (settings: ISetting[]) => void
  onSave: (settings: ISetting[]) => void
}

const socialIcons: Record<string, any> = {
  facebook_url: Facebook,
  instagram_url: Instagram,
  youtube_url: YouTube,
  twitter_url: Twitter,
  linkedin_url: LinkedIn,
}

export function SocialMediaSettings({ settings, onChange, onSave }: SocialMediaSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ISetting[]>([])

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key: string, value: any) => {
    const updatedSettings = localSettings.map(setting =>
      setting.key === key ? { ...setting, value } : setting
    )
    setLocalSettings(updatedSettings)
    onChange(updatedSettings)
  }

  const handleSave = () => {
    onSave(localSettings)
  }

  const getIcon = (key: string) => {
    const Icon = socialIcons[key]
    return Icon ? <Icon /> : null
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Social Media Links
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your social media presence. These links will be displayed in the CRM footer and other locations.
      </Typography>

      <Grid container spacing={3}>
        {localSettings.map((setting) => {
          const Icon = socialIcons[setting.key]
          return (
            <Grid item xs={12} md={6} key={setting.key}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {Icon && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <Icon />
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    label={setting.metadata.label}
                    value={setting.value || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    helperText={setting.metadata.description}
                    placeholder={setting.metadata.placeholder || 'https://...'}
                    type="url"
                    InputProps={{
                      startAdornment: setting.key === 'tiktok_url' ? (
                        <InputAdornment position="start">
                          <Typography variant="caption" fontWeight={700}>TT</Typography>
                        </InputAdornment>
                      ) : undefined,
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Social Media Links
        </Button>
      </Stack>
    </Box>
  )
}