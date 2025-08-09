'use client';

import { Box, Typography, Paper, Container } from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Campaign } from '@mui/icons-material';

export default function AnnouncementsPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Announcements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Broadcast important updates to your users
          </Typography>
        </Box>

        {/* Coming Soon Card */}
        <Container maxWidth="md">
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Campaign 
              sx={{ 
                fontSize: 80, 
                color: 'primary.main',
                mb: 3,
                opacity: 0.5
              }} 
            />
            <Typography variant="h3" gutterBottom fontWeight={600}>
              Coming Soon
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Announcement System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              Soon you'll be able to create and manage announcements to keep your users informed 
              about important updates, new features, and platform news.
            </Typography>
            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Features in Development:
              </Typography>
              <Typography variant="body2">
                • Create platform-wide announcements<br/>
                • Target specific user groups<br/>
                • Schedule announcements in advance<br/>
                • Rich text editor with media support<br/>
                • Email and in-app notifications<br/>
                • Analytics and read receipts
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AdminLayout>
  );
}