'use client';

import React, {useEffect, useState} from 'react';
import {Box, Button, Card, CardContent, CardHeader, Grid, Typography,} from '@mui/material';
import {endOfDay, format, isToday, parseISO, startOfDay} from 'date-fns';
import {UniqueWorkingHours} from '@/entities/UniqueWorkingHours';

const APPOINTMENT_TIME_SLOT_TO_HOUR_RATIO = 0.5;

const AvailableSlotsCard = ({selectedBarber, selectedDate, selectedTime, onSlotSelect}) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [_, setExistingAppointments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedBarber || !selectedDate) return;

            setLoading(true);
            try {
                // Fetch barber's working hours
                const barberResponse = await fetch(`/api/barbers/${selectedBarber.id}`);
                const barberData = await barberResponse.json();

                // Fetch existing appointments for the selected date
                const appointmentsResponse = await fetch(
                    `/api/appointments?barberId=${selectedBarber.id}&startDate=${startOfDay(selectedDate)}&endDate=${endOfDay(selectedDate)}`
                );
                const appointments = await appointmentsResponse.json();
                setExistingAppointments(appointments);

                const uniqueWorkingHours = await UniqueWorkingHours.getOne({
                    barberId: selectedBarber.id,
                    date: selectedDate,
                });

                // Get current date and time
                const today = new Date();
                const currentHour = today.getHours();

                // Generate available slots based on working hours
                const generateSlots = (startTime, endTime) => {
                    const slots = [];
                    const [startHour, startMinutes] = startTime.split(':').map(Number);
                    const [endHour, endMinutes] = endTime.split(':').map(Number);

                    for (let hour = startHour + startMinutes / 60; hour < endHour + endMinutes / 60; hour += APPOINTMENT_TIME_SLOT_TO_HOUR_RATIO) {
                        const minutes = (hour % 1 > 0 ? hour % 1 * 60 : 0);
                        const timeString = `${Math.floor(hour).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        // Only add future slots for today
                        if (isToday(selectedDate) && hour <= currentHour) continue;
                        slots.push(timeString);
                    }
                    return slots;
                };

                // Get the day of week for the selected date
                const selectedDateObj = selectedDate ? parseISO(selectedDate) : today;
                const dayOfWeek = format(selectedDateObj, 'EEEE').toLowerCase();
                const dayWorkingHours = {
                    ...barberData.workingHours?.[dayOfWeek],
                    ...uniqueWorkingHours,
                    start: uniqueWorkingHours?.start ?? barberData.workingHours?.[dayOfWeek]?.start,
                    end: uniqueWorkingHours?.end ?? barberData.workingHours?.[dayOfWeek]?.end,
                };

                if (dayWorkingHours.start && dayWorkingHours.end) {
                    const slots = generateSlots(dayWorkingHours.start, dayWorkingHours.end);

                    // Filter out booked slots
                    const bookedTimes = appointments.filter(apt => (
                        apt.barber_id === selectedBarber.id
                    )).map((apt => (apt.time)));

                    // Filter out any slots that are already booked
                    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot) && !dayWorkingHours.middayWindows?.includes(slot));

                    setAvailableSlots(availableSlots);
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setAvailableSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedBarber, selectedDate]);

    const isSlotAvailable = (slot) => {
        // Check if the slot is in the available slots list
        return availableSlots.includes(slot);
    };

    if (!selectedBarber) {
        return (
            <Card className="mb-6">
                <CardContent>
                    <Typography>* עליך לבחור ספר</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader
                title={selectedDate ? "זמנים פנויים" : ""}
            />
            <CardContent>
                {loading ? (
                    <Typography>טוען תורים...</Typography>
                ) : (
                    <Box>
                        {availableSlots.length > 0 ? (
                            <Box className="mt-6">
                                <Grid container spacing={2}>
                                    {availableSlots.map((slot) => (
                                        <Grid item xs={4} key={slot}>
                                            <Button
                                                variant={selectedTime === slot ? "contained" : "outlined"}
                                                fullWidth
                                                onClick={() => {
                                                    if (isSlotAvailable(slot)) {
                                                        onSlotSelect(slot);
                                                    }
                                                }}
                                                disabled={!isSlotAvailable(slot)}
                                                sx={{
                                                    color: selectedTime === slot ? 'white' : '#2D5043',
                                                    borderColor: '#2D5043',
                                                    '&:hover': {
                                                        backgroundColor: '#2D5043',
                                                        color: 'white',
                                                        borderColor: '#2D5043'
                                                    },
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(0, 0, 0, 0.26)',
                                                        borderColor: 'rgba(0, 0, 0, 0.12)'
                                                    }
                                                }}
                                            >
                                                {slot}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : (
                            (selectedDate && selectedBarber) && (
                                <Typography>
                                    {`אין תורים זמינים ל${selectedBarber.firstName} ${selectedBarber.lastName} בתאריך הנבחר`}
                                </Typography>
                            )
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default AvailableSlotsCard; 