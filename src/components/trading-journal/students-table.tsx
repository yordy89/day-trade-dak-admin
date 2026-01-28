'use client'

import { useState, useMemo } from 'react'
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
  TableSortLabel,
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
import { useTranslation } from 'react-i18next'
import { StudentWithJournal } from '@/types/trading-journal'
import { format } from 'date-fns'

interface StudentsTableProps {
  students: StudentWithJournal[]
  loading?: boolean
  eventId?: string
}

type SortField = 'name' | 'totalTrades' | 'winRate' | 'totalPnl' | 'lastTradeDate' | 'needsReview'
type SortOrder = 'asc' | 'desc'

export function StudentsTable({ students, loading, eventId }: StudentsTableProps) {
  const { t } = useTranslation('trading-journal')
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalTrades')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setPage(0)
  }

  const sortedAndFilteredStudents = useMemo(() => {
    // First filter
    let result = students.filter((student) => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)
      )
    })

    // Then sort
    result = [...result].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase()
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase()
          comparison = nameA.localeCompare(nameB)
          break
        case 'totalTrades':
          comparison = (a.totalTrades || 0) - (b.totalTrades || 0)
          break
        case 'winRate':
          comparison = (a.winRate || 0) - (b.winRate || 0)
          break
        case 'totalPnl':
          comparison = (a.totalPnl || 0) - (b.totalPnl || 0)
          break
        case 'lastTradeDate':
          const dateA = a.lastTradeDate ? new Date(a.lastTradeDate).getTime() : 0
          const dateB = b.lastTradeDate ? new Date(b.lastTradeDate).getTime() : 0
          comparison = dateA - dateB
          break
        case 'needsReview':
          comparison = (a.needsReview || 0) - (b.needsReview || 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [students, searchTerm, sortField, sortOrder])

  const paginatedStudents = sortedAndFilteredStudents.slice(
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
    const url = eventId
      ? `/trading-journal/students/${studentId}?eventId=${eventId}`
      : `/trading-journal/students/${studentId}`
    router.push(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?'
  }

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('students.searchPlaceholder')}
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
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  {t('students.student')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'totalTrades'}
                  direction={sortField === 'totalTrades' ? sortOrder : 'desc'}
                  onClick={() => handleSort('totalTrades')}
                >
                  {t('students.totalTrades')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'winRate'}
                  direction={sortField === 'winRate' ? sortOrder : 'desc'}
                  onClick={() => handleSort('winRate')}
                >
                  {t('students.winRate')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'totalPnl'}
                  direction={sortField === 'totalPnl' ? sortOrder : 'desc'}
                  onClick={() => handleSort('totalPnl')}
                >
                  {t('students.totalPnl')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'lastTradeDate'}
                  direction={sortField === 'lastTradeDate' ? sortOrder : 'desc'}
                  onClick={() => handleSort('lastTradeDate')}
                >
                  {t('students.lastTrade')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortField === 'needsReview'}
                  direction={sortField === 'needsReview' ? sortOrder : 'desc'}
                  onClick={() => handleSort('needsReview')}
                >
                  {t('students.needsReview')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">{t('students.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {t('students.loading')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? t('students.noSearchResults')
                      : t('students.noStudents')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow
                  key={student._id || student.email}
                  hover
                  sx={{ cursor: student._id ? 'pointer' : 'default' }}
                  onClick={() => student._id && handleViewStudent(student._id)}
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
                        : t('students.never')}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    {student.needsReview > 0 ? (
                      <Tooltip title={t('students.tradesNeedReview', { count: student.needsReview })}>
                        <Badge badgeContent={student.needsReview} color="error">
                          <Warning color="warning" />
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Chip label={t('students.allReviewed')} size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {student._id && (
                      <Tooltip title={t('students.viewJournal')}>
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
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedAndFilteredStudents.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  )
}
