import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  Paper,
  Avatar,
  Alert,
} from '@mui/material'
import { Save, Business, Image, DarkMode, LightMode } from '@mui/icons-material'
import { ISetting } from '@/types/setting'

interface BrandingSettingsProps {
  settings: ISetting[]
  onChange: (settings: ISetting[]) => void
  onSave: (settings: ISetting[]) => void
}

export function BrandingSettings({ settings, onChange, onSave }: BrandingSettingsProps) {
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

  const getLogoUrl = (url: string) => {
    // If it's a relative path, prepend the CRM URL
    if (url && url.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:3000'}${url}`
    }
    return url
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Branding Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your company branding including logos and brand name.
      </Typography>

      <Grid container spacing={3}>
        {localSettings.map((setting) => {
          const isCompanyName = setting.key === 'company_name'
          const isLightLogo = setting.key === 'logo_light_url'
          const isDarkLogo = setting.key === 'logo_dark_url'
          const isLogo = isLightLogo || isDarkLogo
          
          return (
            <Grid item xs={12} md={isLogo ? 6 : 12} key={setting.key}>
              <Paper sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: isLogo 
                          ? (isDarkLogo ? 'grey.900' : 'grey.100')
                          : 'primary.main',
                        color: isLogo 
                          ? (isDarkLogo ? 'white' : 'text.primary')
                          : 'white',
                      }}
                    >
                      {isCompanyName ? <Business /> : isLogo ? <Image /> : null}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {setting.metadata.label}
                        </Typography>
                        {isLightLogo && <LightMode fontSize="small" />}
                        {isDarkLogo && <DarkMode fontSize="small" />}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {setting.metadata.description}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  {isLogo && setting.value && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        p: 2,
                        backgroundColor: isDarkLogo ? 'grey.900' : 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      <img
                        src={getLogoUrl(setting.value)}
                        alt={setting.metadata.label}
                        style={{
                          maxHeight: 60,
                          objectFit: 'contain',
                        }}
                        onError={(e: any) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </Box>
                  )}
                  
                  <TextField
                    fullWidth
                    value={setting.value || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={setting.metadata.placeholder}
                    helperText={isLogo ? 'Enter a URL or path to the logo image' : undefined}
                  />
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Logo Guidelines:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Use PNG format with transparent background for best results</li>
            <li>Recommended size: 200x60 pixels or similar aspect ratio</li>
            <li>Light logo: For dark backgrounds</li>
            <li>Dark logo: For light backgrounds</li>
          </ul>
        </Typography>
      </Alert>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Branding Settings
        </Button>
      </Stack>
    </Box>
  )
}