import MuiProvider from '@/components/MuiProvider.jsx';
import ClientLayout from '@/components/ClientLayout.jsx';
import './globals.css';
import {Analytics} from '@vercel/analytics/next';

export const metadata = {
    title: 'Mr. Cut',
    description: 'Professional barber shop',
};

export default function RootLayout({children}) {
    return (
        <html lang="en" dir={"rtl"}>
        <head title={"Mr Cut"}>
            <meta name="emotion-insertion-point" content=""/>
        </head>
        <body>
        <MuiProvider>
            <Analytics/>
            <ClientLayout>
                {children}
            </ClientLayout>
        </MuiProvider>
        </body>
        </html>
    );
} 