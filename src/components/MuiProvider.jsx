'use client';

import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {CacheProvider} from '@emotion/react';
import createEmotionCache from './EmotionCache';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale/he';

const clientSideEmotionCache = createEmotionCache();

const theme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: {
            main: '#B87333',
        },
        secondary: {
            main: '#4F8864',
        },
        info: {
            main: '#878787'
        },
    },
});

export default function MuiProvider({children}) {
    return (
        <CacheProvider value={clientSideEmotionCache}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    {children}
                </ThemeProvider>
            </LocalizationProvider>
        </CacheProvider>
    );
} 