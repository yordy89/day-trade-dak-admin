import { createTheme as createMuiTheme, responsiveFontSizes } from '@mui/material/styles';
import { 
  neonBlue, 
  nevada, 
  redOrange, 
  shakespeare, 
  california, 
  kepple, 
  stormGrey,
  principal 
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
          main: kepple[400],
          light: kepple[300],
          dark: kepple[500],
          contrastText: '#000000',
        },
        secondary: {
          main: nevada[200],
          light: nevada[100],
          dark: nevada[300],
          contrastText: '#000000',
        },
        error: {
          main: redOrange[400],
          light: redOrange[300],
          dark: redOrange[500],
          contrastText: '#000000',
        },
        warning: {
          main: california[500],
          light: california[400],
          dark: california[600],
          contrastText: '#000000',
        },
        info: {
          main: shakespeare[400],
          light: shakespeare[300],
          dark: shakespeare[500],
          contrastText: '#000000',
        },
        success: {
          main: kepple[500],
          light: kepple[400],
          dark: kepple[600],
          contrastText: '#000000',
        },
        background: {
          default: stormGrey[950],
          paper: stormGrey[900],
          level1: stormGrey[800],
          level2: stormGrey[700],
          level3: stormGrey[600],
        },
        text: {
          primary: stormGrey[100],
          secondary: stormGrey[400],
          disabled: stormGrey[600],
        },
        divider: stormGrey[700],
        neutral: nevada,
      } : {
        // Light mode palette
        primary: {
          main: kepple[500],
          light: kepple[400],
          dark: kepple[600],
          contrastText: '#ffffff',
        },
        secondary: {
          main: nevada[600],
          light: nevada[400],
          dark: nevada[800],
          contrastText: '#ffffff',
        },
        error: {
          main: redOrange[600],
          light: redOrange[400],
          dark: redOrange[800],
          contrastText: '#ffffff',
        },
        warning: {
          main: california[600],
          light: california[400],
          dark: california[800],
          contrastText: '#ffffff',
        },
        info: {
          main: shakespeare[600],
          light: shakespeare[400],
          dark: shakespeare[800],
          contrastText: '#ffffff',
        },
        success: {
          main: kepple[600],
          light: kepple[400],
          dark: kepple[800],
          contrastText: '#ffffff',
        },
        background: {
          default: stormGrey[50],
          paper: '#ffffff',
          level1: stormGrey[100],
          level2: stormGrey[200],
          level3: stormGrey[300],
        },
        text: {
          primary: nevada[900],
          secondary: nevada[700],
          disabled: nevada[400],
        },
        divider: nevada[200],
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
    },
  });

  return responsiveFontSizes(theme);
}