"use client";

import React, {useEffect, useState} from "react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

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
                setTimeout(()=>{
                    router.push('/customer/dashboard');
                }, 2000);
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

    const handleServiceSelect = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            setSelectedServiceId(serviceId);
            setSelectedService(service);
        }
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
                                required
                                sx={{mb: 2}}
                            />
                        </CardContent>
                    </Card>

                    <Card>
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

                    <Card>
                        <CardHeader title={t.selectBarber}/>
                        <CardContent>
                            <FormControl component="fieldset">
                                {
                                    barbers &&
                                    <RadioGroup value={selectedBarber?.id ?? null}
                                                onChange={(e) => setSelectedBarber(barbers.find(b => b.id === e.target.value))}>
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

                    <Card>
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
                                                onSlotSelect={(time) => setSelectedTime(time)}/>
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
                                <Typography>
                                    <strong>{t.phone}:</strong> {phone}
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
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
            >
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
