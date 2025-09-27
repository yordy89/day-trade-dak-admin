'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Close,
  Preview,
  TrendingUp,
  AttachMoney,
  NewReleases,
  Update,
  Info,
  Link as LinkIcon,
  Palette,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

const AnnouncementTemplateBuilder = dynamic(
  () => import('./AnnouncementTemplateBuilder'),
  { ssr: false }
);
import {
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from '@/types/announcement';

interface AnnouncementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementDto | UpdateAnnouncementDto) => void;
  announcement?: Announcement | null;
}

const typeIcons = {
  [AnnouncementType.FED_MEETING]: '🏦',
  [AnnouncementType.EARNINGS]: '📊',
  [AnnouncementType.MARKET_NEWS]: '📰',
  [AnnouncementType.PLATFORM_UPDATE]: '✨',
  [AnnouncementType.WEBINAR]: '🎥',
  [AnnouncementType.COURSE]: '🎓',
  [AnnouncementType.MENTORSHIP]: '👨‍🏫',
  [AnnouncementType.GENERAL]: '📢',
};

const defaultColors = {
  [AnnouncementType.FED_MEETING]: { bg: '#1565c0', text: '#ffffff' },
  [AnnouncementType.EARNINGS]: { bg: '#2e7d32', text: '#ffffff' },
  [AnnouncementType.MARKET_NEWS]: { bg: '#ed6c02', text: '#ffffff' },
  [AnnouncementType.PLATFORM_UPDATE]: { bg: '#9c27b0', text: '#ffffff' },
  [AnnouncementType.WEBINAR]: { bg: '#00897b', text: '#ffffff' },
  [AnnouncementType.COURSE]: { bg: '#5e35b1', text: '#ffffff' },
  [AnnouncementType.MENTORSHIP]: { bg: '#e53935', text: '#ffffff' },
  [AnnouncementType.GENERAL]: { bg: '#1976d2', text: '#ffffff' },
};

const templates = {
  [AnnouncementType.FED_MEETING]: {
    title: 'FOMC Meeting Today',
    content: 'Federal Reserve interest rate decision at 2:00 PM EST. Expect market volatility.',
    linkText: 'View Details',
  },
  [AnnouncementType.EARNINGS]: {
    title: 'Tech Earnings This Week',
    content: 'Major tech companies reporting: AAPL, MSFT, GOOGL, AMZN',
    linkText: 'See Calendar',
  },
  [AnnouncementType.MARKET_NEWS]: {
    title: 'Market Alert',
    content: 'Important market update affecting trading conditions',
    linkText: 'Read More',
  },
  [AnnouncementType.PLATFORM_UPDATE]: {
    title: 'New Feature Available',
    content: 'We\'ve launched new advanced trading tools for all users',
    linkText: 'Learn More',
  },
  [AnnouncementType.WEBINAR]: {
    title: 'Live Trading Webinar',
    content: 'Join us for an exclusive trading strategies webinar',
    linkText: 'Register Now',
  },
  [AnnouncementType.COURSE]: {
    title: 'New Course Available',
    content: 'Master advanced trading techniques with our latest course',
    linkText: 'Enroll Now',
  },
  [AnnouncementType.MENTORSHIP]: {
    title: 'Mentorship Program Open',
    content: 'Get personalized guidance from expert traders',
    linkText: 'Apply Today',
  },
  [AnnouncementType.GENERAL]: {
    title: 'Important Announcement',
    content: 'Stay informed about the latest updates',
    linkText: 'Learn More',
  },
};

