'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useSnackbar } from '@/hooks/use-snackbar';
import { UserModulePermissions } from '@/components/module-permissions/user-module-permissions';
import { ModuleAccessList } from '@/components/module-permissions/module-access-list';
import { EventModulePermissions } from '@/components/module-permissions/event-module-permissions';
import { BulkGrantDialog } from '@/components/module-permissions/bulk-grant-dialog';
import { Add, Group, Security, Event } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`module-permissions-tabpanel-${index}`}
      aria-labelledby={`module-permissions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ModulePermissionsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [bulkGrantOpen, setBulkGrantOpen] = useState(false);
  const { showError } = useSnackbar();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AdminLayout>
      <Box>
        {/* Page Header */}
        <Box mb={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Permisos de Módulos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona el acceso a los módulos del CRM para usuarios específicos
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setBulkGrantOpen(true)}
            >
              Asignar en Lote
            </Button>
          </Stack>
        </Box>

        {/* Main Content */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="module permissions tabs"
                sx={{ px: 3 }}
              >
                <Tab
                  icon={<Group />}
                  iconPosition="start"
                  label="Por Usuario"
                  id="module-permissions-tab-0"
                  aria-controls="module-permissions-tabpanel-0"
                />
                <Tab
                  icon={<Security />}
                  iconPosition="start"
                  label="Por Módulo"
                  id="module-permissions-tab-1"
                  aria-controls="module-permissions-tabpanel-1"
                />
                <Tab
                  icon={<Event />}
                  iconPosition="start"
                  label="Por Evento"
                  id="module-permissions-tab-2"
                  aria-controls="module-permissions-tabpanel-2"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <UserModulePermissions />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <ModuleAccessList />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <EventModulePermissions />
              </TabPanel>
            </Box>
          </CardContent>
        </Card>

        {/* Bulk Grant Dialog */}
        <BulkGrantDialog 
          open={bulkGrantOpen}
          onClose={() => setBulkGrantOpen(false)}
        />
      </Box>
    </AdminLayout>
  );
}