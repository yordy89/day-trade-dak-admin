import type { Theme as MuiTheme } from '@mui/material/styles';

export type ColorScheme = 'dark' | 'light';

export interface Theme extends MuiTheme {}

declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      950: string;
    };
  }

  interface PaletteOptions {
    neutral?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      950: string;
    };
  }

  interface TypeBackground {
    level1: string;
    level2: string;
    level3: string;
  }
}