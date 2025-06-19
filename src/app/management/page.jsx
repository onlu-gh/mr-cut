'use client';

import React, {useEffect, useState} from 'react';
import {Box, Button, Card, CardActions, CardContent, Grid, Typography} from '@mui/material';
import {Calendar, Scissors, User} from 'lucide-react';
import Cookies from 'js-cookie';
import {getTranslations} from '@/translations';
import {Checklist} from '@mui/icons-material';

const t = getTranslations(true);

export default function ManagementDashboard() {
    const [user, setUser] = useState(null);

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
            }
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                {t.management}
            </Typography>
            <Grid container spacing={3}>
                {/* Management Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {managementCards.map((card) => (
                            <Grid item xs={12} sm={6} md={3} key={card.title}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        background: `linear-gradient(145deg, ${card.color}20, ${card.color}10)`,
                                        border: `1px solid ${card.color}30`,
                                        minWidth: '280px',
                                        width: '100%'
                                    }}>
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: '50%',
                                                bgcolor: `${card.color}20`,
                                                mr: 2,
                                                marginLeft: 2
                                            }}>
                                                {card.icon}
                                            </Box>
                                            <Typography variant="h6" component="h2">
                                                {card.title}
                                            </Typography>
                                        </Box>
                                        <Typography color="text.secondary">
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                    <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                href={card.href}
                                                sx={{
                                                    color: card.color,
                                                    '&:hover': {
                                                        bgcolor: `${card.color}10`
                                                    }
                                                }}>
                                                בחר
                                            </Button>
                                        </CardActions>
                                    </div>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}