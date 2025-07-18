'use client';

import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { AuthGuard } from '@/components/auth/auth-guard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar */}
        <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { md: `calc(100% - 280px)` },
            ml: { md: '280px' },
          }}
        >
          {/* Topbar */}
          <Topbar onMenuClick={handleDrawerToggle} />
          
          {/* Page Content */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              maxWidth: 1440,
              width: '100%',
              mx: 'auto',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}