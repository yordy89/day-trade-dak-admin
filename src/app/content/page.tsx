'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Grid } from '@mui/material';
import { AdminLayout } from '@/components/layout/admin-layout';
import { VideoUploadWorkflow } from '@/components/content/video-upload-workflow';
import { VideoList } from '@/components/content/video-list';
import { ContentStats } from '@/components/content/content-stats';
import { io, Socket } from 'socket.io-client';
import { useSnackbar } from 'notistack';

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
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContentPage() {
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('video-upload-completed', (data) => {
      enqueueSnackbar(`Video "${data.fileName}" uploaded successfully`, {
        variant: 'success',
      });
      setRefreshTrigger(prev => prev + 1);
    });

    newSocket.on('video-processing-started', (data) => {
      enqueueSnackbar(`Processing started for "${data.fileName}"`, {
        variant: 'info',
      });
    });

    newSocket.on('video-processing-completed', (data) => {
      enqueueSnackbar(`Video "${data.fileName}" is ready!`, {
        variant: 'success',
      });
      setRefreshTrigger(prev => prev + 1);
    });

    newSocket.on('video-processing-failed', (data) => {
      enqueueSnackbar(`Processing failed for "${data.fileName}": ${data.error}`, {
        variant: 'error',
      });
      setRefreshTrigger(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [enqueueSnackbar]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setTabValue(1); // Switch to video list tab
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload and manage video content for your courses
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Box mb={4}>
          <ContentStats refreshTrigger={refreshTrigger} />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Upload Video" />
            <Tab label="Video Library" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <VideoUploadWorkflow onUploadComplete={handleUploadComplete} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Upload Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Maximum file size: 10GB
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Supported formats: MP4, MOV, AVI, MKV, WebM
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Videos will be automatically converted to HLS format for optimal streaming
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Processing time depends on file size and may take several minutes
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • You'll receive real-time notifications about the upload and processing status
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <VideoList refreshTrigger={refreshTrigger} />
        </TabPanel>
      </Box>
    </AdminLayout>
  );
}