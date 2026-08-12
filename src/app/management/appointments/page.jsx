"use client";

import {useState, useEffect, useCallback, useMemo} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {Appointment} from "@/entities/Appointment";
import ManagementSection from "@/components/ManagementSection";
import BackToManagementButton from "@/components/BackToManagementButton";
import {endOfDay, format, startOfDay} from "date-fns";
import {Service} from '@/entities/Service';
import {getTranslations} from '@/translations';
import {Barber} from "@/entities/Barber";
import {Typography} from '@mui/material';
import {formatPhoneNumberForDisplay} from '@/components/PhoneNumberField';
import useConfirm from '@/components/useConfirm';
import {Config} from '@/lib/config';

const t = getTranslations(true);

const UNKNOWN_INFO_PLACEHOLDER = "לא ידוע";
const DELETED_SERVICE_DATA_PLACEHOLDER = "-";

export default function AppointmentsManagementPage() {
    const router = useRouter();
    const [confirm, ConfirmDialog] = useConfirm();
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const userData = useMemo(() => {
        const userData = Cookies.get("userData");

        if (userData) {
            return JSON.parse(decodeURI(userData));
        }

        return null;
    }, []);

    const loadAppointments = useCallback(async () => {
        try {
            const appointmentsList = await Appointment.get({
                startDate: startOfDay(selectedDate),
                endDate: endOfDay(selectedDate),
            });

            let filteredAppointments = userData.role === "BARBER" ? appointmentsList.filter((a)=>a.barberId === userData.id) : appointmentsList;
            setAppointments(filteredAppointments.sort((a, b) => new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() - new Date(`${b.date.split("T")[0]}T${b.time}`).getTime()));

            setError(null);
        } catch (error) {
            setError("Failed to load appointments");
        }
    }, [selectedDate, userData.id, userData.role]);

    const loadServices = async () => {
        try {
            setServices(await Service.getAll());
        } catch (error) {
            setError('Failed to load services');
        }
    };

    const loadBarbers = async () => {
        try {
            setBarbers(await Barber.getAll());
        } catch (error) {
            setError('Failed to load barbers');
        }
    };

    useEffect(() => {
        const userData = Cookies.get("userData");
        if (!userData) {
            router.push("/");
            return;
        }

        const {userType} = JSON.parse(userData);
        if (userType !== "barber" && userType !== "admin") {
            router.push("/home");
            return;
        }

        loadAppointments();
        loadServices();
        loadBarbers();
    }, [loadAppointments, router]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleAdd = async (formData) => {
        try {
            await new Appointment(formData).save();
            await loadAppointments();
        } catch (error) {
            setError("Failed to save appointment");
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
            await loadAppointments();
        } catch (error) {
            setError("Failed to update appointment");
        }
    };

    const handleDelete = async (id) => {
        confirm({
            message: "אתם בטוחים שברצונכם לבטל את התור?",
            successMessage: "התור בוטל בהצלחה",
            onConfirm: async () => {
                try {
                    await new Appointment({id}).delete();
                    await loadAppointments();
                } catch (error) {
                    setError("Failed to delete appointment");
                    throw error;
                }
            },
        });
    };

    const getAppointmentDetails = (appointment) => {
        return [
            {
                label: "זמן תור",
                value: appointment.date && appointment.time ? format(
                    new Date(`${appointment.date.split("T")[0]}T${appointment.time}`),
                    "hh:mm"
                ) : '',
            },
            {
                label: "שם לקוח",
                value: appointment.clientName,
            },
            {
                label: "טלפון לקוח",
                value: formatPhoneNumberForDisplay(appointment.clientPhoneNumber),
            },
            {
                label: "ספר",
                value: appointment.barber?.firstName
                    ? `${appointment.barber.firstName} ${appointment.barber.lastName}`
                    : UNKNOWN_INFO_PLACEHOLDER,
            },
            {
                label: "שירות",
                value: appointment.service?.name || UNKNOWN_INFO_PLACEHOLDER,
            },
            {
                label: "זמן",
                value: appointment.service?.duration_minutes >= 0
                    ? `${appointment.service.duration_minutes} דקות `
                    : DELETED_SERVICE_DATA_PLACEHOLDER,
            },
            {
                label: "מחיר",
                value: appointment.service?.price >= 0
                    ? `₪${appointment.service.price}`
                    : DELETED_SERVICE_DATA_PLACEHOLDER,
            },
            {
                label: "סטטוס",
                value: appointment.status
                    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                    : UNKNOWN_INFO_PLACEHOLDER,
            }
        ];
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
            customComponent: 'phone',
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
            options: [
                ...(services?.filter((service) => !service.suspended).map((service) => ({value: service.id, label: service.name})) ?? []),
                // Non-selectable, hidden from the list; only shows as the current
                // value when editing an appointment whose service was deleted.
                {value: Config.removedServiceId, label: 'שירות שהוסר', disabled: true, hidden: true},
            ],
        },
    ];

    const appointmentColumns = [
        {
            field: "dateTime",
            headerName: "תאריך ושעה",
            align: "right",
            valueGetter: (params) => {
                const appointment = params.row;

                if (appointment.date && appointment.time) {
                    return format(
                        new Date(`${appointment.date.split('T')[0]}T${appointment.time}`),
                        "d/MM/yyyy HH:mm"
                    );
                }
            },
        },
        {
            field: "clientName",
            headerName: "שם לקוח",
            align: "right",
            valueGetter: (params) => {
                const appointment = params.row;
                return appointment?.clientName ?? UNKNOWN_INFO_PLACEHOLDER;
            },
        },
        {
            field: "clientPhoneNumber",
            headerName: "טלפון",
            align: "right",
            valueGetter: (params) => {
                const appointment = params.row;
                return appointment?.clientPhoneNumber ? formatPhoneNumberForDisplay(appointment.clientPhoneNumber) : UNKNOWN_INFO_PLACEHOLDER;
            },
        },
        {
            field: "service",
            headerName: "שירות",
            align: "right",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.name || UNKNOWN_INFO_PLACEHOLDER;
            },
        },
        {
            field: "price",
            headerName: "מחיר",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.price >= 0 ? `₪${service.price}` : DELETED_SERVICE_DATA_PLACEHOLDER;
            },
            align: "right",
        },
        {
            field: "duration",
            headerName: "זמן",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.duration_minutes >= 0 ? `${service.duration_minutes} דקות` : DELETED_SERVICE_DATA_PLACEHOLDER;
            },
            align: "right",
        },
        {
            field: "barber",
            headerName: "ספר",
            align: "right",
            valueGetter: (params) => {
                const barber = params.row.barber;
                return barber?.firstName ? `${barber.firstName} ${barber.lastName}` : UNKNOWN_INFO_PLACEHOLDER;
            },
        },
    ];

    const initialFormData = {
        clientName: '',
        clientPhoneNumber: '',
        date: selectedDate,
        time: "",
        serviceId: services.find((service) => !service.suspended)?.id,
        barberId: barbers[0]?.id,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-[5px]">
                    <BackToManagementButton/>
                    <Typography variant="h4" component="h1">
                        {t.appointmentManagement}
                    </Typography>
                </div>
                <div className="flex items-center space-x-4">
                    <label htmlFor="date" className="text-sm font-medium text-gray-700">
                        שינוי תאריך:
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {error && (
                <div style={{color: 'red'}}>
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {!error && appointments.length === 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                אין תורים בתאריך{" "}
                                {format(new Date(selectedDate), "d/MM/yyyy")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ManagementSection
                title=""
                items={appointments}
                fields={appointmentFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteText="ביטול תור"
                columns={appointmentColumns}
                getDetails={getAppointmentDetails}
                initialFormData={initialFormData}
                dialogTitle="תור"
            />
            {ConfirmDialog}
        </div>
    );
}
