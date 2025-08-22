'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  Email,
  ExpandMore,
  NotificationsActive,
  Upload,
  Edit,
  ThumbUp,
  PublishedWithChanges,
  Send,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface NotificationSettingsProps {
  settings?: {
    onUpload?: string[];
    onEdit?: string[];
    onApproval?: string[];
    onPublish?: string[];
  };
  onChange?: (settings: any) => void;
  simplified?: boolean;
}

export const NotificationSettings = ({
  settings = {},
  onChange,
  simplified = false,
}: NotificationSettingsProps) => {
  const [emails, setEmails] = useState({
    onUpload: settings.onUpload || [],
    onEdit: settings.onEdit || [],
    onApproval: settings.onApproval || [],
    onPublish: settings.onPublish || [],
  });

  const [newEmail, setNewEmail] = useState({
    onUpload: '',
    onEdit: '',
    onApproval: '',
    onPublish: '',
  });

  const [autoNotify, setAutoNotify] = useState({
    onUpload: emails.onUpload.length > 0,
    onEdit: emails.onEdit.length > 0,
    onApproval: emails.onApproval.length > 0,
    onPublish: emails.onPublish.length > 0,
  });

  const { enqueueSnackbar } = useSnackbar();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const addEmail = (type: keyof typeof emails) => {
    const email = newEmail[type].trim().toLowerCase();
    
    if (!email) {
      enqueueSnackbar('Please enter an email address', { variant: 'error' });
      return;
    }
    
    if (!validateEmail(email)) {
      enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
      return;
    }
    
    if (emails[type].includes(email)) {
      enqueueSnackbar('Email already added', { variant: 'warning' });
      return;
    }
    
    const updatedEmails = {
      ...emails,
      [type]: [...emails[type], email],
    };
    
    setEmails(updatedEmails);
    setNewEmail({ ...newEmail, [type]: '' });
    setAutoNotify({ ...autoNotify, [type]: true });
    onChange?.(updatedEmails);
  };

  const removeEmail = (type: keyof typeof emails, email: string) => {
    const updatedEmails = {
      ...emails,
      [type]: emails[type].filter(e => e !== email),
    };
    
    setEmails(updatedEmails);
    if (updatedEmails[type].length === 0) {
      setAutoNotify({ ...autoNotify, [type]: false });
    }
    onChange?.(updatedEmails);
  };

  const toggleAutoNotify = (type: keyof typeof emails) => {
    const newValue = !autoNotify[type];
    setAutoNotify({ ...autoNotify, [type]: newValue });
    
    if (!newValue) {
      const updatedEmails = {
        ...emails,
        [type]: [],
      };
      setEmails(updatedEmails);
      onChange?.(updatedEmails);
    }
  };

  const notificationTypes = [
    {
      key: 'onUpload',
      label: 'On Upload',
      icon: <Upload />,
      color: 'primary' as any,
      description: 'Notify when the video is uploaded',
    },
    {
      key: 'onEdit',
      label: 'On Edit',
      icon: <Edit />,
      color: 'warning' as any,
      description: 'Notify when an edited version is uploaded',
    },
    {
      key: 'onApproval',
      label: 'On Approval',
      icon: <ThumbUp />,
      color: 'success' as any,
      description: 'Notify when the video is approved',
    },
    {
      key: 'onPublish',
      label: 'On Publish',
      icon: <PublishedWithChanges />,
      color: 'info' as any,
      description: 'Notify when the video is published',
    },
  ];

  if (simplified) {
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActive fontSize="small" />
          Email Notifications (Optional)
        </Typography>
        
        <Grid container spacing={2}>
          {notificationTypes.map((type) => (
            <Grid item xs={12} md={6} key={type.key}>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoNotify[type.key as keyof typeof autoNotify]}
                      onChange={() => toggleAutoNotify(type.key as keyof typeof emails)}
                      size="small"
                    />
                  }
                  label={type.label}
                />
                
                {autoNotify[type.key as keyof typeof autoNotify] && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        placeholder="email@example.com"
                        value={newEmail[type.key as keyof typeof newEmail]}
                        onChange={(e) => setNewEmail({
                          ...newEmail,
                          [type.key]: e.target.value,
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addEmail(type.key as keyof typeof emails);
                          }
                        }}
                        fullWidth
                      />
                      <Button
                        startIcon={<Add />}
                        onClick={() => addEmail(type.key as keyof typeof emails)}
                        variant="outlined"
                        size="small"
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {emails[type.key as keyof typeof emails].map((email) => (
                        <Chip
                          key={email}
                          label={email}
                          onDelete={() => removeEmail(type.key as keyof typeof emails, email)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsActive />
        Notification Settings
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure email notifications for different workflow stages. Recipients will be notified automatically when events occur.
      </Alert>

      {notificationTypes.map((type, index) => (
        <Accordion key={type.key} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip
                icon={type.icon}
                label={type.label}
                color={type.color}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {type.description}
              </Typography>
              {emails[type.key as keyof typeof emails].length > 0 && (
                <Chip
                  label={`${emails[type.key as keyof typeof emails].length} recipients`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoNotify[type.key as keyof typeof autoNotify]}
                    onChange={() => toggleAutoNotify(type.key as keyof typeof emails)}
                  />
                }
                label="Enable notifications for this event"
                sx={{ mb: 2 }}
              />
              
              {autoNotify[type.key as keyof typeof autoNotify] && (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      placeholder="Enter email address"
                      value={newEmail[type.key as keyof typeof newEmail]}
                      onChange={(e) => setNewEmail({
                        ...newEmail,
                        [type.key]: e.target.value,
                      })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addEmail(type.key as keyof typeof emails);
                        }
                      }}
                      fullWidth
                      size="small"
                    />
                    <Button
                      startIcon={<Add />}
                      onClick={() => addEmail(type.key as keyof typeof emails)}
                      variant="contained"
                      disabled={!newEmail[type.key as keyof typeof newEmail]}
                    >
                      Add Recipient
                    </Button>
                  </Box>
                  
                  {emails[type.key as keyof typeof emails].length > 0 ? (
                    <List dense>
                      {emails[type.key as keyof typeof emails].map((email) => (
                        <ListItem key={email}>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText
                            primary={email}
                            secondary="Will receive notification"
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => removeEmail(type.key as keyof typeof emails, email)}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No recipients added yet. Add email addresses to enable notifications.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Recipients: {Object.values(emails).flat().length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Notifications: {Object.values(autoNotify).filter(v => v).length} / {notificationTypes.length}
          </Typography>
        </Box>
        
        <Button
          startIcon={<Send />}
          variant="outlined"
          onClick={() => {
            enqueueSnackbar('Notification settings saved', { variant: 'success' });
          }}
        >
          Test Notifications
        </Button>
      </Box>
    </Paper>
  );
};