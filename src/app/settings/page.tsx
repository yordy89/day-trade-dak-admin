'use client'

import { useState } from 'react'
import { Box, Typography, Paper, Tabs, Tab, Button, Stack } from '@mui/material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from 'react-i18next'
import { Settings, Save, Refresh, Upload, Download } from '@mui/icons-material'
import { useSnackbar } from '@/hooks/use-snackbar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'
import { SettingCategory } from '@/types/setting'
import { GeneralSettings } from '@/components/settings/general-settings'
import { SocialMediaSettings } from '@/components/settings/social-media-settings'
import { ContactSettings } from '@/components/settings/contact-settings'
import { FooterSettings } from '@/components/settings/footer-settings'
import { BrandingSettings } from '@/components/settings/branding-settings'
import { NotificationEmails } from '@/components/settings/notification-emails'
import { TradingSettings } from '@/components/settings/trading-settings'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  }
}

export default function SettingsPage() {
  const { t } = useTranslation('common')
  const { showSuccess, showError } = useSnackbar()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch settings by category
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['settings', activeTab],
    queryFn: () => {
      const categories = [
        SettingCategory.GENERAL,
        SettingCategory.SOCIAL_MEDIA,
        SettingCategory.CONTACT,
        SettingCategory.FOOTER,
        SettingCategory.BRANDING,
        SettingCategory.NOTIFICATIONS,
        SettingCategory.TRADING,
      ]
      return settingsService.getSettingsByCategory(categories[activeTab])
    },
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: settingsService.bulkUpdateSettings,
    onSuccess: () => {
      showSuccess('Settings saved successfully')
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to save settings')
    },
  })

  // Export settings mutation
  const exportMutation = useMutation({
    mutationFn: settingsService.exportSettings,
    onSuccess: (data) => {
      // Create a blob and download the settings
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showSuccess('Settings exported successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to export settings')
    },
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        setActiveTab(newValue)
        setHasChanges(false)
      }
    } else {
      setActiveTab(newValue)
    }
  }

  const handleSettingsChange = (updatedSettings: any[]) => {
    setHasChanges(true)
  }

  const handleSaveAll = async (settingsToSave: any[]): Promise<void> => {
    const bulkUpdate = {
      settings: settingsToSave.map(setting => ({
        key: setting.key,
        value: setting.value,
      })),
    }
    return bulkUpdateMutation.mutateAsync(bulkUpdate)
  }

  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      try {
        await settingsService.resetDefaults()
        showSuccess('Settings reset to defaults')
        refetch()
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to reset settings')
      }
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string)
            await settingsService.importSettings(data.settings || data)
            showSuccess('Settings imported successfully')
            refetch()
          } catch (error: any) {
            showError('Failed to import settings. Invalid file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const tabComponents = [
    <GeneralSettings
      key="general"
      settings={settings || []}
      onChange={handleSettingsChange}
      onSave={handleSaveAll}
    />,
    <SocialMediaSettings
      key="social"
      settings={settings || []}
      onChange={handleSettingsChange}
      onSave={handleSaveAll}
    />,
    <ContactSettings
      key="contact"
      settings={settings || []}
      onChange={handleSettingsChange}
      onSave={handleSaveAll}
    />,
    <FooterSettings
      key="footer"
      settings={settings || []}
      onChange={handleSettingsChange}
      onSave={handleSaveAll}
    />,
    <BrandingSettings
      key="branding"
      settings={settings || []}
      onChange={handleSettingsChange}
      onSave={handleSaveAll}
    />,
    <NotificationEmails key="notifications" />,
    <TradingSettings
      key="trading"
      settings={settings || []}
      onSave={handleSaveAll}
      loading={bulkUpdateMutation.isPending}
    />,
  ]

  return (
    <AdminLayout>
      <PageHeader
        title={t('settings.title', 'Settings')}
        subtitle={t('settings.subtitle', 'Manage your CRM settings and configurations')}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={handleImportSettings}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleResetDefaults}
            >
              Reset Defaults
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ mt: 3, p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Social Media" {...a11yProps(1)} />
            <Tab label="Contact" {...a11yProps(2)} />
            <Tab label="Footer" {...a11yProps(3)} />
            <Tab label="Branding" {...a11yProps(4)} />
            <Tab label="Notifications" {...a11yProps(5)} />
            <Tab label="Trading" {...a11yProps(6)} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabComponents.map((component, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : (
                component
              )}
            </TabPanel>
          ))}
        </Box>
      </Paper>
    </AdminLayout>
  )
}