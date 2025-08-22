'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Menu,
  MenuItem,
  alpha,
  styled,
  Tooltip,
  Divider,
  Typography,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search,
  LightMode,
  DarkMode,
  Language,
  AccountCircle,
  Check,
  KeyboardArrowDown,
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

// Language configuration with flags
const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    flagUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    flagUrl: 'https://flagcdn.com/w40/es.png',
  },
]

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const { i18n, t } = useTranslation('common')
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

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

          {/* Enhanced Language selector */}
          <Button
            onClick={handleLanguageMenuOpen}
            startIcon={
              <Box
                component="img"
                src={currentLanguage.flagUrl}
                alt={currentLanguage.name}
                sx={{
                  width: 20,
                  height: 15,
                  borderRadius: '2px',
                  objectFit: 'cover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            }
            endIcon={<KeyboardArrowDown />}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {currentLanguage.nativeName}
            </Typography>
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton sx={{ color: 'action.active' }}>
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Enhanced Language Menu */}
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
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 180,
              mt: 1.5,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
                borderRadius: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&.Mui-selected': {
                  backgroundColor: alpha('#1976d2', 0.08),
                  '&:hover': {
                    backgroundColor: alpha('#1976d2', 0.12),
                  },
                },
              },
            },
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={i18n.language === language.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                <Box
                  component="img"
                  src={language.flagUrl}
                  alt={language.name}
                  sx={{
                    width: 24,
                    height: 18,
                    borderRadius: '3px',
                    objectFit: 'cover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={language.nativeName}
                secondary={language.name}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: i18n.language === language.code ? 600 : 400,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                }}
              />
              {i18n.language === language.code && (
                <Check
                  sx={{
                    fontSize: 18,
                    color: 'primary.main',
                    ml: 'auto',
                  }}
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}