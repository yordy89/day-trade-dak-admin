'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Campaign,
  CheckCircle,
  Schedule,
  Archive,
  Warning,
  TrendingUp,
  AttachMoney,
  NewReleases,
  Update,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Announcement, AnnouncementType, AnnouncementPriority, AnnouncementStatus } from '@/types/announcement';

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onViewStats: (id: string) => void;
}

const getTypeIcon = (type: AnnouncementType) => {
  switch (type) {
    case AnnouncementType.FED_MEETING:
      return <TrendingUp />;
    case AnnouncementType.EARNINGS:
      return <AttachMoney />;
    case AnnouncementType.MARKET_NEWS:
      return <NewReleases />;
    case AnnouncementType.PLATFORM_UPDATE:
      return <Update />;
    default:
      return <Info />;
  }
};

const getTypeColor = (type: AnnouncementType) => {
  switch (type) {
    case AnnouncementType.FED_MEETING:
      return 'primary';
    case AnnouncementType.EARNINGS:
      return 'success';
    case AnnouncementType.MARKET_NEWS:
      return 'warning';
    case AnnouncementType.PLATFORM_UPDATE:
      return 'info';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: AnnouncementPriority) => {
  switch (priority) {
    case AnnouncementPriority.CRITICAL:
      return 'error';
    case AnnouncementPriority.HIGH:
      return 'warning';
    case AnnouncementPriority.MEDIUM:
      return 'primary';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: AnnouncementStatus) => {
  switch (status) {
    case AnnouncementStatus.ACTIVE:
      return <CheckCircle color="success" />;
    case AnnouncementStatus.SCHEDULED:
      return <Schedule color="info" />;
    case AnnouncementStatus.EXPIRED:
      return <Archive color="disabled" />;
    case AnnouncementStatus.DRAFT:
      return <Edit color="action" />;
    default:
      return <Archive color="disabled" />;
  }
};

export default function AnnouncementList({
  announcements,
  onEdit,
  onDelete,
  onToggleActive,
  onViewStats
}: AnnouncementListProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Active</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date Range</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>CTR</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {announcements
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((announcement) => {
              const ctr = announcement.viewCount > 0
                ? ((announcement.clickCount / announcement.viewCount) * 100).toFixed(1)
                : '0';

              return (
                <TableRow key={announcement._id}>
                  <TableCell>
                    <Switch
                      checked={announcement.isActive}
                      onChange={(e) => onToggleActive(announcement._id, e.target.checked)}
                      color="primary"
                      disabled={announcement.status === AnnouncementStatus.EXPIRED}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {announcement.isActive && (
                        <Chip
                          label="ACTIVE"
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {announcement.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(announcement.type)}
                      label={announcement.type.replace('_', ' ').toUpperCase()}
                      size="small"
                      color={getTypeColor(announcement.type) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.priority.toUpperCase()}
                      size="small"
                      color={getPriorityColor(announcement.priority) as any}
                      variant={announcement.priority === AnnouncementPriority.CRITICAL ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getStatusIcon(announcement.status)}
                      <Typography variant="caption">
                        {announcement.status.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {format(new Date(announcement.startDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      to {format(new Date(announcement.endDate), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>{announcement.viewCount.toLocaleString()}</TableCell>
                  <TableCell>{ctr}%</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Statistics">
                      <IconButton size="small" onClick={() => onViewStats(announcement._id)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(announcement)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(announcement._id)} color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={announcements.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}