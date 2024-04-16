'use client';
import { Tajawal } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const tajawal = Tajawal({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: tajawal.style.fontFamily,
    },
  /*
  palette: {
    mode: 'light',
    primary: {
        main: '#004d40',
        light: '#009178',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  */
    palette: {
        background: {
            default: '#e8e8e8',
        },
        primary: {
            main: '#283593',
        },
        secondary: {
            main: '#A1887F',
        },
    },
});

export default theme;