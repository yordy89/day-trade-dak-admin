'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Cancel,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  Info,
  Send,
  Assignment,
  NotificationsActive,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface VideoUploadWorkflowProps {
  onUploadComplete: () => void;
  parentVideoId?: string; // For creating new versions
}

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks for better performance

export const VideoUploadWorkflow = ({ onUploadComplete, parentVideoId }: VideoUploadWorkflowProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Basic fields
  const [contentType, setContentType] = useState('psicotrading');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Version management
  const [versionType, setVersionType] = useState(parentVideoId ? 'edited' : 'original');
  
  // Workflow
  const [assignedTo, setAssignedTo] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('draft');
  
  // Notifications
  const [notifyOnUpload, setNotifyOnUpload] = useState<string[]>([]);
  const [notifyOnEdit, setNotifyOnEdit] = useState<string[]>([]);
  const [notifyOnApproval, setNotifyOnApproval] = useState<string[]>([]);
  const [notifyOnPublish, setNotifyOnPublish] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  
  // Processing
  const [autoProcessHLS, setAutoProcessHLS] = useState(false);
  
  // UI State
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [currentUpload, setCurrentUpload] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (parentVideoId) {
      fetchParentVideoInfo();
    }
  }, [parentVideoId]);

  const fetchParentVideoInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${parentVideoId}/versions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      // Pre-fill some fields based on parent
      setContentType(data.contentType);
      setVideoTitle(`${data.title} - Version ${data.versions.length + 1}`);
    } catch (error) {
      console.error('Failed to fetch parent video info:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [videoTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const addEmail = (type: 'upload' | 'edit' | 'approval' | 'publish') => {
    if (!emailInput || !emailInput.includes('@')) {
      enqueueSnackbar('Please enter a valid email', { variant: 'error' });
      return;
    }

    switch (type) {
      case 'upload':
        setNotifyOnUpload([...notifyOnUpload, emailInput]);
        break;
      case 'edit':
        setNotifyOnEdit([...notifyOnEdit, emailInput]);
        break;
      case 'approval':
        setNotifyOnApproval([...notifyOnApproval, emailInput]);
        break;
      case 'publish':
        setNotifyOnPublish([...notifyOnPublish, emailInput]);
        break;
    }
    setEmailInput('');
  };

  const removeEmail = (email: string, type: 'upload' | 'edit' | 'approval' | 'publish') => {
    switch (type) {
      case 'upload':
        setNotifyOnUpload(notifyOnUpload.filter(e => e !== email));
        break;
      case 'edit':
        setNotifyOnEdit(notifyOnEdit.filter(e => e !== email));
        break;
      case 'approval':
        setNotifyOnApproval(notifyOnApproval.filter(e => e !== email));
        break;
      case 'publish':
        setNotifyOnPublish(notifyOnPublish.filter(e => e !== email));
        break;
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !videoTitle) {
      enqueueSnackbar('Please select a file and enter a title', { variant: 'error' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Prepare upload options
      const uploadOptions = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        contentType,
        title: videoTitle,
        description: videoDescription,
        editNotes,
        parentVideoId,
        versionType: parentVideoId ? versionType : undefined,
        workflowStatus: assignedTo ? 'pending_edit' : workflowStatus,
        assignedTo: assignedTo || undefined,
        notifyOnUpload: notifyOnUpload.length > 0 ? notifyOnUpload : undefined,
        notifyOnEdit: notifyOnEdit.length > 0 ? notifyOnEdit : undefined,
        notifyOnApproval: notifyOnApproval.length > 0 ? notifyOnApproval : undefined,
        notifyOnPublish: notifyOnPublish.length > 0 ? notifyOnPublish : undefined,
        autoProcessHLS,
      };

      // Initiate multipart upload with workflow
      const { data: initData } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/upload/initiate`,
        uploadOptions,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const { videoId, uploadId, version, versionType: returnedVersionType, workflowStatus: returnedStatus } = initData;
      setCurrentUpload({ videoId, uploadId });

      enqueueSnackbar(`Upload initiated - Version ${version} (${returnedVersionType})`, { variant: 'info' });

      // Calculate number of parts
      const numParts = Math.ceil(selectedFile.size / CHUNK_SIZE);

      // Get all part URLs in batch
      const { data: urlData } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/batch-part-urls`,
        {
          videoId,
          uploadId,
          totalParts: numParts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const { partUrls } = urlData;
      const parts = [];

      // Upload each part
      for (let i = 0; i < partUrls.length; i++) {
        const { partNumber, uploadUrl } = partUrls[i];
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        // Upload chunk to S3
        const response = await axios.put(uploadUrl, chunk, {
          headers: {
            'Content-Type': selectedFile.type,
          },
          onUploadProgress: (progressEvent) => {
            const overallProgress = Math.round(
              ((i * CHUNK_SIZE + progressEvent.loaded) / selectedFile.size) * 100
            );
            setUploadProgress(overallProgress);
          },
        });

        parts.push({
          partNumber,
          etag: response.headers.etag?.replace(/"/g, ''),
        });
      }

      // Complete multipart upload
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/upload/complete`,
        {
          videoId,
          uploadId,
          parts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      enqueueSnackbar(
        `Video uploaded successfully! ${
          autoProcessHLS ? 'Processing will begin shortly.' : 'HLS processing is disabled - trigger manually when ready.'
        }`,
        { variant: 'success' }
      );

      // Show notification info
      if (notifyOnUpload.length > 0) {
        enqueueSnackbar(`Notifications sent to: ${notifyOnUpload.join(', ')}`, { variant: 'info' });
      }

      resetForm();
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Upload failed', {
        variant: 'error',
      });
    } finally {
      setUploading(false);
      setCurrentUpload(null);
    }
  };

  const cancelUpload = async () => {
    if (currentUpload) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/abort`,
          {
            videoId: currentUpload.videoId,
            uploadId: currentUpload.uploadId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
          }
        );
        enqueueSnackbar('Upload cancelled', { variant: 'info' });
      } catch (error) {
        console.error('Failed to cancel upload:', error);
      }
    }
    
    setUploading(false);
    setUploadProgress(0);
    setCurrentUpload(null);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVideoTitle('');
    setVideoDescription('');
    setEditNotes('');
    setAssignedTo('');
    setNotifyOnUpload([]);
    setNotifyOnEdit([]);
    setNotifyOnApproval([]);
    setNotifyOnPublish([]);
    setUploadProgress(0);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {parentVideoId ? 'Upload New Version' : 'Upload Video with Workflow'}
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Basic Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                label="Content Type"
                disabled={uploading}
              >
                <MenuItem value="psicotrading">PsicoTrading</MenuItem>
                <MenuItem value="daily_classes">Daily Classes</MenuItem>
                <MenuItem value="master_classes">Master Classes</MenuItem>
                <MenuItem value="stocks">Stocks</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              disabled={uploading}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              multiline
              rows={3}
              disabled={uploading}
              sx={{ mb: 2 }}
            />

            {parentVideoId && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Version Type</InputLabel>
                <Select
                  value={versionType}
                  onChange={(e) => setVersionType(e.target.value)}
                  label="Version Type"
                  disabled={uploading}
                >
                  <MenuItem value="edited">Edited</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Edit Notes (for reviewers)"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              multiline
              rows={2}
              disabled={uploading}
              helperText="Describe what changes were made or what needs attention"
            />
          </Box>
        </Grid>

        {/* Right Column - Workflow & Notifications */}
        <Grid item xs={12} md={6}>
          {/* Workflow Assignment */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 1 }} />
              Workflow Assignment
            </Typography>
            <TextField
              fullWidth
              label="Assign to (email)"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={uploading}
              placeholder="editor@example.com"
              helperText="Assign this video to someone for editing"
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Initial Status</InputLabel>
              <Select
                value={workflowStatus}
                onChange={(e) => setWorkflowStatus(e.target.value)}
                label="Initial Status"
                disabled={uploading || assignedTo !== ''}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_edit">Pending Edit</MenuItem>
                <MenuItem value="pending_review">Pending Review</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Processing Options */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoProcessHLS}
                  onChange={(e) => setAutoProcessHLS(e.target.checked)}
                  disabled={uploading}
                />
              }
              label="Auto-process HLS after upload"
            />
            {!autoProcessHLS && (
              <Alert severity="info" sx={{ mt: 1 }}>
                HLS processing disabled. You can trigger it manually after reviewing the video.
              </Alert>
            )}
          </Paper>

          {/* Notifications */}
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsActive sx={{ mr: 1 }} />
                Email Notifications
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {showNotifications ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={showNotifications}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Add email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  placeholder="email@example.com"
                />

                {/* Notify on Upload */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>On Upload:</Typography>
                    <IconButton size="small" onClick={() => addEmail('upload')}>
                      <Add />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {notifyOnUpload.map(email => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => removeEmail(email, 'upload')}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Notify on Edit */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>On Edit:</Typography>
                    <IconButton size="small" onClick={() => addEmail('edit')}>
                      <Add />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {notifyOnEdit.map(email => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => removeEmail(email, 'edit')}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Notify on Approval */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>On Approval:</Typography>
                    <IconButton size="small" onClick={() => addEmail('approval')}>
                      <Add />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {notifyOnApproval.map(email => (
                      <Chip
                        key={email}
                        label={email}
                        size="small"
                        onDelete={() => removeEmail(email, 'approval')}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* File Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the video here'
            : 'Drag & drop a video here, or click to select'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: MP4, MOV, AVI, MKV, WebM (Max 10GB)
        </Typography>
      </Box>

      {selectedFile && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </Alert>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
            <Button
              size="small"
              color="error"
              startIcon={<Cancel />}
              onClick={cancelUpload}
            >
              Cancel
            </Button>
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {selectedFile && !uploading && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={uploadFile}
            disabled={!videoTitle}
          >
            Upload Video
          </Button>
          <Button
            variant="outlined"
            onClick={resetForm}
          >
            Clear
          </Button>
        </Box>
      )}

      {/* Workflow Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Workflow Process:
        </Typography>
        <Typography variant="body2" component="div">
          1. Upload original video → 2. Assign to editor (optional) → 3. Editor downloads & edits → 
          4. Editor uploads new version → 5. Reviewer approves/rejects → 6. Publish
        </Typography>
      </Alert>
    </Paper>
  );
};