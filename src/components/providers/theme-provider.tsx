'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { ThemeProvider as MuiThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'
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
      <GlobalStyles
        styles={{
          // Apply autofill styles dynamically based on theme
          ...(nextTheme === 'dark' ? {
            'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important',
              WebkitTextFillColor: '#ffffff !important',
              color: '#ffffff !important',
              caretColor: '#ffffff !important',
            },
            'textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus, textarea:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important',
              WebkitTextFillColor: '#ffffff !important',
              color: '#ffffff !important',
              caretColor: '#ffffff !important',
            },
          } : {
            'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.04) inset !important',
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
              color: 'rgba(0, 0, 0, 0.87) !important',
            },
            'textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus, textarea:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.04) inset !important',
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87) !important',
              color: 'rgba(0, 0, 0, 0.87) !important',
            },
          }),
          // Remove focus outlines
          'input:focus, textarea:focus, select:focus': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
          '.MuiInputBase-root.Mui-focused': {
            outline: 'none !important',
            boxShadow: 'none !important',
          },
        }}
      />
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