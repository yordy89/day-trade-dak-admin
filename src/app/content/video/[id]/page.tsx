'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  VideoLibrary,
  Timeline,
  Settings,
  CloudUpload,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { VideoPreviewPlayer } from '@/components/content/video-preview-player';
import { VideoWorkflowManager } from '@/components/content/video-workflow-manager';
import { VideoVersionHistory } from '@/components/content/video-version-history';
import { VideoUploadWorkflow } from '@/components/content/video-upload-workflow';
import axios from 'axios';
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
      id={`video-tabpanel-${index}`}
      aria-labelledby={`video-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  const [tabValue, setTabValue] = useState(0);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewVersionUpload, setShowNewVersionUpload] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(videoId);
  
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      setVideo(data);
    } catch (error) {
      enqueueSnackbar('Failed to load video', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId);
    setTabValue(0); // Switch to preview tab
  };

  const handleCreateVersion = () => {
    setShowNewVersionUpload(true);
    setTabValue(3); // Switch to new version tab
  };

  const handleVersionUploadComplete = () => {
    setShowNewVersionUpload(false);
    loadVideoData();
    setTabValue(2); // Switch to version history
    enqueueSnackbar('New version uploaded successfully', { variant: 'success' });
  };

  if (loading || !video) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading video details...</Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={3}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => router.push('/content')}
              sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              Content
            </Link>
            <Typography color="text.primary">{video.title}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/content')}
                variant="outlined"
                size="small"
              >
                Back to Library
              </Button>
              <Typography variant="h4" fontWeight={600}>
                {video.title}
              </Typography>
              <Chip
                label={`Version ${video.version}`}
                color="primary"
                size="small"
              />
              <Chip
                label={video.workflowStatus.replace('_', ' ')}
                color={
                  video.workflowStatus === 'approved' ? 'success' :
                  video.workflowStatus === 'rejected' ? 'error' :
                  'default'
                }
                size="small"
              />
            </Box>
            
            <Button
              startIcon={<CloudUpload />}
              onClick={handleCreateVersion}
              variant="contained"
            >
              Upload New Version
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ borderRadius: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Preview" icon={<VideoLibrary />} iconPosition="start" />
                  <Tab label="Workflow" icon={<Settings />} iconPosition="start" />
                  <Tab label="Version History" icon={<Timeline />} iconPosition="start" />
                  {showNewVersionUpload && <Tab label="New Version" />}
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <VideoPreviewPlayer
                  videoId={selectedVersion}
                  title={video.title}
                  isHLS={video.status === 'ready'}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <VideoWorkflowManager
                  videoId={videoId}
                  onStatusChange={() => loadVideoData()}
                  onVersionCreated={handleCreateVersion}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <VideoVersionHistory
                  videoId={videoId}
                  onVersionSelect={handleVersionSelect}
                  onCreateVersion={handleCreateVersion}
                />
              </TabPanel>

              {showNewVersionUpload && (
                <TabPanel value={tabValue} index={3}>
                  <VideoUploadWorkflow
                    parentVideoId={videoId}
                    onUploadComplete={handleVersionUploadComplete}
                  />
                </TabPanel>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* Video Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Video Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Content Type
                  </Typography>
                  <Typography variant="body1">
                    {video.contentType.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body1">
                    {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {video.metadata?.duration 
                      ? `${Math.floor(video.metadata.duration / 60)}:${(video.metadata.duration % 60).toString().padStart(2, '0')}`
                      : 'N/A'
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Processing Status
                  </Typography>
                  <Chip
                    label={video.status}
                    size="small"
                    color={
                      video.status === 'ready' ? 'success' :
                      video.status === 'error' ? 'error' :
                      video.status === 'processing' ? 'warning' :
                      'default'
                    }
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    HLS Processing
                  </Typography>
                  <Typography variant="body1">
                    {video.autoProcessHLS ? 'Automatic' : 'Manual'}
                  </Typography>
                </Box>

                {video.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {video.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Upload Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded By
                  </Typography>
                  <Typography variant="body1">
                    {video.uploadedBy}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Upload Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(video.uploadedAt).toLocaleString()}
                  </Typography>
                </Box>

                {video.assignedTo && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Typography variant="body1">
                      {video.assignedTo}
                    </Typography>
                  </Box>
                )}

                {video.isPublished && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Published
                    </Typography>
                    <Chip
                      label="LIVE"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Notification Settings */}
            {video.notificationSettings && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {video.notificationSettings.onUpload?.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        On Upload
                      </Typography>
                      {video.notificationSettings.onUpload.map((email: string) => (
                        <Chip
                          key={email}
                          label={email}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  {video.notificationSettings.onEdit?.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        On Edit
                      </Typography>
                      {video.notificationSettings.onEdit.map((email: string) => (
                        <Chip
                          key={email}
                          label={email}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  {video.notificationSettings.onApproval?.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        On Approval
                      </Typography>
                      {video.notificationSettings.onApproval.map((email: string) => (
                        <Chip
                          key={email}
                          label={email}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}