'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  Campaign,
  TrendingUp,
  Visibility,
  TouchApp,
  Close as CloseIcon,
  Analytics,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/admin-layout';
import AnnouncementList from '@/components/announcements/announcement-list';
import AnnouncementForm from '@/components/announcements/announcement-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/axios';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '@/types/announcement';
import { enqueueSnackbar } from 'notistack';

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState<any>(null);

  // Fetch announcements
  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await API.get('/auth/announcements');
      return response.data;
    },
  });

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAnnouncementDto) => {
      const response = await API.post('/auth/announcements', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      enqueueSnackbar('Announcement created successfully', { variant: 'success' });
      setFormOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to create announcement', {
        variant: 'error',
      });
    },
  });

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAnnouncementDto }) => {
      const response = await API.patch(`/auth/announcements/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      enqueueSnackbar('Announcement updated successfully', { variant: 'success' });
      setFormOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update announcement', {
        variant: 'error',
      });
    },
  });

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/auth/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      enqueueSnackbar('Announcement deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete announcement', {
        variant: 'error',
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const endpoint = isActive
        ? `/auth/announcements/${id}/activate`
        : `/auth/announcements/${id}/deactivate`;
      const response = await API.put(endpoint);
      return response.data;
    },
    onSuccess: (data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      enqueueSnackbar(
        isActive ? 'Announcement activated successfully' : 'Announcement deactivated successfully',
        { variant: 'success' }
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update announcement status', {
        variant: 'error',
      });
    },
  });

  // Fetch announcement stats
  const fetchStats = async (id: string) => {
    try {
      const response = await API.get(`/auth/announcements/stats/${id}`);
      setSelectedStats(response.data);
      setStatsDialogOpen(true);
    } catch (error: any) {
      enqueueSnackbar('Failed to fetch statistics', { variant: 'error' });
    }
  };

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleFormSubmit = (data: CreateAnnouncementDto | UpdateAnnouncementDto) => {
    if (selectedAnnouncement) {
      updateMutation.mutate({ id: selectedAnnouncement._id, data });
    } else {
      createMutation.mutate(data as CreateAnnouncementDto);
    }
  };

  const confirmDelete = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete);
    }
  };

  // Calculate stats
  const activeCount = announcements.filter((a: Announcement) => a.isActive).length;
  const totalViews = announcements.reduce((sum: number, a: Announcement) => sum + a.viewCount, 0);
  const totalClicks = announcements.reduce((sum: number, a: Announcement) => sum + a.clickCount, 0);

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Announcements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage platform-wide announcements for important updates and events
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Campaign sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Announcements
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {announcements.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Active Now
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {activeCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ color: 'info.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Views
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {totalViews.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TouchApp sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Clicks
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {totalClicks.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box mb={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreate}
            size="large"
          >
            Create New Announcement
          </Button>
        </Box>

        {/* Announcements List */}
        <Paper elevation={2}>
          {announcements.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Campaign sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No announcements yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first announcement to notify users about important updates
              </Typography>
              <Button variant="contained" onClick={handleCreate} startIcon={<Add />}>
                Create First Announcement
              </Button>
            </Box>
          ) : (
            <AnnouncementList
              announcements={announcements}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onViewStats={fetchStats}
            />
          )}
        </Paper>

        {/* Announcement Form Dialog */}
        <AnnouncementForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedAnnouncement(null);
          }}
          onSubmit={handleFormSubmit}
          announcement={selectedAnnouncement}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stats Dialog */}
        <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Announcement Statistics</Typography>
              <IconButton onClick={() => setStatsDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedStats && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedStats.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                    <Chip label={selectedStats.type} size="small" color="primary" />
                    <Chip label={selectedStats.priority} size="small" color="warning" />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="h4" color="primary.main">
                      {selectedStats.viewCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Views
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="h4" color="success.main">
                      {selectedStats.clickCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clicks
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="h4" color="info.main">
                      {selectedStats.clickThroughRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click-through Rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="h4" color="warning.main">
                      {selectedStats.dismissRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dismiss Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}