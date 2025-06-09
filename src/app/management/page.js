'use client';

import {addMinutes, endOfWeek, format, isBefore, startOfWeek} from "date-fns";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Typography, useMediaQuery, useTheme} from '@mui/material';
import {Calendar, Scissors, User} from 'lucide-react';
import Cookies from 'js-cookie';
import {getTranslations} from '@/translations';
import WeekView from '@/components/WeekView/WeekView';
import localizeIL from '@/lib/he-IL-localize';
import {Barber} from '@/entities/Barber';
import {Appointment} from '@/entities/Appointment';
import ManagementDialog from '@/components/ManagementDialog';
import {Service} from '@/entities/Service';
import throttle from 'lodash.throttle';

const t = getTranslations(true);

export default function ManagementDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [appointments, setAppointments] = useState([]);
    const [startOfTheWeek, setStartOfTheWeek] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [barbers, setBarbers] = useState(undefined);
    const [services, setServices] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const initialFormData = {
        clientName: '',
        clientPhoneNumber: '',
        date: '',
        time: "",
        serviceId: services?.[0]?.id,
        barberId: barbers?.[0]?.id,
    };

    const [formData, setFormData] = useState();

    useEffect(() => {
        const userData = JSON.parse(Cookies.get('userData') || '{}');
        setUser(userData);

        if (!userData.id || (userData.role !== 'ADMIN' && userData.role !== 'BARBER')) {
            throw new Error('לא נמצא מידע עבור המשתמש המחובר');
        } else {
            void loadServices();

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

    const LoadWeeklyAppointments = useCallback(() => {
        if (selectedBarber && startOfTheWeek) {
            Appointment.get({
                barberId: selectedBarber.id,
                startDate: startOfTheWeek,
                endDate: endOfWeek(startOfTheWeek),
            }).then(res => {
                setAppointments(res);
                console.log(res);
            }).catch((error) => {
                console.error('Error loading appointments:', error);
                setError(error.message || 'Failed to load appointments');
            });
        }
    }, [selectedBarber, startOfTheWeek]);

    const throttledLoadWeeklyAppointments = useMemo(() => throttle(LoadWeeklyAppointments, 3000, {
        leading: true,
        trailing: false
    }), [LoadWeeklyAppointments]);

    useEffect(() => {
        LoadWeeklyAppointments();
        const intervalId = setInterval(LoadWeeklyAppointments, 60000);

        return () => {
            clearInterval(intervalId);
        };
    }, [LoadWeeklyAppointments]);

    const loadBarbers = async () => {
        try {
            return await Barber.getAll();
        } catch (error) {
            setError('Failed to load barbers');
        }

    };
    const loadServices = async () => {
        try {
            setServices(await Service.getAll());
        } catch (error) {
            setError('Failed to load services');
        }

    };
    //
    // useEffect(() => {
    //     LoadWeeklyAppointments();
    // }, [throttledLoadWeeklyAppointments, selectedBarber, startOfTheWeek]);

    const handleStartOfWeekChange = useCallback((startOfWeek) => {
        setStartOfTheWeek(startOfWeek);
    }, []);

    const handleOpenDialog = (item = null, date, time) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({...initialFormData, date, time});
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingItem(null);
        setFormData(initialFormData);
    };

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = async (formData) => {
        try {
            await new Appointment(formData).save();
            LoadWeeklyAppointments();
        } catch (error) {
            setError("Failed to save appointment");
        }
    };

    const handleEdit = async (id, formData) => {
        try {
            const {barberId, serviceId} = formData;

            console.log(formData);

            await new Appointment({
                ...formData,
                barber: barbers.find(b => b.id === barberId),
                service: services.find(s => s.id === serviceId),
                id,
            }).save();
            LoadWeeklyAppointments();
        } catch (error) {
            setError("Failed to update appointment");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await handleEdit(editingItem.id, formData);
            } else {
                await handleAdd(formData);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to save item:', error);
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

    const appointmentFields = [
        {
            name: "clientName",
            label: "שם לקוח",
            required: true,
        },
        {
            name: "clientPhoneNumber",
            label: "טלפון",
            required: true,
        },
        {
            name: "date",
            label: "תאריך",
            type: "date",
            required: true,
        },
        {
            name: "time",
            label: "שעה",
            type: "time",
            required: true,
        },
        {
            name: "barberId",
            label: "ספר",
            type: "select",
            required: true,
            options: barbers?.map((barber) => ({
                value: barber.id,
                label: `${barber.firstName} ${barber.lastName}`
            })), // This should be populated with available services
        },
        {
            name: "serviceId",
            label: "שירות",
            type: "select",
            required: true,
            options: services?.map((service) => ({value: service.id, label: service.name})), // This should be populated
            // with available services
        },
    ];

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
                onReload={throttledLoadWeeklyAppointments}
                barbers={barbers}
                onStartOfWeekChange={handleStartOfWeekChange}
                selectedBarberId={selectedBarber?.id}
                onBarberChange={setSelectedBarber}
                locale={{code: 'he-IL', localize: localizeIL}}
                weekStartsOn={0}
                getWeeklySchedule={(startDayOfWeek) => selectedBarber && Object.values(selectedBarber.workingHours)}
                disabledCell={(date) => {
                    return isBefore(date, new Date());
                }}
                disabledWeek={(startDayOfWeek) => {
                    return isBefore(startDayOfWeek, startOfWeek(new Date()));
                }}
                events={
                    appointments.map(({id, date, time, service}) => {
                        const startDate = new Date(`${date.split("T")[0]}T${time}`);

                        return {
                            id,
                            title: service.name,
                            startDate,
                            endDate: addMinutes(startDate, service.duration_minutes),
                        };
                    })
                }
                onCellClick={(cell) => {
                    handleOpenDialog(null, format(cell.date, 'yyyy-MM-dd'), cell.hourAndMinute);
                    console.log(cell.date);
                }}
                onEventClick={(event) => {
                    handleOpenDialog(appointments.find(({id}) => event.id === id));
                }
                }
            />

            {/*<Grid container spacing={3}>*/}
            {/*    /!* Management Cards *!/*/}
            {/*    <Grid item xs={12}>*/}
            {/*        <Grid container spacing={3}>*/}
            {/*            {managementCards.reverse().map((card) => (*/}
            {/*                <Grid item xs={12} sm={6} md={3} key={card.title}>*/}
            {/*                    <Card*/}
            {/*                        sx={{*/}
            {/*                            height: '100%',*/}
            {/*                            display: 'flex',*/}
            {/*                            flexDirection: 'column',*/}
            {/*                            background: `linear-gradient(145deg, ${card.color}20, ${card.color}10)`,*/}
            {/*                            border: `1px solid ${card.color}30`,*/}
            {/*                            minWidth: '280px',*/}
            {/*                            width: '100%'*/}
            {/*                        }}>*/}
            {/*                        <CardContent sx={{flexGrow: 1}}>*/}
            {/*                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>*/}
            {/*                                <Box sx={{*/}
            {/*                                    p: 1,*/}
            {/*                                    borderRadius: '50%',*/}
            {/*                                    bgcolor: `${card.color}20`,*/}
            {/*                                    mr: 2,*/}
            {/*                                    marginLeft: 2*/}
            {/*                                }}>*/}
            {/*                                    {card.icon}*/}
            {/*                                </Box>*/}
            {/*                                <Typography variant="h6" component="h2">*/}
            {/*                                    {card.title}*/}
            {/*                                </Typography>*/}
            {/*                            </Box>*/}
            {/*                            <Typography color="text.secondary">*/}
            {/*                                {card.description}*/}
            {/*                            </Typography>*/}
            {/*                        </CardContent>*/}
            {/*                        <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>*/}
            {/*                            <CardActions>*/}
            {/*                                <Button*/}
            {/*                                    size="small"*/}
            {/*                                    href={card.href}*/}
            {/*                                    sx={{*/}
            {/*                                        color: card.color,*/}
            {/*                                        '&:hover': {*/}
            {/*                                            bgcolor: `${card.color}10`*/}
            {/*                                        }*/}
            {/*                                    }}>*/}
            {/*                                    בחר*/}
            {/*                                </Button>*/}
            {/*                            </CardActions>*/}
            {/*                        </div>*/}
            {/*                    </Card>*/}
            {/*                </Grid>*/}
            {/*            ))}*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*</Grid>*/}

            {
                formData && appointmentFields &&
                <ManagementDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    title={`${editingItem ? "ערוך" : "הוסף"} תור`}
                    formData={formData}
                    onFormChange={handleFormChange}
                    onSubmit={handleSubmit}
                    fields={appointmentFields}
                    isMobile={isMobile}
                />
            }
        </Box>
    );
}