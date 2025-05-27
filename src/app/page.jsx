'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {TextField, Button, Box, Typography, Container, Alert} from '@mui/material';
import Cookies from 'js-cookie';

export default function Login() {
    const router = useRouter();
    const [phone_number, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const userData = Cookies.get("userData");
            if (userData) {
                await submit(JSON.parse(decodeURI(userData)).phone_number);
            }
            setIsLoading(false);
        })();
    }, []);

    const validatePhoneNumber = (phone) => {
        // This regex allows for:
        // - Optional country code starting with +
        // - 10 digits for the main number
        // - Optional spaces, dashes, or dots as separators
        const phoneRegex = /^\+?[\d\s.-]{10,}$/;
        return phoneRegex.test(phone);
    };

    async function submit(phoneNumber, e) {
        e?.preventDefault();
        setError('');
        setIsLoading(true);

        // Validate phone number format
        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({phone_number: phoneNumber}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            Cookies.set('userData', JSON.stringify(data.user));
            if (data.user.role === 'BARBER' || data.user.role === 'ADMIN') {
                router.push('/management');
            } else {
                router.push('/home');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        await submit(phone_number, e);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Image
                    src="/mrcut.png"
                    alt="Mr. Cut"
                    width={150}
                    height={150}
                    priority
                    style={{borderRadius: '50%'}}
                />
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        mt: 3,
                        fontWeight: 'bold',
                        color: '#2D5043',
                        textAlign: 'center'
                    }}
                >
                    MR. CUT
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 1, width: '100%'}}>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone_number"
                        label="טלפון"
                        name="phone_number"
                        autoComplete="tel"
                        autoFocus
                        value={phone_number}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#2D5043',
                                },
                            },
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            bgcolor: '#2D5043',
                            py: 1.5,
                            fontSize: '1.1rem',
                            '&:hover': {
                                bgcolor: '#1A3028',
                            },
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מתחבר...' : 'התחבר'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
} 