'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { useMemo } from 'react'
import { createTheme } from '@/styles/theme/create-theme'
import { useTheme } from 'next-themes'
import { SnackbarProvider } from 'notistack'

function MuiProvider({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme } = useTheme()
  const muiTheme = useMemo(
    () => createTheme(nextTheme === 'dark' || nextTheme === 'system' ? 'dark' : 'light'),
    [nextTheme]
  )

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={5000}
      >
        {children}
      </SnackbarProvider>
    </MuiThemeProvider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <MuiProvider>{children}</MuiProvider>
    </NextThemesProvider>
  )
}