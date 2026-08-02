'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Backdrop, Box, Card, CardContent, CircularProgress, Grid, Typography} from '@mui/material';
import {Calendar, Megaphone, Scissors, User} from 'lucide-react';
import Cookies from 'js-cookie';
import {getTranslations} from '@/translations';
import {Checklist} from '@mui/icons-material';

const t = getTranslations(true);

export default function ManagementDashboard() {
    const [user, setUser] = useState(null);
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(Cookies.get('userData') || '{}');
        setUser(userData);

        if (!userData.id || (userData.role !== 'ADMIN' && userData.role !== 'BARBER')) {
            throw new Error('לא נמצא מידע עבור המשתמש המחובר');
        }
    }, []);

    const managementCards = [
        {
            title: t.calendar,
            icon: <Calendar size={24}/>,
            href: '/management/calendar',
            color: '#b88333'
        },
        {
            title: t.appointmentManagement,
            icon: <Checklist size={24}/>,
            href: '/management/appointments',
            color: '#d6bf72'
        },
        {
            title: t.barberManagement,
            icon: <User size={24}/>,
            href: '/management/barbers',
            color: '#b9bd84'
        }
    ];

    if (user?.role === 'ADMIN') {
        managementCards.push(
            {
                title: t.serviceManagement,
                icon: <Scissors size={24}/>,
                href: '/management/services',
                color: '#7d9c60',
            },
            {
                title: t.broadcastMessages,
                icon: <Megaphone size={24}/>,
                href: '/management/broadcast',
                color: '#5f8a6a',
            }
        );
    }

    return (
        <Box>
            <Backdrop
                open={navigating}
                sx={{zIndex: (theme) => theme.zIndex.modal + 1}}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Typography variant="h4" component="h1" gutterBottom>
                {t.management}
            </Typography>
            <Grid container spacing={3}>
                {/* Management Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3} justifyContent="center">
                        {managementCards.map((card) => (
                            <Grid item xs={12} sm={6} md={6} key={card.title}>
                                <Link href={card.href}
                                      onClick={() => setNavigating(true)}
                                      style={{textDecoration: 'none', display: 'block', height: '100%'}}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            minHeight: {md: 210},
                                            display: 'flex',
                                            flexDirection: 'column',
                                            background: `linear-gradient(145deg, ${card.color}20, ${card.color}10)`,
                                            border: `1px solid ${card.color}30`,
                                            width: '100%',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                                boxShadow: 3,
                                            }
                                        }}>
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                <Box sx={{
                                                    p: 1,
                                                    borderRadius: '50%',
                                                    bgcolor: `${card.color}20`,
                                                    mr: 2,
                                                    marginLeft: 2,
                                                    display: 'flex',
                                                    '& svg': {
                                                        width: {xs: 24, md: 42},
                                                        height: {xs: 24, md: 42}
                                                    }
                                                }}>
                                                    {card.icon}
                                                </Box>
                                                <Typography variant="h6" component="h2"
                                                            sx={{fontSize: {md: '2.2rem'}}}>
                                                    {card.title}
                                                </Typography>
                                            </Box>
                                            <Typography color="text.secondary">
                                                {card.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}