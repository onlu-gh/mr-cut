import MuiProvider from '@/components/MuiProvider.jsx';
import ClientLayout from '@/components/ClientLayout.jsx';
import './globals.css';
import {Analytics} from '@vercel/analytics/next';
import Script from 'next/script';

export const metadata = {
    title: 'Mr. Cut',
    description: 'Professional barber shop',
};

export default function RootLayout({children}) {
    return (
        <html lang="en" dir={"rtl"}>
        <head title={"Mr Cut"}>
            <title>Mr. Cut</title>
            <Script src="https://cdn.userway.org/widget.js" data-account="hgkM66vd1F" data-position="5"
                    data-color="#B27333" strategy="lazyOnload"/>
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