export default function AnnouncementForm({
  open,
  onClose,
  onSubmit,
  announcement,
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: '',
    content: '',
    type: AnnouncementType.GENERAL,
    priority: AnnouncementPriority.MEDIUM,
    status: AnnouncementStatus.DRAFT,
    isActive: false,
    link: '',
    linkText: 'Learn More',
    backgroundColor: '#1976d2',
    textColor: '#ffffff',
    linkColor: '#ffffff',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dismissible: true,
    dismissDurationHours: 24,
    template: 'default',
    customStyles: {},
    customHtml: '',
  } as any);

  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        status: announcement.status,
        isActive: announcement.isActive,
        link: announcement.link || '',
        linkText: announcement.linkText || 'Learn More',
        backgroundColor: announcement.backgroundColor,
        textColor: announcement.textColor,
        linkColor: announcement.linkColor,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        dismissible: announcement.dismissible,
        dismissDurationHours: announcement.dismissDurationHours,
      });
    }
  }, [announcement]);

  const handleChange = (field: keyof CreateAnnouncementDto) => (
    event: any
  ) => {
    const value = event.target ? event.target.value : event;
    setFormData({ ...formData, [field]: value });
  };

  const handleTypeChange = (type: AnnouncementType) => {
    setFormData({
      ...formData,
      type,
      backgroundColor: defaultColors[type].bg,
      textColor: defaultColors[type].text,
    });
  };

  const applyTemplate = () => {
    const template = templates[formData.type!];
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        content: template.content,
        linkText: template.linkText,
      });
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Type and Priority */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as AnnouncementType)}
                label="Type"
              >
                {Object.values(AnnouncementType).map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{typeIcons[type]}</span>
                      <span>{type.replace('_', ' ').toUpperCase()}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleChange('priority')}
                label="Priority"
              >
                {Object.values(AnnouncementPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Template Button */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={applyTemplate}
              startIcon={<Preview />}
            >
              Apply Template for {formData.type?.replace('_', ' ')}
            </Button>
          </Grid>

          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              required
            />
          </Grid>

          {/* Content */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={handleChange('content')}
              multiline
              rows={3}
              required
            />
          </Grid>

          {/* Link */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Link URL (Optional)"
              value={formData.link}
              onChange={handleChange('link')}
              placeholder="https://example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Link Text"
              value={formData.linkText}
              onChange={handleChange('linkText')}
              disabled={!formData.link}
            />
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date"
                value={new Date(formData.startDate)}
                onChange={(date) => handleChange('startDate')(date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Date"
                value={new Date(formData.endDate)}
                onChange={(date) => handleChange('endDate')(date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Template Builder Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette /> Design & Template
              </Typography>
              <AnnouncementTemplateBuilder
                value={{
                  template: formData.template,
                  customStyles: formData.customStyles,
                  customHtml: formData.customHtml,
                  content: formData.content,
                  title: formData.title,
                  type: formData.type,
                }}
                onChange={(templateData) => {
                  setFormData({
                    ...formData,
                    ...templateData,
                  });
                }}
              />
            </Paper>
          </Grid>

          {/* Settings */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.dismissible}
                  onChange={(e) => handleChange('dismissible')(e.target.checked)}
                />
              }
              label="Dismissible"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Dismiss Duration (Hours)"
              value={formData.dismissDurationHours}
              onChange={handleChange('dismissDurationHours')}
              disabled={!formData.dismissible}
            />
          </Grid>

          {/* Activation */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive')(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography>
                  Set as Active Announcement
                  {formData.isActive && (
                    <Typography variant="caption" color="warning.main" display="block">
                      This will deactivate all other announcements
                    </Typography>
                  )}
                </Typography>
              }
            />
          </Grid>

          {/* Preview */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: formData.backgroundColor,
                color: formData.textColor,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4">{typeIcons[formData.type!]}</Typography>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.title || 'Announcement Title'}
                  </Typography>
                  <Typography variant="body2">
                    {formData.content || 'Announcement content goes here...'}
                  </Typography>
                </Box>
              </Box>
              {formData.link && (
                <Button
                  variant="text"
                  sx={{ color: formData.linkColor, textDecoration: 'underline' }}
                >
                  {formData.linkText}
                </Button>
              )}
              {formData.dismissible && (
                <IconButton sx={{ color: formData.textColor }}>
                  <Close />
                </IconButton>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {announcement ? 'Update' : 'Create'} Announcement
        </Button>
      </DialogActions>
    </Dialog>
  );
}