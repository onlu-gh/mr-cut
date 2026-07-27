"use client";

import React, {useEffect, useRef, useState} from "react";
import {Appointment} from "@/entities/Appointment";
import {Service} from "@/entities/Service";
import {Barber} from "@/entities/Barber";
import {format} from "date-fns";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AvailableSlotsCard from "@/components/AvailableSlotsCard";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import {buildAppointmentEvent} from "@/lib/ics";
import Cookies from "js-cookie";
import {getTranslations} from "@/translations";
import {useRouter} from 'next/navigation';

export default function BookPage() {
    const isHebrew = true;
    const t = getTranslations(isHebrew);
    const router = useRouter();

    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedTime, setSelectedTime] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

    const serviceRef = useRef(null);
    const barberRef = useRef(null);
    const dateTimeRef = useRef(null);
    const submitRef = useRef(null);

    const isFormFullyFilled = name && phone && selectedDate && selectedBarber && selectedService && selectedDate && selectedTime;

    // the AppBar is fixed at 64px, so scroll targets need to clear it or they land underneath
    const scrollTargetSx = {scrollMarginTop: '80px'};

    const scrollToSection = (ref) => {
        // next paint, so the section has rendered its new state before we scroll to it
        requestAnimationFrame(() => {
            ref.current?.scrollIntoView({behavior: "smooth", block: "start"});
        });
    };

    // Blurring an input on mobile closes the soft keyboard, which resizes the visual
    // viewport — and any resize cancels a smooth scroll already in flight. The keyboard
    // slides out over many frames, firing a burst of resize events, so we wait for that
    // burst to go quiet before scrolling rather than reacting to the first event.
    const scrollToSectionAfterKeyboard = (ref) => {
        const viewport = window.visualViewport;

        if (!viewport) {
            scrollToSection(ref);
            return;
        }

        let quietTimer;
        let done = false;

        const scrollOnce = () => {
            if (done) return;
            done = true;
            clearTimeout(quietTimer);
            clearTimeout(giveUp);
            viewport.removeEventListener("resize", onResize);
            scrollToSection(ref);
        };

        // each resize pushes the scroll back; it only runs once they stop arriving
        const onResize = () => {
            clearTimeout(quietTimer);
            quietTimer = setTimeout(scrollOnce, 150);
        };

        // nothing resized at all: desktop, or the keyboard was already dismissed
        const giveUp = setTimeout(scrollOnce, 800);
        viewport.addEventListener("resize", onResize);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [servicesData, barbersData] = await Promise.all([
                    Service.getAll(),
                    Barber.getAll()
                ]);
                setServices(servicesData);
                setBarbers(barbersData);

                // Get user data from cookies
                const userData = Cookies.get("userData");

                if (userData) {
                    const {firstName, lastName, phone_number: phoneNumber} = JSON.parse(decodeURI(userData));
                    setName(firstName ? `${firstName} ${lastName}` : "");
                    setPhone(phoneNumber);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setError(t.failedToLoad);
                setSnackbar({
                    open: true,
                    message: t.failedToLoadData,
                    severity: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [t.failedToLoad, t.failedToLoadData]);

    useEffect(() => {
        setSelectedTime("");
    }, [selectedService, selectedBarber, selectedDate]);

    const handleSubmit = async () => {
        setShowConfirmation(true);
    };

    const handleConfirmBooking = async () => {
        try {
            setIsLoading(true);

            const userData = Cookies.get("userData");

            if (userData) {
                const appointment = new Appointment({
                    clientId: JSON.parse(decodeURI(userData)).id,
                    clientName: name,
                    clientPhoneNumber: phone,
                    serviceId: selectedServiceId,
                    barberId: selectedBarber?.id,
                    date: selectedDate,
                    time: selectedTime,
                    customerName: name,
                    customerPhone: phone,
                });

                await appointment.save();
                setShowConfirmation(false);
                setSnackbar({
                    open: true,
                    message: t.appointmentBookedSuccess,
                    severity: "success",
                });

                setIsLoading(false);
                setShowCalendarPrompt(true);
            }
        } catch (error) {
            console.error("Error creating appointment:", error);
            setSnackbar({
                open: true,
                message: t.failedToBook,
                severity: "error"
            });

            setIsLoading(false);
        }
    };

    const buildCalendarEvent = () => buildAppointmentEvent({
        start: new Date(`${selectedDate}T${selectedTime}:00`),
        durationMinutes: selectedService?.duration_minutes,
        serviceName: selectedService?.name,
        barberFirstName: selectedBarber?.firstName,
        barberLastName: selectedBarber?.lastName,
        withLabel: t.calendarEventWith,
        fallbackTitle: t.bookAnAppointment,
    });

    const handleCalendarPromptDone = () => {
        setShowCalendarPrompt(false);
        router.push('/customer/dashboard');
    };

    const handleCalendarSelected = () => {
        // let the browser start the calendar navigation before we route away,
        // otherwise the client-side redirect can cancel the .ics request
        setTimeout(handleCalendarPromptDone, 600);
    };

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setSelectedServiceId(serviceId);
            setSelectedService(service);
            scrollToSection(barberRef);
        }
    };

    const handleBarberSelect = (barberId) => {
        const barber = barbers.find(b => b.id === barberId);
        if (barber) {
            setSelectedBarber(barber);
            scrollToSection(dateTimeRef);
        }
    };

    const handleSlotSelect = (time) => {
        setSelectedTime(time);
        scrollToSection(submitRef);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return format(new Date(dateString), "PPP");
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    return (
        <Container maxWidth="md" sx={{py: 4}}>
            <Typography
                variant="h4"
                sx={{color: "#2D5043", fontWeight: "bold", mb: 4}}
            >
                {t.bookAnAppointment}
            </Typography>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress sx={{color: "#2D5043"}}/>
                </Box>
            ) : (
                <Stack spacing={3}>
                    <Card>
                        <CardHeader title={t.yourInformation}/>
                        <CardContent>
                            <TextField
                                fullWidth
                                label={t.yourName}
                                value={name}
                                onChange={(e) => setName(e.target.value ?? "")}
                                onBlur={() => name && scrollToSectionAfterKeyboard(serviceRef)}
                                required
                                sx={{mb: 2}}
                            />
                        </CardContent>
                    </Card>

                    <Card ref={serviceRef} sx={scrollTargetSx}>
                        <CardHeader title={t.selectService}/>
                        <CardContent>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    value={selectedServiceId}
                                    onChange={(e) => handleServiceSelect(e.target.value)}
                                >
                                    {services.map((service) => (
                                        <FormControlLabel
                                            key={service.id}
                                            value={service.id}
                                            control={<Radio/>}
                                            label={`${service.name} - ₪${service.price}`}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card ref={barberRef} sx={scrollTargetSx}>
                        <CardHeader title={t.selectBarber}/>
                        <CardContent>
                            <FormControl component="fieldset">
                                {
                                    barbers &&
                                    <RadioGroup value={selectedBarber?.id ?? null}
                                                onChange={(e) => handleBarberSelect(e.target.value)}>
                                        {barbers.map((barber) => (
                                            <FormControlLabel
                                                key={barber.id}
                                                value={barber.id}
                                                control={<Radio/>}
                                                label={barber.firstName + " " + barber.lastName}
                                            />
                                        ))}
                                    </RadioGroup>
                                }
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card ref={dateTimeRef} sx={scrollTargetSx}>
                        <CardHeader title={t.selectDateAndTime}/>
                        <CardContent>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {xs: "1fr", md: "1fr 1fr"},
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    type="date"
                                    label={t.date}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                />
                            </Box>

                            <AvailableSlotsCard selectedBarber={selectedBarber}
                                                selectedDate={selectedDate}
                                                selectedTime={selectedTime}
                                                onSlotSelect={handleSlotSelect}/>
                        </CardContent>
                    </Card>

                    <Dialog
                        open={showConfirmation}
                        onClose={() => setShowConfirmation(false)}
                    >
                        <DialogTitle>{t.confirmYourAppointment}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{mt: 2}}>
                                <Typography>
                                    <strong>{t.service}:</strong> {selectedService?.name}
                                </Typography>
                                <Typography>
                                    <strong>{t.price}:</strong> ₪{selectedService?.price}
                                </Typography>
                                <Typography>
                                    <strong>{t.barber}:</strong> {selectedBarber?.firstName}{" "}
                                    {selectedBarber?.lastName}
                                </Typography>
                                <Typography>
                                    <strong>{t.date}:</strong> {formatDate(selectedDate)}
                                </Typography>
                                <Typography>
                                    <strong>{t.time}:</strong> {selectedTime}
                                </Typography>
                                <Typography>
                                    <strong>{t.name}:</strong> {name}
                                </Typography>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowConfirmation(false)}>{t.cancel}</Button>
                            <Button
                                onClick={handleConfirmBooking}
                                variant="contained"
                                sx={{
                                    bgcolor: "#2D5043",
                                    "&:hover": {
                                        bgcolor: "#233D34",
                                    },
                                }}
                            >
                                {t.confirmBooking}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Button
                        ref={submitRef}
                        variant="contained"
                        disabled={!isFormFullyFilled}
                        onClick={handleSubmit}
                        sx={{
                            ...scrollTargetSx,
                            bgcolor: "#2D5043",
                            "&:hover": {
                                bgcolor: "#233D34",
                            },
                        }}
                        fullWidth
                    >
                        {t.bookAppointment}
                    </Button>
                </Stack>
            )}

            <Dialog
                open={showCalendarPrompt}
                disableEscapeKeyDown
            >
                <DialogTitle>{t.appointmentBooked}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <Typography>{t.addToCalendarPrompt}</Typography>
                        <Typography>
                            <strong>{t.date}:</strong> {formatDate(selectedDate)} {selectedTime}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCalendarPromptDone}>{t.cancel}</Button>
                    {showCalendarPrompt && (
                        <AddToCalendarButton
                            event={buildCalendarEvent()}
                            googleOnlyLabel={t.addToGoogleCalendar}
                            googleLabel={t.googleCalendar}
                            icsLabel={t.appleOutlookCalendar}
                            onSelect={handleCalendarSelected}
                        >
                            {t.addToCalendar}
                        </AddToCalendarButton>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open}
                autoHideDuration={6000}>
                <Alert
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
