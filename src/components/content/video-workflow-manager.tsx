'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  CheckCircle,
  Cancel,
  Edit,
  Send,
  AssignmentInd,
  PlayCircleFilled,
  Upload,
  Download,
  Visibility,
  History,
  Email,
  Settings,
  Build,
  PublishedWithChanges,
  Block,
  Schedule,
  CloudUpload,
  RateReview,
  ThumbUp,
  ThumbDown,
  VideoLibrary,
  NotificationsActive,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface VideoWorkflowManagerProps {
  videoId: string;
  onStatusChange?: (status: string) => void;
  onVersionCreated?: () => void;
}

interface VideoData {
  _id: string;
  title: string;
  workflowStatus: string;
  status: string;
  version: number;
  versionType: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  editNotes?: string;
  reviewNotes?: string;
  autoProcessHLS: boolean;
  hlsProcessingRequested?: boolean;
  notificationSettings?: {
    onUpload: string[];
    onEdit: string[];
    onApproval: string[];
    onPublish: string[];
  };
  notificationHistory?: Array<{
    type: string;
    sentTo: string[];
    sentAt: string;
    status: string;
  }>;
}

const workflowStatusColors: Record<string, any> = {
  draft: 'default',
  pending_edit: 'warning',
  pending_review: 'info',
  approved: 'success',
  rejected: 'error',
  published: 'success',
};

const workflowStatusIcons: Record<string, any> = {
  draft: <Edit />,
  pending_edit: <AssignmentInd />,
  pending_review: <RateReview />,
  approved: <ThumbUp />,
  rejected: <ThumbDown />,
  published: <PublishedWithChanges />,
};

