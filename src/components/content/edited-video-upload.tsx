'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  LinearProgress,
  Alert,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface EditedVideoUploadProps {
  onUploadComplete?: () => void;
}

export function EditedVideoUpload({ onUploadComplete }: EditedVideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const videoFile = acceptedFiles[0];
      setFile(videoFile);
      // Auto-generate name from file name (without extension)
      const nameWithoutExt = videoFile.name.replace(/\.[^/.]+$/, '');
      setVideoName(nameWithoutExt);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
  });

  const handleUpload = async () => {
    if (!file || !videoName.trim()) {
      enqueueSnackbar('Please select a file and provide a name', { variant: 'warning' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', videoName.trim());

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/recordings/upload-edited`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      enqueueSnackbar('Video uploaded successfully', { variant: 'success' });

      // Reset form
      setFile(null);
      setVideoName('');
      setUploadProgress(0);

      // Trigger refresh
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload video';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Edited Video
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.default',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          {isDragActive
            ? 'Drop the video here...'
            : 'Drag & drop your edited video here, or click to select'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: MP4, MOV, AVI, MKV, WebM (Max: 10GB)
        </Typography>
      </Box>

      {file && (
        <Box mt={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Selected: {file.name} ({formatFileSize(file.size)})
          </Alert>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1 }}>Video Name</FormLabel>
            <TextField
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="Enter a name for the video"
              variant="outlined"
              fullWidth
              disabled={uploading}
              helperText="This name will be used to identify the video in your library"
            />
          </FormControl>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading || !videoName.trim()}
            startIcon={<UploadIcon />}
            fullWidth
            size="large"
          >
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}