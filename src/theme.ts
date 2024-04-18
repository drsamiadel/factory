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
    palette: {
        background: {
            default: '#f2f4f6',
        },
        primary: {
            main: '#1f2937',
            light: '#e4e7eb',
        },
        secondary: {
            main: '#f8bd7a',
        },
        action: {
            hover: 'rgb(215 215 215 / 42%)'
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 20,
                },
            },
            variants: [
                {
                    props: { variant: 'contained', color: 'primary' },
                    style: {
                        color: 'white',
                    },
                },
            ],
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px rgb(0 0 0 / 5%)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px rgb(0 0 0 / 5%)',
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #e4e7eb',
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    fontSize: 20,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 20,
                    },
                    backgroundColor: 'white',
                    borderRadius: 20,
                },
            },
        },
        MuiTableSortLabel: {
            styleOverrides: {
                root: {
                    color: 'inherit',
                },
                icon: {
                    color: 'white',
                    ":active": {
                        color: 'white',
                    },
                }
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                shrink: {
                    color: 'black',
                    fontWeight: 550,
                    fontSize: '1rem',
                },
            },
        },
    },
});

export default theme;