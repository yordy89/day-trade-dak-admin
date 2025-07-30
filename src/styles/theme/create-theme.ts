import { createTheme as createMuiTheme, responsiveFontSizes } from '@mui/material/styles';
import { 
  neonBlue, 
  nevada, 
  redOrange, 
  california, 
  kepple, 
  stormGrey,
  darkGreen
} from './colors';

const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.57,
  },
  button: {
    fontWeight: 600,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.66,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    lineHeight: 2.5,
    textTransform: 'uppercase' as const,
  },
  h1: {
    fontWeight: 700,
    fontSize: '3.5rem',
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 700,
    fontSize: '3rem',
    lineHeight: 1.2,
  },
  h3: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
  },
  h4: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.2,
  },
  h5: {
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.2,
  },
  h6: {
    fontWeight: 700,
    fontSize: '1.125rem',
    lineHeight: 1.2,
  },
};

export function createTheme(mode: 'light' | 'dark' = 'dark') {
  const theme = createMuiTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? {
        // Dark mode palette
        primary: {
          main: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          contrastText: '#000000',
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          contrastText: '#ffffff',
        },
        success: {
          main: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
          contrastText: '#ffffff',
        },
        background: {
          default: '#0a0a0a',
          paper: '#141414',
          level1: '#1a1a1a',
          level2: '#1f1f1f',
          level3: '#262626',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a3a3a3',
          disabled: '#737373',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        neutral: nevada,
      } : {
        // Light mode palette
        primary: {
          main: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          contrastText: '#000000',
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          contrastText: '#ffffff',
        },
        success: {
          main: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f9fafb',
          paper: '#ffffff',
          level1: '#f3f4f6',
          level2: '#e5e7eb',
          level3: '#d1d5db',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          disabled: '#9ca3af',
        },
        divider: 'rgba(0, 0, 0, 0.08)',
        neutral: nevada,
      }),
    },
    typography,
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.08)',
      '0px 1px 5px rgba(0, 0, 0, 0.08)',
      '0px 1px 8px rgba(0, 0, 0, 0.08)',
      '0px 1px 10px rgba(0, 0, 0, 0.08)',
      '0px 1px 14px rgba(0, 0, 0, 0.08)',
      '0px 1px 18px rgba(0, 0, 0, 0.08)',
      '0px 2px 16px rgba(0, 0, 0, 0.08)',
      '0px 3px 14px rgba(0, 0, 0, 0.08)',
      '0px 3px 16px rgba(0, 0, 0, 0.08)',
      '0px 4px 18px rgba(0, 0, 0, 0.08)',
      '0px 4px 20px rgba(0, 0, 0, 0.08)',
      '0px 5px 22px rgba(0, 0, 0, 0.08)',
      '0px 5px 24px rgba(0, 0, 0, 0.08)',
      '0px 5px 26px rgba(0, 0, 0, 0.08)',
      '0px 6px 28px rgba(0, 0, 0, 0.08)',
      '0px 6px 30px rgba(0, 0, 0, 0.08)',
      '0px 6px 32px rgba(0, 0, 0, 0.08)',
      '0px 7px 34px rgba(0, 0, 0, 0.08)',
      '0px 7px 36px rgba(0, 0, 0, 0.08)',
      '0px 8px 38px rgba(0, 0, 0, 0.08)',
      '0px 8px 40px rgba(0, 0, 0, 0.08)',
      '0px 8px 42px rgba(0, 0, 0, 0.08)',
      '0px 9px 44px rgba(0, 0, 0, 0.08)',
      '0px 9px 46px rgba(0, 0, 0, 0.08)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
          sizeLarge: {
            padding: '12px 24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            ...(mode === 'dark' ? {
              border: '1px solid rgba(255, 255, 255, 0.05)',
            } : {
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            MozOsxFontSmoothing: 'grayscale',
            WebkitFontSmoothing: 'antialiased',
            height: '100%',
            width: '100%',
          },
          body: {
            height: '100%',
            width: '100%',
          },
          '#__next': {
            height: '100%',
            width: '100%',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
            '& input': {
              '&:focus': {
                outline: 'none !important',
                boxShadow: 'none !important',
              },
              '&:focus-visible': {
                outline: 'none !important',
              },
              '&:-webkit-autofill': {
                WebkitBoxShadow: mode === 'dark' 
                  ? '0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important'
                  : '0 0 0 1000px rgba(0, 0, 0, 0.04) inset !important',
                WebkitTextFillColor: mode === 'dark' 
                  ? '#ffffff !important' 
                  : 'rgba(0, 0, 0, 0.87) !important',
                caretColor: mode === 'dark' 
                  ? '#ffffff !important' 
                  : 'rgba(0, 0, 0, 0.87) !important',
                transition: 'background-color 5000s ease-in-out 0s',
              },
              '&:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                WebkitBoxShadow: mode === 'dark' 
                  ? '0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important'
                  : '0 0 0 1000px rgba(0, 0, 0, 0.04) inset !important',
                WebkitTextFillColor: mode === 'dark' 
                  ? '#ffffff !important' 
                  : 'rgba(0, 0, 0, 0.87) !important',
              },
            },
            '& textarea': {
              '&:focus': {
                outline: 'none !important',
                boxShadow: 'none !important',
              },
              '&:focus-visible': {
                outline: 'none !important',
              },
              '&:-webkit-autofill': {
                WebkitBoxShadow: mode === 'dark' 
                  ? '0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important'
                  : '0 0 0 1000px rgba(0, 0, 0, 0.04) inset !important',
                WebkitTextFillColor: mode === 'dark' 
                  ? '#ffffff !important' 
                  : 'rgba(0, 0, 0, 0.87) !important',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              borderWidth: 1,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
          },
          notchedOutline: {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined' as const,
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}