export const VideoWorkflowManager = ({
  videoId,
  onStatusChange,
  onVersionCreated,
}: VideoWorkflowManagerProps) => {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [processingHLS, setProcessingHLS] = useState(false);
  
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
      enqueueSnackbar('Failed to load video data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStatus = async (status: string, notes?: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/status`,
        {
          status,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar(`Workflow status updated to ${status}`, { variant: 'success' });
      loadVideoData();
      onStatusChange?.(status);
    } catch (error) {
      enqueueSnackbar('Failed to update workflow status', { variant: 'error' });
    }
  };

  const assignVideo = async () => {
    if (!assignEmail) {
      enqueueSnackbar('Please enter an email', { variant: 'error' });
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/assign`,
        {
          assigneeEmail: assignEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar(`Video assigned to ${assignEmail}`, { variant: 'success' });
      setAssignDialog(false);
      setAssignEmail('');
      loadVideoData();
    } catch (error) {
      enqueueSnackbar('Failed to assign video', { variant: 'error' });
    }
  };

  const approveVideo = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/approve`,
        {
          notes: reviewNotes,
          publish: autoPublish,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar('Video approved successfully', { variant: 'success' });
      setApproveDialog(false);
      setReviewNotes('');
      setAutoPublish(false);
      loadVideoData();
    } catch (error) {
      enqueueSnackbar('Failed to approve video', { variant: 'error' });
    }
  };

  const rejectVideo = async () => {
    if (!rejectionReason) {
      enqueueSnackbar('Please provide a rejection reason', { variant: 'error' });
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/reject`,
        {
          reason: rejectionReason,
          suggestions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar('Video rejected with feedback', { variant: 'info' });
      setRejectDialog(false);
      setRejectionReason('');
      setSuggestions('');
      loadVideoData();
    } catch (error) {
      enqueueSnackbar('Failed to reject video', { variant: 'error' });
    }
  };

  const triggerHLSProcessing = async () => {
    setProcessingHLS(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/process-hls`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar('HLS processing started', { variant: 'success' });
      loadVideoData();
    } catch (error) {
      enqueueSnackbar('Failed to trigger HLS processing', { variant: 'error' });
    } finally {
      setProcessingHLS(false);
    }
  };

  const getDownloadUrl = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${videoId}/download-url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      enqueueSnackbar('Failed to get download URL', { variant: 'error' });
    }
  };

  if (loading || !video) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading workflow data...</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Workflow Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoLibrary />
              Workflow Status
            </Typography>
            <Chip
              icon={workflowStatusIcons[video.workflowStatus]}
              label={video.workflowStatus.replace('_', ' ').toUpperCase()}
              color={workflowStatusColors[video.workflowStatus]}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Version:</strong> {video.version} ({video.versionType})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Uploaded by:</strong> {video.uploadedBy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Upload Date:</strong> {format(new Date(video.uploadedAt), 'PPp')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {video.assignedTo && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Assigned to:</strong> {video.assignedTo}
                </Typography>
              )}
              {video.approvedBy && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Approved by:</strong> {video.approvedBy}
                </Typography>
              )}
              {video.rejectedBy && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Rejected by:</strong> {video.rejectedBy}
                </Typography>
              )}
            </Grid>
          </Grid>

          {video.editNotes && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Edit Notes:</strong> {video.editNotes}
              </Typography>
            </Alert>
          )}

          {video.reviewNotes && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Review Notes:</strong> {video.reviewNotes}
              </Typography>
            </Alert>
          )}

          {video.rejectionReason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Rejection Reason:</strong> {video.rejectionReason}
              </Typography>
            </Alert>
          )}
        </CardContent>

        <Divider />

        <CardActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
          {/* Workflow Actions based on status */}
          {video.workflowStatus === 'draft' && (
            <>
              <Button
                startIcon={<AssignmentInd />}
                onClick={() => setAssignDialog(true)}
                variant="outlined"
                size="small"
              >
                Assign
              </Button>
              <Button
                startIcon={<Send />}
                onClick={() => updateWorkflowStatus('pending_review')}
                variant="outlined"
                size="small"
              >
                Send for Review
              </Button>
            </>
          )}

          {video.workflowStatus === 'pending_edit' && (
            <Button
              startIcon={<CloudUpload />}
              onClick={() => onVersionCreated?.()}
              variant="outlined"
              size="small"
            >
              Upload Edited Version
            </Button>
          )}

          {video.workflowStatus === 'pending_review' && (
            <>
              <Button
                startIcon={<ThumbUp />}
                onClick={() => setApproveDialog(true)}
                variant="contained"
                color="success"
                size="small"
              >
                Approve
              </Button>
              <Button
                startIcon={<ThumbDown />}
                onClick={() => setRejectDialog(true)}
                variant="contained"
                color="error"
                size="small"
              >
                Reject
              </Button>
            </>
          )}

          {video.workflowStatus === 'approved' && !video.workflowStatus.includes('published') && (
            <Button
              startIcon={<PublishedWithChanges />}
              onClick={() => updateWorkflowStatus('published')}
              variant="contained"
              color="primary"
              size="small"
            >
              Publish
            </Button>
          )}

          {/* Common Actions */}
          <Button
            startIcon={<Download />}
            onClick={getDownloadUrl}
            variant="outlined"
            size="small"
          >
            Download
          </Button>

          {!video.autoProcessHLS && video.status === 'uploaded' && (
            <Button
              startIcon={<Build />}
              onClick={triggerHLSProcessing}
              variant="outlined"
              size="small"
              disabled={processingHLS}
            >
              {processingHLS ? 'Processing...' : 'Process HLS'}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Notification History */}
      {video.notificationHistory && video.notificationHistory.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NotificationsActive />
              Notification History
            </Typography>
            <List dense>
              {video.notificationHistory.map((notification, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {notification.status === 'sent' ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${notification.type.toUpperCase()} notification`}
                    secondary={
                      <>
                        Sent to: {notification.sentTo.join(', ')} •{' '}
                        {format(new Date(notification.sentAt), 'PPp')}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Workflow Timeline */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <History />
            Workflow Timeline
          </Typography>
          <Timeline position="alternate">
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {format(new Date(video.uploadedAt), 'PPp')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <Upload />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6">Uploaded</Typography>
                <Typography variant="body2">by {video.uploadedBy}</Typography>
              </TimelineContent>
            </TimelineItem>

            {video.assignedAt && (
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  {format(new Date(video.assignedAt), 'PPp')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="warning">
                    <AssignmentInd />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">Assigned</Typography>
                  <Typography variant="body2">to {video.assignedTo}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}

            {video.approvedAt && (
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  {format(new Date(video.approvedAt), 'PPp')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="success">
                    <CheckCircle />
                  </TimelineDot>
                  {video.workflowStatus !== 'published' && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">Approved</Typography>
                  <Typography variant="body2">by {video.approvedBy}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}

            {video.rejectedAt && (
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  {format(new Date(video.rejectedAt), 'PPp')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="error">
                    <Block />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">Rejected</Typography>
                  <Typography variant="body2">by {video.rejectedBy}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}

            {video.workflowStatus === 'published' && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="success">
                    <PublishedWithChanges />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">Published</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Video</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Assignee Email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            placeholder="editor@example.com"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button onClick={assignVideo} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Video</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Review Notes (optional)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
              />
            }
            label="Auto-publish after approval"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={approveVideo} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Video</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Suggestions for Improvement (optional)"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button onClick={rejectVideo} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};