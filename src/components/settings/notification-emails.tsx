'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Delete, Add, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { settingsService } from '@/services/settings.service';
import { toast } from 'react-hot-toast';

export function NotificationEmails() {
  const { t } = useTranslation();
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const setting = await settingsService.getSettingByKey('notification_emails');
      if (setting && setting.value) {
        setEmails(Array.isArray(setting.value) ? setting.value : []);
      }
    } catch (err) {
      setError('Failed to load notification emails');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (emails.includes(email)) {
      toast.error('This email is already in the list');
      return;
    }

    setEmails([...emails, email]);
    setNewEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSetting('notification_emails', { value: emails });
      toast.success('Notification emails updated successfully');
    } catch (err) {
      toast.error('Failed to update notification emails');
      console.error('Error saving emails:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email />
          {t('settings.notifications.title', 'Contact Form Notification Emails')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('settings.notifications.description', 'These email addresses will receive notifications when someone submits the contact form.')}
        </Typography>

        {emails.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" icon={<Email />}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Currently receiving notifications: {emails.length} email{emails.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When a visitor submits the contact form, notification emails will be sent to all addresses listed below.
              </Typography>
            </Alert>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label={t('settings.notifications.emailPlaceholder', 'Enter email address')}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              type="email"
            />
            <Button
              variant="contained"
              onClick={handleAddEmail}
              startIcon={<Add />}
              disabled={!newEmail.trim()}
            >
              {t('actions.add', 'Add')}
            </Button>
          </Box>

          {emails.length === 0 ? (
            <Alert severity="info">
              {t('settings.notifications.noEmails', 'No notification emails configured. Add an email address to receive contact form notifications.')}
            </Alert>
          ) : (
            <List>
              {emails.map((email, index) => (
                <ListItem
                  key={email}
                  sx={{
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Email sx={{ color: 'primary.main', mr: 1 }} />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {email}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Will receive notifications for all contact form submissions
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={t('settings.notifications.active', 'Active')}
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip title="Remove email">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveEmail(email)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={fetchEmails}
            disabled={saving}
          >
            {t('actions.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : null}
            {t('actions.save', 'Save Changes')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}