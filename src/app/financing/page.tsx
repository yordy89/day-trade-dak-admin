'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FinancingPlans } from '@/components/financing/financing-plans'
import { FinancingUsers } from '@/components/financing/financing-users'
import { InstallmentPlans } from '@/components/financing/installment-plans'
import { FinancingAnalytics } from '@/components/financing/financing-analytics'
import { 
  AccountBalance, 
  People, 
  Receipt, 
  Analytics 
} from '@mui/icons-material'

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
      id={`financing-tabpanel-${index}`}
      aria-labelledby={`financing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function FinancingPage() {
  const { t } = useTranslation('financing')
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          {t('title', 'Local Financing Management')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('description', 'Manage financing plans and user approvals for local payment options')}
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<AccountBalance />} 
            label={t('tabs.plans', 'Payment Plans')} 
            iconPosition="start"
          />
          <Tab 
            icon={<People />} 
            label={t('tabs.users', 'User Approvals')} 
            iconPosition="start"
          />
          <Tab 
            icon={<Receipt />} 
            label={t('tabs.installments', 'Active Plans')} 
            iconPosition="start"
          />
          <Tab 
            icon={<Analytics />} 
            label={t('tabs.analytics', 'Analytics')} 
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <FinancingPlans />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <FinancingUsers />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <InstallmentPlans />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <FinancingAnalytics />
          </TabPanel>
        </Box>
      </Paper>
    </DashboardLayout>
  )
}