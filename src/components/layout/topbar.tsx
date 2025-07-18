'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Badge,
  Menu,
  MenuItem,
  alpha,
  styled,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  LightMode,
  DarkMode,
  Language,
  AccountCircle,
} from '@mui/icons-material'

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'light' 
    ? alpha(theme.palette.common.black, 0.04) 
    : alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? alpha(theme.palette.common.black, 0.08)
      : alpha(theme.palette.common.white, 0.25),
  },
  border: `1px solid ${theme.palette.divider}`,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
}))

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const { i18n, t } = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleLanguageMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    handleLanguageMenuClose()
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        ml: { md: '280px' },
        width: { md: 'calc(100% - 280px)' },
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' }, color: 'action.active' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search */}
        <SearchWrapper>
          <SearchIconWrapper>
            <Search sx={{ color: 'action.active' }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={t('actions.search', 'Search...')}
            inputProps={{ 'aria-label': 'search' }}
          />
        </SearchWrapper>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme toggle */}
          <Tooltip title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              sx={{ color: 'action.active' }}
            >
              {theme === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Language selector */}
          <Tooltip title="Change language">
            <IconButton
              onClick={handleLanguageMenuOpen}
              sx={{ color: 'action.active' }}
            >
              <Language />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'action.active' }}>
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton sx={{ color: 'action.active' }}>
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Language Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleLanguageMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => handleLanguageChange('en')}
            selected={i18n.language === 'en'}
          >
            English
          </MenuItem>
          <MenuItem
            onClick={() => handleLanguageChange('es')}
            selected={i18n.language === 'es'}
          >
            Español
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}