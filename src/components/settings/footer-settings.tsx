import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  Paper,
  Alert,
} from '@mui/material'
import { Save, Copyright, Description } from '@mui/icons-material'
import { ISetting } from '@/types/setting'

interface FooterSettingsProps {
  settings: ISetting[]
  onChange: (settings: ISetting[]) => void
  onSave: (settings: ISetting[]) => void
}

export function FooterSettings({ settings, onChange, onSave }: FooterSettingsProps) {
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

  const getPreview = (value: string) => {
    return value.replace('{{year}}', new Date().getFullYear().toString())
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Footer Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the content that appears in the CRM footer.
      </Typography>

      <Grid container spacing={3}>
        {localSettings.map((setting) => {
          const isCopyright = setting.key === 'footer_copyright_text'
          const isDescription = setting.key === 'footer_company_description'
          
          return (
            <Grid item xs={12} key={setting.key}>
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
                        backgroundColor: 'action.hover',
                      }}
                    >
                      {isCopyright ? <Copyright /> : <Description />}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {setting.metadata.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {setting.metadata.description}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <TextField
                    fullWidth
                    value={setting.value || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={setting.metadata.placeholder}
                    multiline
                    rows={isDescription ? 3 : 2}
                  />

                  {isCopyright && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Preview:</strong> {getPreview(setting.value || '')}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Use <code>{"{{year}}"}</code> in the copyright text to automatically display the current year.
        </Typography>
      </Alert>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Footer Settings
        </Button>
      </Stack>
    </Box>
  )
}