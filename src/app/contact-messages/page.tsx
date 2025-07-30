'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
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
  MenuItem,
  Grid,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  Archive,
  Email,
  Phone,
  Category,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { contactService, ContactMessage, ContactMessageQuery } from '@/services/api/contact.service';

const getInquiryTypeColor = (type: string) => {
  const colors = {
    general: 'default',
    technical: 'info',
    billing: 'warning',
    partnership: 'secondary',
    media: 'primary',
    other: 'default',
  };
  return colors[type as keyof typeof colors] || 'default';
};

const getStatusColor = (status: string) => {
  const colors = {
    unread: 'error',
    read: 'success',
    archived: 'default',
  };
  return colors[status as keyof typeof colors] || 'default';
};

import { AdminLayout } from '@/components/layout/admin-layout';

export default function ContactMessagesPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<ContactMessageQuery>({});
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; message: ContactMessage | null }>({
    open: false,
    message: null,
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactService.getMessages({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
      });
      setMessages(response.messages);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (key: keyof ContactMessageQuery, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(0);
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        const updated = await contactService.updateMessage(message._id, 'read');
        setMessages(prev => prev.map(m => m._id === message._id ? updated : m));
        setSelectedMessage(updated);
      } catch (err) {
        console.error('Error updating message status:', err);
      }
    }
  };

  const handleUpdateStatus = async (message: ContactMessage, status: 'unread' | 'read' | 'archived') => {
    try {
      const updated = await contactService.updateMessage(message._id, status);
      setMessages(prev => prev.map(m => m._id === message._id ? updated : m));
      if (selectedMessage?._id === message._id) {
        setSelectedMessage(updated);
      }
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.message) return;
    
    try {
      await contactService.deleteMessage(deleteDialog.message._id);
      setMessages(prev => prev.filter(m => m._id !== deleteDialog.message?._id));
      setDeleteDialog({ open: false, message: null });
      if (selectedMessage?._id === deleteDialog.message._id) {
        setSelectedMessage(null);
      }
      // Refresh to update pagination
      fetchMessages();
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    const labels = {
      general: 'General',
      technical: 'Technical Support',
      billing: 'Billing',
      partnership: 'Partnership',
      media: 'Media',
      other: 'Other',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading && messages.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Contact Messages
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Inquiry Type"
              value={filters.inquiryType || ''}
              onChange={(e) => handleFilterChange('inquiryType', e.target.value)}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="technical">Technical Support</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="partnership">Partnership</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="Start Date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              fullWidth
              label="End Date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Messages Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow 
                  key={message._id}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    fontWeight: message.status === 'unread' ? 600 : 400,
                  }}
                >
                  <TableCell>
                    {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getInquiryTypeLabel(message.inquiryType)}
                      color={getInquiryTypeColor(message.inquiryType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.status}
                      color={getStatusColor(message.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {message.status === 'unread' && (
                      <Tooltip title="Mark as Read">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateStatus(message, 'read')}
                        >
                          <MarkEmailRead />
                        </IconButton>
                      </Tooltip>
                    )}
                    {message.status === 'read' && (
                      <Tooltip title="Mark as Unread">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateStatus(message, 'unread')}
                        >
                          <MarkEmailUnread />
                        </IconButton>
                      </Tooltip>
                    )}
                    {message.status !== 'archived' && (
                      <Tooltip title="Archive">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateStatus(message, 'archived')}
                        >
                          <Archive />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, message })}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Message Details</Typography>
                <Chip
                  label={selectedMessage.status}
                  color={getStatusColor(selectedMessage.status) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMessage.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(new Date(selectedMessage.createdAt), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                  </Typography>
                </Grid>
                {selectedMessage.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <Category sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Inquiry Type
                  </Typography>
                  <Chip
                    label={getInquiryTypeLabel(selectedMessage.inquiryType)}
                    color={getInquiryTypeColor(selectedMessage.inquiryType) as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Message
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      bgcolor: 'action.hover',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    {selectedMessage.message}
                  </Typography>
                </Grid>
                {selectedMessage.readAt && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Read at: {format(new Date(selectedMessage.readAt), 'PPpp')}
                      {selectedMessage.readBy && ` by ${selectedMessage.readBy}`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                href={`mailto:${selectedMessage.email}`}
                target="_blank"
                startIcon={<Email />}
              >
                Reply via Email
              </Button>
              <Button onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, message: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, message: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AdminLayout>
  );
}