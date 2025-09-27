'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface Recording {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  type: 'raw' | 'edited';
}

interface RecordingsListProps {
  type: 'raw' | 'edited';
  refreshTrigger?: number;
}

export function RecordingsList({ type, refreshTrigger }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<string>('video/mp4');
  const { enqueueSnackbar } = useSnackbar();

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/recordings?type=${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecordings(response.data);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      enqueueSnackbar('Failed to fetch recordings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [type, refreshTrigger]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (recording: Recording) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/recordings/${encodeURIComponent(recording.key)}/download-url`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.data.url;
      link.download = response.data.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      enqueueSnackbar('Download started', { variant: 'success' });
    } catch (error) {
      console.error('Failed to download recording:', error);
      enqueueSnackbar('Failed to download recording', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecording) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/recordings/${encodeURIComponent(selectedRecording.key)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      enqueueSnackbar('Recording deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedRecording(null);
      fetchRecordings();
    } catch (error) {
      console.error('Failed to delete recording:', error);
      enqueueSnackbar('Failed to delete recording', { variant: 'error' });
    }
  };

  const handlePreview = async (recording: Recording) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/recordings/${encodeURIComponent(recording.key)}/watch-url`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPreviewUrl(response.data.url);
      setVideoType(response.data.type);
      setSelectedRecording(recording);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      enqueueSnackbar('Failed to preview recording', { variant: 'error' });
    }
  };

  if (loading && recordings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {type === 'raw' ? 'LiveKit Recordings' : 'Edited Videos'}
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchRecordings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {recordings.length === 0 ? (
        <Alert severity="info">
          No {type === 'raw' ? 'recordings' : 'edited videos'} found
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordings.map((recording) => (
                <TableRow key={recording.key}>
                  <TableCell>{recording.name}</TableCell>
                  <TableCell>{formatFileSize(recording.size)}</TableCell>
                  <TableCell>
                    {format(new Date(recording.lastModified), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={recording.type === 'raw' ? 'Raw' : 'Edited'}
                      color={recording.type === 'raw' ? 'default' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview">
                      <IconButton onClick={() => handlePreview(recording)} size="small">
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton onClick={() => handleDownload(recording)} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => {
                          setSelectedRecording(recording);
                          setDeleteDialogOpen(true);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Recording</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedRecording?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{selectedRecording?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: 'black' }}>
            {previewUrl && (
              <video
                controls
                style={{ width: '100%', height: '100%' }}
              >
                <source src={previewUrl} type={videoType} />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}