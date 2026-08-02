'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container, Link as MuiLink } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

// Shown at the top of standalone legal/info pages (accessibility, cookie policy)
// only when no user is signed in, so logged-out visitors can get back to login.
export default function BackToLoginLink() {
    const [loggedIn, setLoggedIn] = useState(true); // assume in until the cookie is read, avoids a flash

    useEffect(() => {
        setLoggedIn(Boolean(Cookies.get('userData')));
    }, []);

    if (loggedIn) return null;

    return (
        <Container maxWidth="md" sx={{ pt: 3 }} dir="rtl">
            <MuiLink
                component={Link}
                href="/"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#2D5043',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                }}
            >
                <ArrowRight size={18} />
                חזרה לדף ההתחברות
            </MuiLink>
        </Container>
    );
}
