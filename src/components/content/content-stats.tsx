'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  VideoLibrary,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Storage,
} from '@mui/icons-material';
import axios from 'axios';

interface ContentStatsProps {
  refreshTrigger?: number;
}

export const ContentStats = ({ refreshTrigger }: ContentStatsProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Videos',
      value: stats?.overview?.totalVideos || 0,
      icon: VideoLibrary,
      color: '#2196f3',
    },
    {
      title: 'Published',
      value: stats?.overview?.publishedVideos || 0,
      icon: CheckCircle,
      color: '#4caf50',
    },
    {
      title: 'Processing',
      value: stats?.overview?.processingVideos || 0,
      icon: CloudUpload,
      color: '#ff9800',
    },
    {
      title: 'Storage Used',
      value: `${stats?.overview?.totalStorageUsedGB || 0} GB`,
      icon: Storage,
      color: '#9c27b0',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: stat.color + '20',
              }}
            >
              <stat.icon sx={{ color: stat.color, fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stat.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}

      {stats?.overview?.errorVideos > 0 && (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'error.main',
              color: 'error.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon />
              <Typography>
                {stats.overview.errorVideos} video(s) failed processing and need attention
              </Typography>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};