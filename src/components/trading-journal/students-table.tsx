'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Avatar,
  Chip,
  IconButton,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
} from '@mui/material'
import {
  Search,
  Visibility,
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material'
import { StudentWithJournal } from '@/types/trading-journal'
import { format } from 'date-fns'

interface StudentsTableProps {
  students: StudentWithJournal[]
  loading?: boolean
}

export function StudentsTable({ students, loading }: StudentsTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    )
  })

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/trading-journal/students/${studentId}`)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell align="center">Total Trades</TableCell>
              <TableCell align="center">Win Rate</TableCell>
              <TableCell align="right">Total P&L</TableCell>
              <TableCell align="center">Last Trade</TableCell>
              <TableCell align="center">Needs Review</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading students...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? 'No students found matching your search'
                      : 'No students with trading journals yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow
                  key={student._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewStudent(student._id)}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(student.firstName, student.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={student.totalTrades}
                      size="small"
                      color={student.totalTrades > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          (student.winRate || 0) >= 50
                            ? 'success.main'
                            : (student.winRate || 0) >= 40
                            ? 'warning.main'
                            : 'error.main'
                        }
                      >
                        {(student.winRate || 0).toFixed(1)}%
                      </Typography>
                      {(student.winRate || 0) >= 50 ? (
                        <TrendingUp fontSize="small" color="success" />
                      ) : (
                        <TrendingDown fontSize="small" color="error" />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={(student.totalPnl || 0) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(student.totalPnl || 0)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="caption" color="text.secondary">
                      {student.lastTradeDate
                        ? format(new Date(student.lastTradeDate), 'MMM d, yyyy')
                        : 'Never'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    {student.needsReview > 0 ? (
                      <Tooltip title={`${student.needsReview} trades need review`}>
                        <Badge badgeContent={student.needsReview} color="error">
                          <Warning color="warning" />
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Chip label="All reviewed" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="View Journal">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewStudent(student._id)
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredStudents.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  )
}
