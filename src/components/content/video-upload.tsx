'use client';

import { useState, useCallback } from 'react';
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
} from '@mui/material';
import { CloudUpload, Cancel } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface VideoUploadProps {
  onUploadComplete: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const VideoUpload = ({ onUploadComplete }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState('psicotrading');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [currentUpload, setCurrentUpload] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const uploadFile = async () => {
    if (!selectedFile || !videoTitle) {
      enqueueSnackbar('Please select a file and enter a title', { variant: 'error' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Initiate multipart upload
      const { data: initData } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/initiate`,
        {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          contentType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const { videoId, uploadId } = initData;
      setCurrentUpload({ videoId, uploadId });

      // Calculate number of parts
      const numParts = Math.ceil(selectedFile.size / CHUNK_SIZE);
      const parts = [];

      // Upload each part
      for (let partNumber = 1; partNumber <= numParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        // Get presigned URL for this part
        const { data: partData } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/part-url`,
          {
            videoId,
            uploadId,
            partNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
          }
        );

        // Upload the chunk directly to S3
        const response = await axios.put(partData.uploadUrl, chunk, {
          headers: {
            'Content-Type': selectedFile.type,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((partNumber - 1) / numParts) * 100 +
                (progressEvent.loaded / progressEvent.total!) * (100 / numParts)
            );
            setUploadProgress(percentCompleted);
          },
        });

        parts.push({
          partNumber,
          etag: response.headers.etag?.replace(/"/g, ''),
        });

        // Update progress on backend
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/progress`,
          {
            videoId,
            bytesUploaded: end,
            partNumber,
            etag: response.headers.etag?.replace(/"/g, ''),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
          }
        );
      }

      // Complete multipart upload
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/upload/complete`,
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

      // Update video metadata
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${videoId}`,
        {
          title: videoTitle,
          description: videoDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      enqueueSnackbar('Video uploaded successfully! Processing will begin shortly.', {
        variant: 'success',
      });
      
      setSelectedFile(null);
      setVideoTitle('');
      setVideoDescription('');
      setUploadProgress(0);
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload New Video
      </Typography>

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
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description (optional)"
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          multiline
          rows={3}
          disabled={uploading}
          sx={{ mb: 2 }}
        />
      </Box>

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
            onClick={() => {
              setSelectedFile(null);
              setVideoTitle('');
              setVideoDescription('');
            }}
          >
            Clear
          </Button>
        </Box>
      )}
    </Paper>
  );
};