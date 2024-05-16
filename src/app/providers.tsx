"use client"

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from "@/theme";
import { AppProvider } from '@/hooks/site-context';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {

    return (
        <AppProvider>
            <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>
                    {children}
                </ThemeProvider>
            </AppRouterCacheProvider>
        </AppProvider>
    );
}