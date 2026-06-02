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
        <title>Mr. Cut</title>
        <script src="https://cdn.userway.org/widget.js" data-account="hgkM66vd1F" data-position="5" data-color="#B27333"/>
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