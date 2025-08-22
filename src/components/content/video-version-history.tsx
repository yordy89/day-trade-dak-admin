'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Collapse,
  Stack,
} from '@mui/material';
import {
  Download,
  Visibility,
  Compare,
  CloudUpload,
  ExpandMore,
  ExpandLess,
  History,
  CheckCircle,
  RadioButtonUnchecked,
  FiberManualRecord,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface Version {
  _id: string;
  title: string;
  version: number;
  versionType: string;
  status: string;
  workflowStatus: string;
  uploadedBy: string;
  uploadedAt: string;
  editNotes?: string;
  fileSize?: number;
}

interface VideoVersionHistoryProps {
  videoId: string;
  onVersionSelect?: (versionId: string) => void;
  onCreateVersion?: () => void;
}

export const VideoVersionHistory = ({
  videoId,
  onVersionSelect,
  onCreateVersion,
}: VideoVersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [parentVideoId, setParentVideoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareDialog, setCompareDialog] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadVersionHistory();
  }, [videoId]);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/workflow/videos/${videoId}/versions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      
      setVersions(data.versions);
      setCurrentVersion(data.currentVersion);
      setParentVideoId(data.parentVideoId);
    } catch (error) {
      enqueueSnackbar('Failed to load version history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = async (versionId: string) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${versionId}/download-url`,
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

  const toggleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      enqueueSnackbar('You can only compare 2 versions at a time', { variant: 'warning' });
    }
  };

  const openComparison = () => {
    if (selectedVersions.length !== 2) {
      enqueueSnackbar('Please select exactly 2 versions to compare', { variant: 'warning' });
      return;
    }
    setCompareDialog(true);
  };

  const getVersionColor = (versionType: string) => {
    switch (versionType) {
      case 'original':
        return 'primary';
      case 'edited':
        return 'warning';
      case 'final':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (workflowStatus: string) => {
    switch (workflowStatus) {
      case 'approved':
      case 'published':
        return <CheckCircle color="success" fontSize="small" />;
      case 'rejected':
        return <FiberManualRecord color="error" fontSize="small" />;
      default:
        return <RadioButtonUnchecked fontSize="small" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading version history...</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History />
            Version History
          </Typography>
          <Stack direction="row" spacing={1}>
            {selectedVersions.length === 2 && (
              <Button
                startIcon={<Compare />}
                onClick={openComparison}
                variant="outlined"
                size="small"
              >
                Compare Selected
              </Button>
            )}
            <Button
              startIcon={<CloudUpload />}
              onClick={onCreateVersion}
              variant="contained"
              size="small"
            >
              Upload New Version
            </Button>
          </Stack>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Current Version:</strong> Version {currentVersion} • 
            <strong> Total Versions:</strong> {versions.length} • 
            <strong> Parent Video:</strong> {parentVideoId === videoId ? 'This is the original' : 'Child of ' + parentVideoId}
          </Typography>
        </Alert>

        {/* Version Timeline */}
        <List>
          {versions.map((version, index) => (
            <Box key={version._id}>
              <ListItem
                sx={{
                  bgcolor: version._id === videoId ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => toggleVersionSelection(version._id)}
                    disabled={version._id === videoId}
                  >
                    {selectedVersions.includes(version._id) ? (
                      <CheckCircle color="primary" />
                    ) : (
                      <RadioButtonUnchecked />
                    )}
                  </IconButton>
                  {getStatusIcon(version.workflowStatus)}
                </Box>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        Version {version.version}: {version.title}
                      </Typography>
                      <Chip
                        label={version.versionType}
                        size="small"
                        color={getVersionColor(version.versionType)}
                      />
                      {version._id === videoId && (
                        <Chip label="Current" size="small" color="info" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded by {version.uploadedBy} on {format(new Date(version.uploadedAt), 'PPp')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {version.workflowStatus} • Size: {formatFileSize(version.fileSize)}
                      </Typography>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setExpandedVersion(
                          expandedVersion === version._id ? null : version._id
                        )}
                      >
                        {expandedVersion === version._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => onVersionSelect?.(version._id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => getDownloadUrl(version._id)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>

              <Collapse in={expandedVersion === version._id}>
                <Card sx={{ ml: 6, mr: 2, mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Video Status:</strong> {version.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Workflow Status:</strong> {version.workflowStatus}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Version Type:</strong> {version.versionType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Version Number:</strong> {version.version}
                        </Typography>
                      </Grid>
                      {version.editNotes && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>Edit Notes:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {version.editNotes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>

              {index < versions.length - 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 4, my: 1 }}>
                  <Box
                    sx={{
                      width: 2,
                      height: 30,
                      bgcolor: 'divider',
                      ml: 2,
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Comparison Dialog */}
      <Dialog
        open={compareDialog}
        onClose={() => setCompareDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Version Comparison</DialogTitle>
        <DialogContent>
          {selectedVersions.length === 2 && (
            <Grid container spacing={2}>
              {selectedVersions.map((versionId) => {
                const version = versions.find(v => v._id === versionId);
                if (!version) return null;
                
                return (
                  <Grid item xs={12} md={6} key={versionId}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Version {version.version}
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Type"
                            secondary={version.versionType}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Status"
                            secondary={version.workflowStatus}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Uploaded By"
                            secondary={version.uploadedBy}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Upload Date"
                            secondary={format(new Date(version.uploadedAt), 'PPp')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="File Size"
                            secondary={formatFileSize(version.fileSize)}
                          />
                        </ListItem>
                        {version.editNotes && (
                          <ListItem>
                            <ListItemText
                              primary="Edit Notes"
                              secondary={version.editNotes}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Open side-by-side video player
              window.open(
                `/content/compare?v1=${selectedVersions[0]}&v2=${selectedVersions[1]}`,
                '_blank'
              );
            }}
          >
            Open Video Comparison
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};