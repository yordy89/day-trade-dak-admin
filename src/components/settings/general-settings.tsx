import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { ISetting, SettingType } from '@/types/setting'

interface GeneralSettingsProps {
  settings: ISetting[]
  onChange: (settings: ISetting[]) => void
  onSave: (settings: ISetting[]) => void
}

export function GeneralSettings({ settings, onChange, onSave }: GeneralSettingsProps) {
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

  const renderSettingInput = (setting: ISetting) => {
    switch (setting.type) {
      case SettingType.BOOLEAN:
        return (
          <FormControlLabel
            control={
              <Switch
                checked={setting.value === true || setting.value === 'true'}
                onChange={(e) => handleChange(setting.key, e.target.checked)}
              />
            }
            label={setting.metadata.label}
          />
        )
      case SettingType.NUMBER:
        return (
          <TextField
            fullWidth
            label={setting.metadata.label}
            type="number"
            value={setting.value || ''}
            onChange={(e) => handleChange(setting.key, Number(e.target.value))}
            helperText={setting.metadata.description}
            placeholder={setting.metadata.placeholder}
            InputProps={{
              inputProps: {
                min: setting.metadata.validation?.min,
                max: setting.metadata.validation?.max,
              },
            }}
          />
        )
      default:
        return (
          <TextField
            fullWidth
            label={setting.metadata.label}
            value={setting.value || ''}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            helperText={setting.metadata.description}
            placeholder={setting.metadata.placeholder}
            required={setting.metadata.validation?.required}
            multiline={setting.type === SettingType.JSON}
            rows={setting.type === SettingType.JSON ? 4 : 1}
          />
        )
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        General Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure general application settings
      </Typography>

      <Grid container spacing={3}>
        {localSettings.map((setting) => (
          <Grid item xs={12} md={6} key={setting.key}>
            {renderSettingInput(setting)}
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Stack>
    </Box>
  )
}