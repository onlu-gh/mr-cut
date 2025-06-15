'use client';

import {addDays, addMinutes, addWeeks, endOfWeek, format, isBefore, startOfWeek} from "date-fns";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Box, MenuItem, Select, Slide, Snackbar, Typography, useMediaQuery, useTheme} from '@mui/material';
import Cookies from 'js-cookie';
import WeekView from '@/components/WeekView/WeekView';
import localizeIL from '@/lib/he-IL-localize';
import {Barber} from '@/entities/Barber';
import {Appointment} from '@/entities/Appointment';
import ManagementDialog from '@/components/ManagementDialog';
import {Service} from '@/entities/Service';
import debounce from 'lodash.debounce';
import {UniqueWorkingHours} from '@/entities/UniqueWorkingHours';

function getEndOfWeek(startOfTheWeek) {
    return addDays(endOfWeek(startOfTheWeek, {weekStartsOn: 0}), -1);
}

export default function ManagementDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [appointments, setAppointments] = useState([]);
    const [uniqueWorkingHours, setUniqueWorkingHours] = useState([]);
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
    const [startOfTheWeek, setStartOfTheWeek] = useState(null);
    const [error, setError] = useState(null);
    const [barbers, setBarbers] = useState(undefined);
    const [services, setServices] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const weeklyWorkingHours = useMemo(() => {
        console.log(uniqueWorkingHours);
        if (selectedBarber && uniqueWorkingHours) {
            const staticWorkingHours = Object.values(selectedBarber.workingHours);

            return [];
        }

        return {};
    }, [uniqueWorkingHours, selectedBarber]);

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

    const loadWeeklyAppointments = useCallback((startOfTheWeek) => {
        if (selectedBarber && startOfTheWeek) {
            setIsLoadingCalendar(true);
            Appointment.get({
                                barberId: selectedBarber.id,
                                startDate: startOfTheWeek,
                                endDate: getEndOfWeek(startOfTheWeek),
                            }).then(res => {
                setAppointments(res);
                setIsLoadingCalendar(false);
            }).catch((error) => {
                console.error('Error loading appointments:', error);
                setError(error.message || 'Failed to load appointments');
            });
        }
    }, [selectedBarber]);

    const debouncedLoadWeeklyAppointments = useMemo(() => debounce(loadWeeklyAppointments, 500, {
        leading: false,
        trailing: true
    }), [loadWeeklyAppointments]);

    useEffect(() => {
        setIsLoadingCalendar(true);
        const debouncedCall = debouncedLoadWeeklyAppointments(startOfTheWeek);
        // TODO change to SWR
        const intervalId = setInterval(() => debouncedLoadWeeklyAppointments(startOfTheWeek), 5 * 60 * 1000);

        return () => {
            debouncedCall?.cancel();
            clearInterval(intervalId);
        };
    }, [startOfTheWeek, debouncedLoadWeeklyAppointments]);

    const loadUniqueWorkingHours = useCallback((startOfTheWeek) => {
        if (selectedBarber && startOfTheWeek) {
            setIsLoadingCalendar(true);
            UniqueWorkingHours.get({
                                       barberId: selectedBarber.id,
                                       startDate: startOfTheWeek,
                                       endDate: getEndOfWeek(startOfTheWeek),
                                   }).then(res => {
                setUniqueWorkingHours(res);
                setIsLoadingCalendar(false);
            }).catch((error) => {
                console.error('Error loading unique working hours:', error);
                setError(error.message || 'Failed to load unique working hours');
            });
        }
    }, [selectedBarber]);

    useEffect(() => {
        loadUniqueWorkingHours(startOfTheWeek);
    }, [loadUniqueWorkingHours, startOfTheWeek]);

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

    const handleDelete = async (id) => {
        if (window.confirm("אתם בטוחים שברצונכם למחוק את התור?")) {
            try {
                await new Appointment({id}).delete();
            } catch (error) {
                setError("Failed to delete appointment");
            } finally {
                loadWeeklyAppointments(startOfTheWeek);
            }
        }
        handleCloseDialog();
    };

    const handleAdd = async (formData) => {
        try {
            await new Appointment(formData).save();
        } catch (error) {
            setError("Failed to save appointment");
        } finally {
            loadWeeklyAppointments(startOfTheWeek);
        }
    };

    const handleEdit = async (id, formData) => {
        try {
            const {barberId, serviceId} = formData;

            await new Appointment({
                                      ...formData,
                                      barber: barbers.find(b => b.id === barberId),
                                      service: services.find(s => s.id === serviceId),
                                      id,
                                  }).save();
        } catch (error) {
            setError("Failed to update appointment");
        } finally {
            loadWeeklyAppointments(startOfTheWeek);
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
            <div className="flex justify-between items-center">
                <Typography variant="h4" component="h1" gutterBottom>
                    {'לו"ז'}
                </Typography>
                {
                    barbers &&
                    <div className={"w-[150px]"}>
                        <Select fullWidth
                                variant={'outlined'}
                                className={"h-[32px]!important bg-white"}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        padding: '4.5px !important',
                                    },
                                    "& .MuiSelect-select.MuiSelect-outlined": {
                                        paddingLeft: '32px !important',
                                        paddingRight: '14px !important',
                                    },
                                    "& .MuiSvgIcon-root": {
                                        right: "unset",
                                        left: "7px",
                                    },
                                }}
                                value={selectedBarber.id}
                                onChange={(e) => setSelectedBarber(barbers.find((b) => b.id === e.target.value))}>
                            {barbers.map((b) => <MenuItem key={b.id}
                                                          value={b.id}>{`${b.firstName} ${b.lastName}`}</MenuItem>)}
                        </Select>
                    </div>
                }
            </div>
            <div>
                <WeekView isMobile={isMobile}
                          isLoadingEvents={isLoadingCalendar}
                          onReload={() => {
                              setIsLoadingCalendar(true);
                              debouncedLoadWeeklyAppointments(startOfTheWeek);
                          }}
                          onStartOfWeekChange={handleStartOfWeekChange}
                          locale={{code: 'he-IL', localize: localizeIL}}
                          weekStartsOn={0}
                          getWeeklySchedule={(startDayOfWeek) => selectedBarber && Object.values(selectedBarber.workingHours)}
                          disabledCell={(date) => { // TODO add start end working hour bounds
                              return isBefore(date, new Date());
                          }}
                          disabledWeek={(startDayOfWeek) => {
                              return isBefore(startDayOfWeek, startOfWeek(addWeeks(new Date(), -2)));
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
                          onCellClick={
                              (cell) => {
                                  handleOpenDialog(null, format(cell.date, 'yyyy-MM-dd'), cell.hourAndMinute);
                                  console.log(cell.date);
                              }
                          }
                          onEventClick={
                              (event) => {
                                  handleOpenDialog(appointments.find(({id}) => event.id === id));
                              }
                          }
                />
            </div>
            {
                formData && appointmentFields &&
                <ManagementDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    isEditing={editingItem}
                    title={`${editingItem ? "ערוך" : "הוסף"} תור`}
                    formData={formData}
                    onFormChange={handleFormChange}
                    onDelete={() => handleDelete(editingItem?.id)}
                    onSubmit={handleSubmit}
                    fields={appointmentFields}
                    isMobile={isMobile}
                />
            }
            <Snackbar open={error}
                      onClose={() => setError(null)}
                      TransitionComponent={(props) => <Slide {...props} direction="down"/>}
                      anchorOrigin={{horizontal: 'center', vertical: 'top'}}
                      autoHideDuration={3000}>
                <Alert severity="error" sx={{mb: 2}}>
                    {'הפעולה נכשלה'}
                </Alert>
            </Snackbar>
        </Box>
    );
}