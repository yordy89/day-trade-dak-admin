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
import { Save, Email, Phone, LocationOn } from '@mui/icons-material'
import { ISetting } from '@/types/setting'

interface ContactSettingsProps {
  settings: ISetting[]
  onChange: (settings: ISetting[]) => void
  onSave: (settings: ISetting[]) => void
}

const contactIcons: Record<string, any> = {
  contact_email: Email,
  contact_phone: Phone,
  contact_address: LocationOn,
}

export function ContactSettings({ settings, onChange, onSave }: ContactSettingsProps) {
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Contact Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your contact information that will be displayed throughout the CRM.
      </Typography>

      <Grid container spacing={3}>
        {localSettings.map((setting) => {
          const Icon = contactIcons[setting.key]
          const isEmail = setting.key === 'contact_email'
          const isPhone = setting.key === 'contact_phone'
          
          return (
            <Grid item xs={12} md={6} key={setting.key}>
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {Icon && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          color: 'white',
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {setting.metadata.label}
                    </Typography>
                  </Stack>
                  
                  <TextField
                    fullWidth
                    value={setting.value || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    helperText={setting.metadata.description}
                    placeholder={setting.metadata.placeholder}
                    type={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
                    multiline={setting.key === 'contact_address'}
                    rows={setting.key === 'contact_address' ? 2 : 1}
                    InputProps={{
                      startAdornment: isPhone ? (
                        <InputAdornment position="start">+</InputAdornment>
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
          Save Contact Information
        </Button>
      </Stack>
    </Box>
  )
}