'use client';

import {addDays, addMinutes, addWeeks, endOfWeek, format, getDay, isBefore, startOfWeek} from "date-fns";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Box, Button,
    Dialog,
    MenuItem,
    Select,
    Slide,
    Snackbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
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

const WEEK_DAYS_IN_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export default function CalendarManagement() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [appointments, setAppointments] = useState([]);
    const [uniqueWorkingHours, setUniqueWorkingHours] = useState({});
    const [isLoadingCalendar, setIsLoadingCalendar] = useState({
        appointments: true,
        uniqueWorkingHours: true,
    });
    const [startOfTheWeek, setStartOfTheWeek] = useState(null);
    const [error, setError] = useState(null);
    const [barbers, setBarbers] = useState(undefined);
    const [services, setServices] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [cellDialog, setCellDialog] = useState({isOpen: false, clickedCell: null});
    const [dataDialog, setDataDialog] = useState({
        isOpen: false,
        title: '',
        fields: [],
        handleEdit: null,
        handleAdd: null,
        handleDelete: null,
    });
    const [editingItem, setEditingItem] = useState(null);

    const weeklySchedule = useMemo(() => {
        if (startOfTheWeek && selectedBarber) {
            const res = {};

            WEEK_DAYS_IN_ORDER.forEach((dayOfWeek, index) => {
                const date = format(addDays(startOfTheWeek, index), 'yyyy-MM-dd');

                res[date] = {
                    ...selectedBarber.workingHours[dayOfWeek],
                    ...uniqueWorkingHours[date],
                    start: uniqueWorkingHours[date]?.start ?? selectedBarber.workingHours[dayOfWeek].start,
                    end: uniqueWorkingHours[date]?.end ?? selectedBarber.workingHours[dayOfWeek].end,
                };
            });

            return res;
        }

        return null;
    }, [uniqueWorkingHours, selectedBarber]);

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
            required: true,
            customComponent: 'time',
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

    const dailyScheduleFields = [
        {
            name: 'regularHours',
            label: 'שעות פעילות קבועות',
            required: false,
            customComponent: 'text',
        },
        {
            name: "start",
            label: "שעת פתיחה",
            required: false,
            customComponent: 'time',
        },
        {
            name: "end",
            label: "שעת סגירה",
            required: false,
            customComponent: 'time',
        },
    ];

    const initialAppointmentFormData = {
        clientName: '',
        clientPhoneNumber: '',
        date: '',
        time: "",
        serviceId: services?.[0]?.id,
        barberId: barbers?.[0]?.id,
    };

    const initialDailyScheduleFormData = {
        start: '',
        end: '',
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
            setIsLoadingCalendar((prev) => ({...prev, appointments: true}));
            Appointment.get({
                barberId: selectedBarber.id,
                startDate: startOfTheWeek,
                endDate: getEndOfWeek(startOfTheWeek),
            }).then(res => {
                setAppointments(res);
                setIsLoadingCalendar((prev) => ({...prev, appointments: false}));
            }).catch((error) => {
                console.error('Error loading appointments:', error);
                setError(error.message || 'Failed to load appointments');
            });
        }
    }, [selectedBarber]);

    const debouncedLoadWeeklyAppointments = useMemo(() => debounce(loadWeeklyAppointments, 500, {
        leading: false,
        trailing: true,
    }), [loadWeeklyAppointments]);

    const loadUniqueWorkingHours = useCallback((startOfTheWeek) => {
        if (selectedBarber && startOfTheWeek) {
            setIsLoadingCalendar((prev) => ({...prev, uniqueWorkingHours: true}));
            UniqueWorkingHours.get({
                barberId: selectedBarber.id,
                startDate: startOfTheWeek,
                endDate: getEndOfWeek(startOfTheWeek),
            }).then(uwhs => {
                setUniqueWorkingHours(Object.fromEntries(uwhs.map(({date, barberId, ...rest}) => [date, rest])));
                setIsLoadingCalendar((prev) => ({...prev, uniqueWorkingHours: false}));
            }).catch((error) => {
                console.error('Error loading unique working hours:', error);
                setError(error.message || 'Failed to load unique working hours');
            });
        }
    }, [selectedBarber]);

    useEffect(() => {
        setIsLoadingCalendar({appointments: true, uniqueWorkingHours: true});
        loadUniqueWorkingHours(startOfTheWeek);

        const debouncedCall = debouncedLoadWeeklyAppointments(startOfTheWeek);
        // TODO change to SWR
        const intervalId = setInterval(() => debouncedLoadWeeklyAppointments(startOfTheWeek), 5 * 60 * 1000);

        return () => {
            debouncedCall?.cancel();
            clearInterval(intervalId);
        };
    }, [startOfTheWeek, debouncedLoadWeeklyAppointments, loadUniqueWorkingHours]);

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

    const handleOpenDialog = (item = null, title, dialogFields, initialFormData = {}, additionalFields = {}, handleEdit, handleAdd = null, handleDelete = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({...item, ...additionalFields});
        } else {
            setEditingItem(null);
            setFormData({...initialFormData, ...additionalFields});
        }
        setDataDialog({
            isOpen: true,
            title,
            fields: dialogFields,
            handleEdit,
            handleAdd,
            handleDelete,
        });
    };

    const handleOpenAppointmentDialog = (item = null, date, time) => {
        handleOpenDialog(
            item,
            `${item ? 'ערוך' : 'הוסף'} תור`,
            appointmentFields,
            initialAppointmentFormData,
            {
                date,
                time,
            },
            handleEditAppointment,
            handleAddAppointment,
            (id) => handleDeleteAppointment(id),
        );
    };

    const handleOpenDailyScheduleDialog = (date) => {
        const {start: staticStart, end: staticEnd} = selectedBarber.workingHours[WEEK_DAYS_IN_ORDER[getDay(date)]];
        const {
            start: uniqueStart,
            end: uniqueEnd,
            ...restUnique
        } = uniqueWorkingHours[format(date, 'yyyy-MM-dd')] ?? {};
        handleOpenDialog(
            {
                start: uniqueStart ?? '',
                end: uniqueEnd ?? '',
                ...restUnique,
                date,
                barberId: selectedBarber.id,
            },
            'קביעת לו"ז מיוחד',
            dailyScheduleFields,
            initialDailyScheduleFormData,
            {regularHours: `שעות פעילות קבועות: ${staticEnd && staticEnd ? `${staticEnd} - ${staticStart}` : 'סגור'}`},
            handleEditDailySchedule,
            null,
            null,
        );
    };

    const handleCloseDialog = () => {
        setCellDialog({isOpen: false, clickedCell: null})
        setDataDialog({
            isOpen: false,
            title: '',
            fields: [],
            handleEdit: null,
            handleAdd: null,
            handleDelete: null,
        });
        setEditingItem(null);
    };

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAppointment = async (formData) => {
        try {
            await new Appointment(formData).save();
        } catch (error) {
            setError("Failed to save appointment");
        } finally {
            loadWeeklyAppointments(startOfTheWeek);
        }
    };

    const handleEditAppointment = async (id, formData) => {
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

    const handleDeleteAppointment = async (id) => {
        if (window.confirm("אתם בטוחים שברצונכם למחוק את התור?")) {
            try {
                await new Appointment({id}).delete();
            } catch (error) {
                setError("Failed to delete appointment");
            } finally {
                loadWeeklyAppointments(startOfTheWeek);
            }
            handleCloseDialog();
        }
    };

    const handleEditDailySchedule = async (_, formData) => {
        try {
            const {date, start, end} = formData;
            await new UniqueWorkingHours({
                ...uniqueWorkingHours[format(date, 'yyyy-MM-dd')],
                ...formData,
                start: start === '' ? null : start,
                end: end === '' ? null : end,
                date,
                barberId: selectedBarber.id,
            }).save();
        } catch (error) {
            setError("Failed to update daily schedule");
            throw error;
        } finally {
            loadUniqueWorkingHours(startOfTheWeek);
        }
    };

    const handleSetMiddayWindow = async (isAdd, date, time) => {
        try {
            const prev = uniqueWorkingHours[format(date, 'yyyy-MM-dd')];
            await new UniqueWorkingHours({
                ...prev,
                date,
                barberId: selectedBarber.id,
                middayWindows: isAdd ? [...(prev?.middayWindows ?? []), time] : [...prev?.middayWindows?.toSpliced(prev?.middayWindows.indexOf(time), 1)],
            }).save();
        } catch (error) {
            setError("Failed to set midday window");
            throw error;
        } finally {
            setCellDialog({isOpen: false, clickedCell: null});
            loadUniqueWorkingHours(startOfTheWeek);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await dataDialog.handleEdit?.(editingItem.id, formData);
            } else {
                await dataDialog.handleAdd?.(formData);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to save item:', error);
        }
    };

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
            <WeekView isMobile={isMobile}
                      isLoadingCalendar={Object.values(isLoadingCalendar).reduce((prev, curr) => prev || curr)}
                      onReload={() => {
                          setIsLoadingCalendar((prev) => ({...prev, appointments: true}));
                          debouncedLoadWeeklyAppointments(startOfTheWeek);
                      }}
                      onStartOfWeekChange={setStartOfTheWeek}
                      locale={{code: 'he-IL', localize: localizeIL}}
                      weekStartsOn={0}
                      getWeeklySchedule={() => weeklySchedule ? Object.values(weeklySchedule ?? {}) : null}
                      disabledDay={
                          (date) => {
                              const day = format(date, 'yyyy-MM-dd');

                              return !weeklySchedule?.[day]?.start && !weeklySchedule?.[day]?.end;
                          }
                      }
                      windowCell={(date) => {
                          const day = format(date, 'yyyy-MM-dd');
                          const hour = format(date, 'HH:mm');

                          return (weeklySchedule?.[day] && weeklySchedule[day].middayWindows?.includes(hour));
                      }}
                      disabledCell={(date) => {
                          const day = format(date, 'yyyy-MM-dd');
                          const hour = format(date, 'HH:mm');

                          return (
                              // isBefore(date, new Date()) ||
                              (weeklySchedule?.[day] && (hour < weeklySchedule[day].start || hour >= weeklySchedule[day].end))
                          );
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
                      onDayClick={
                          (date) => {
                              handleOpenDailyScheduleDialog(date);
                          }
                      }
                      onCellClick={
                          (cell) => {
                              setCellDialog({isOpen: true, clickedCell: cell})
                          }
                      }
                      onEventClick={
                          (event) => {
                              handleOpenAppointmentDialog(appointments.find(({id}) => event.id === id), format(event.startDate, 'yyyy-MM-dd'), format(event.startDate, 'HH:mm'));
                          }
                      }
            />
            <Dialog open={cellDialog.isOpen}
                    onClose={() => setCellDialog({isOpen: false, clickedCell: null})}>
                {
                    cellDialog.clickedCell && (
                        cellDialog.clickedCell.window ?
                            <Button variant={'contained'}
                                    color={'secondary'}
                                    sx={{margin: 5}}
                                    onClick={() => handleSetMiddayWindow(false, cellDialog.clickedCell.date, cellDialog.clickedCell.hourAndMinute)}>
                                הגדר זמן כפעיל
                            </Button> :
                            <>
                                <Button variant={'contained'}
                                        color={'primary'}
                                        sx={{margin: 5}}
                                        onClick={() => handleOpenAppointmentDialog(null, format(cellDialog.clickedCell.date, 'yyyy-MM-dd'), cellDialog.clickedCell.hourAndMinute)}>
                                    קבע תור
                                </Button>
                                <Button variant={'contained'}
                                        color={'info'}
                                        sx={{margin: 5}}
                                        onClick={() => handleSetMiddayWindow(true, cellDialog.clickedCell.date, cellDialog.clickedCell.hourAndMinute)}>
                                    הגדר זמן כסגור
                                </Button>
                            </>
                    )
                }
            </Dialog>
            {
                formData && appointmentFields &&
                <ManagementDialog
                    open={dataDialog.isOpen}
                    onClose={handleCloseDialog}
                    isEditing={editingItem}
                    title={dataDialog.title}
                    formData={formData}
                    onFormChange={handleFormChange}
                    onDelete={dataDialog.handleDelete && (() => dataDialog.handleDelete(editingItem.id))}
                    onSubmit={handleSubmit}
                    fields={dataDialog.fields}
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