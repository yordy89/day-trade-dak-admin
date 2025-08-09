'use client';

import { Box, Typography, Paper, Container } from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ContentPaste } from '@mui/icons-material';

export default function ContentPage() {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your platform's content and resources
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
            <ContentPaste 
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
              Content Management System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              We're working on a powerful content management system that will allow you to create, 
              edit, and organize all your educational content in one place.
            </Typography>
            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Features in Development:
              </Typography>
              <Typography variant="body2">
                • Course content editor<br/>
                • Video library management<br/>
                • Document uploads and organization<br/>
                • Content categorization and tagging<br/>
                • SEO optimization tools
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AdminLayout>
  );
}