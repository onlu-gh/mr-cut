'use client';

import {format, isBefore, setHours, setMinutes, startOfWeek} from "date-fns";
import React, {useEffect, useState} from 'react';
import {Box, Button, Card, CardActions, CardContent, Grid, Typography} from '@mui/material';
import {Calendar, Scissors, User} from 'lucide-react';
import Cookies from 'js-cookie';
import {getTranslations} from '@/translations';
import WeekView from '@/components/WeekView/WeekView';
import localizeIL from '@/lib/he-IL-localize';
import {Barber} from '@/entities/Barber';

const t = getTranslations(true);

export default function ManagementDashboard() {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [barbers, setBarbers] = useState(undefined);
    const [selectedBarber, setSelectedBarber] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(Cookies.get('userData') || '{}');
        setUser(userData);

        if (!userData.id || (userData.role !== 'ADMIN' && userData.role !== 'BARBER')) {
            throw new Error('לא נמצא מידע עבור המשתמש המחובר');
        } else {
            void loadAppointments(userData);

            (async function () {
                if (userData.role === 'ADMIN') {
                    const barbers = await loadBarbers();
                    setBarbers(barbers);
                    setSelectedBarber(barbers.find((b) => b.id === userData.id));
                } else if (userData.role === 'BARBER') {
                    setSelectedBarber(await Barber.getById(userData.id));
                }
            })();
        }
    }, []);

    const loadBarbers = async () => {
        try {
            return await Barber.getAll();
        } catch (error) {
            setError('Failed to load barbers');
        }
    };

    const loadAppointments = async (userData) => {
        try {
            // Get user data from cookie

            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // Fetch appointments with barber ID (which is the same as user ID in our schema)
            const response = await fetch(`/api/appointments?date=${today}${userData.role === 'BARBER' ? `&barberId=${userData.id}` : ''}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load appointments');
            }

            const appointments = await response.json();

            // Filter and sort upcoming appointments
            const upcoming = appointments
                .filter(app => new Date(app.dateTime) > new Date())
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                .slice(0, 5); // Show only next 5 appointments
            setUpcomingAppointments(upcoming);
        } catch (error) {
            console.error('Error loading appointments:', error);
            setError(error.message || 'Failed to load appointments');
        }
    };

    const managementCards = [
        {
            title: t.appointmentManagement,
            icon: <Calendar size={24}/>,
            href: '/management/appointments',
            color: '#B87333'
        },
        {
            title: t.barberManagement,
            icon: <User size={24}/>,
            href: '/management/barbers',
            color: '#AFBFAD'
        }
    ];

    if (user?.role === 'ADMIN') {
        managementCards.push(
            {
                title: t.serviceManagement,
                icon: <Scissors size={24}/>,
                href: '/management/services',
                color: '#2D5043',
            }
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                ניהול
            </Typography>

            {error && (
                <Typography color="error" sx={{mb: 2}}>
                    {error}
                </Typography>
            )}

            <WeekView
                barbers={barbers}
                selectedBarberId={selectedBarber?.id}
                onBarberChange={setSelectedBarber}
                locale={{code: 'he-IL', localize: localizeIL}}
                initialDate={new Date()}
                weekStartsOn={0}
                disabledCell={(date) => {
                    return isBefore(date, new Date());
                }}
                disabledWeek={(startDayOfWeek) => {
                    return isBefore(startDayOfWeek, startOfWeek(new Date()));
                }}
                events={[
                    {
                        id: "1",
                        title: "Meeting",
                        startDate: setMinutes(setHours(new Date(), 15), 15),
                        endDate: setMinutes(setHours(new Date(), 16), 20),
                    },
                ]}
                onCellClick={(cell) => alert(`Clicked ${format(cell.date, "Pp")}`)}
                onEventClick={(event) =>
                    alert(
                        `${event.title} ${format(event.startDate, "Pp")} - ${format(
                            event.endDate,
                            "Pp"
                        )}`
                    )
                }
            />

            <Grid container spacing={3}>
                {/* Management Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {managementCards.reverse().map((card) => (
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