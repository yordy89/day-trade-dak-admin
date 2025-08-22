'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  Download,
  Visibility,
  VisibilityOff,
  Refresh,
  Search,
  VideoFile,
  Error as ErrorIcon,
  CheckCircle,
  HourglassEmpty,
  Upload,
  Assignment,
  RateReview,
  ThumbUp,
  ThumbDown,
  PublishedWithChanges,
  OpenInNew,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface Video {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  status: string;
  workflowStatus?: string;
  version?: number;
  versionType?: string;
  assignedTo?: string;
  originalFileName: string;
  fileSize: number;
  duration: number;
  isPublished: boolean;
  uploadedBy: string;
  createdAt: string;
  processedAt?: string;
  parentVideoId?: string;
  childVersions?: string[];
}

interface VideoListProps {
  refreshTrigger?: number;
}

export const VideoList = ({ refreshTrigger }: VideoListProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<Video | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (contentTypeFilter) params.append('contentType', contentTypeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (workflowFilter) params.append('workflowStatus', workflowFilter);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      setVideos(data.videos);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      enqueueSnackbar('Failed to load videos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, rowsPerPage, contentTypeFilter, statusFilter, workflowFilter, refreshTrigger]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 0) {
        fetchVideos();
      } else {
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handlePublishToggle = async (video: Video) => {
    try {
      const endpoint = video.isPublished ? 'unpublish' : 'publish';
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${video._id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar(
        video.isPublished ? 'Video unpublished' : 'Video published',
        { variant: 'success' }
      );
      fetchVideos();
    } catch (error) {
      enqueueSnackbar('Failed to update video status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${deleteDialog._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar('Video deleted successfully', { variant: 'success' });
      setDeleteDialog(null);
      fetchVideos();
    } catch (error) {
      enqueueSnackbar('Failed to delete video', { variant: 'error' });
    }
  };

  const handleDownload = async (video: Video) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${video._id}/download-url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      enqueueSnackbar('Failed to get download link', { variant: 'error' });
    }
  };

  const handleReprocess = async (video: Video) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${video._id}/reprocess`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      enqueueSnackbar('Video reprocessing started', { variant: 'success' });
      fetchVideos();
    } catch (error) {
      enqueueSnackbar('Failed to reprocess video', { variant: 'error' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload sx={{ fontSize: 16 }} />;
      case 'processing':
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case 'ready':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'info';
      case 'processing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getWorkflowIcon = (workflowStatus?: string) => {
    switch (workflowStatus) {
      case 'draft':
        return <Edit sx={{ fontSize: 16 }} />;
      case 'pending_edit':
        return <Assignment sx={{ fontSize: 16 }} />;
      case 'pending_review':
        return <RateReview sx={{ fontSize: 16 }} />;
      case 'approved':
        return <ThumbUp sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <ThumbDown sx={{ fontSize: 16 }} />;
      case 'published':
        return <PublishedWithChanges sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  const getWorkflowColor = (workflowStatus?: string): any => {
    switch (workflowStatus) {
      case 'draft':
        return 'default';
      case 'pending_edit':
        return 'warning';
      case 'pending_review':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'published':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Video Library
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                label="Content Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="psicotrading">PsicoTrading</MenuItem>
                <MenuItem value="daily_classes">Daily Classes</MenuItem>
                <MenuItem value="master_classes">Master Classes</MenuItem>
                <MenuItem value="stocks">Stocks</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="uploading">Uploading</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Workflow</InputLabel>
              <Select
                value={workflowFilter}
                onChange={(e) => setWorkflowFilter(e.target.value)}
                label="Workflow"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_edit">Pending Edit</MenuItem>
                <MenuItem value="pending_review">Pending Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton onClick={fetchVideos} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Workflow</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VideoFile sx={{ color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {video.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {video.originalFileName}
                            </Typography>
                            {video.version && (
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                <Chip
                                  label={`v${video.version}`}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.7rem' }}
                                />
                                {video.versionType && (
                                  <Chip
                                    label={video.versionType}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.7rem' }}
                                    color={video.versionType === 'edited' ? 'warning' : 'primary'}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={video.contentType.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(video.status)}
                          label={video.status}
                          size="small"
                          color={getStatusColor(video.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {video.workflowStatus && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              icon={getWorkflowIcon(video.workflowStatus)}
                              label={video.workflowStatus.replace('_', ' ')}
                              size="small"
                              color={getWorkflowColor(video.workflowStatus)}
                            />
                            {video.assignedTo && (
                              <Typography variant="caption" color="text.secondary">
                                → {video.assignedTo}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{formatFileSize(video.fileSize)}</TableCell>
                      <TableCell>{formatDuration(video.duration)}</TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(video.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => window.location.href = `/content/video/${video._id}`}
                              color="primary"
                            >
                              <OpenInNew />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={video.isPublished ? 'Unpublish' : 'Publish'}>
                            <IconButton
                              size="small"
                              onClick={() => handlePublishToggle(video)}
                              disabled={video.status !== 'ready' || video.workflowStatus === 'draft'}
                            >
                              {video.isPublished ? (
                                <Visibility color="primary" />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(video)}
                              disabled={video.status === 'uploading'}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          {video.status === 'error' && (
                            <Tooltip title="Reprocess">
                              <IconButton
                                size="small"
                                onClick={() => handleReprocess(video)}
                                color="warning"
                              >
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteDialog(video)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};