'use client';

import React, {useState, useEffect} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    Button,
    Grid,
} from '@mui/material';
import {format, addDays, parseISO, isToday, isTomorrow} from 'date-fns';

const APPOINTMENT_TIME_SLOT_TO_HOUR_RATIO = 0.5;

const AvailableSlotsCard = ({selectedBarber, selectedDate, onSlotSelect}) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [nextWorkingDay, setNextWorkingDay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [_, setExistingAppointments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            console.log(selectedDate)
            if (!selectedBarber || !selectedDate) return;

            setLoading(true);
            try {
                // Fetch barber's working hours
                const barberResponse = await fetch(`/api/barbers/${selectedBarber.id}`);
                const barberData = await barberResponse.json();
                const workingHours = barberData.working_hours;

                // Fetch existing appointments for the selected date
                const appointmentsResponse = await fetch(
                    `/api/appointments?barberId=${selectedBarber.id}&date=${selectedDate}`
                );
                const appointments = await appointmentsResponse.json();
                setExistingAppointments(appointments);

                // Get current date and time
                const today = new Date();
                const currentHour = today.getHours();

                // Generate available slots based on working hours
                const generateSlots = (startTime, endTime) => {
                    const slots = [];
                    const [startHour] = startTime.split(':').map(Number);
                    const [endHour] = endTime.split(':').map(Number);

                    for (let hour = startHour; hour < endHour; hour += APPOINTMENT_TIME_SLOT_TO_HOUR_RATIO) {
                        const timeString = `${Math.floor(hour).toString().padStart(2, '0')}:${hour%1 > 0 ? hour%1 * 60 : '00'}`;
                        // Only add future slots for today
                        if (isToday(selectedDate) && hour <= currentHour) continue;
                        slots.push(timeString);
                    }
                    return slots;
                };

                // Get the day of week for the selected date
                const selectedDateObj = selectedDate ? parseISO(selectedDate) : today;
                const dayOfWeek = format(selectedDateObj, 'EEEE').toLowerCase();
                const dayWorkingHours = workingHours[dayOfWeek];

                if (dayWorkingHours) {
                    const slots = generateSlots(dayWorkingHours.start, dayWorkingHours.end);

                    // Filter out booked slots
                    const bookedTimes = appointments.filter(apt => (
                        apt.barber_id === selectedBarber.id
                    )).map((apt=>(apt.time)));

                    // Filter out any slots that are already booked
                    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

                    setAvailableSlots(availableSlots);
                } else {
                    setAvailableSlots([]);
                }

                // Find next working day
                let nextDay = today;
                let daysChecked = 0;
                while (!workingHours[format(nextDay, 'EEEE').toLowerCase()] && daysChecked < 14) {
                    nextDay = addDays(nextDay, 1);
                    daysChecked++;
                }
                setNextWorkingDay(nextDay);

            } catch (error) {
                console.error('Error fetching data:', error);
                setAvailableSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedBarber, selectedDate]);

    const formatDateDisplay = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'EEEE, MMMM d');
    };

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
                        {!selectedDate && nextWorkingDay && (
                            <Typography variant="h6" className="mb-4">
                                Next available: {formatDateDisplay(nextWorkingDay)}
                            </Typography>
                        )}

                        {availableSlots.length > 0 ? (
                            <Box className="mt-6">
                                <Grid container spacing={2}>
                                    {availableSlots.map((slot) => (
                                        <Grid item xs={4} key={slot}>
                                            <Button
                                                variant={selectedSlot === slot ? "contained" : "outlined"}
                                                fullWidth
                                                onClick={() => {
                                                    if (isSlotAvailable(slot)) {
                                                        setSelectedSlot(slot);
                                                        onSlotSelect(slot);
                                                    }
                                                }}
                                                disabled={!isSlotAvailable(slot)}
                                                sx={{
                                                    color: selectedSlot === slot ? 'white' : '#2D5043',
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