"use client";

import {useState, useEffect, useCallback, useMemo} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {Appointment} from "@/entities/Appointment";
import ManagementSection from "@/components/ManagementSection";
import {format} from "date-fns";
import {Service} from '@/entities/Service';
import {getTranslations} from '@/translations';
import {Barber} from "@/entities/Barber";

const t = getTranslations(true);

export default function AppointmentsManagementPage() {
    const router = useRouter();
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
            const appointmentsList = await Appointment.getAll({
                date: selectedDate,
            });

            let filteredAppointments = userData.role === "BARBER" ? appointmentsList.filter((a)=>a.barberId === userData.id) : appointmentsList;
            setAppointments(filteredAppointments.sort((a, b) => new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() - new Date(`${b.date.split("T")[0]}T${b.time}`).getTime()));

            setError(null);
        } catch (error) {
            setError("Failed to load appointments");
        }
    }, [selectedDate]);

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
            router.push("/dashboard");
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

            console.log(formData);

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
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                await new Appointment({id}).delete();
                await loadAppointments();
            } catch (error) {
                setError("Failed to delete appointment");
            }
        }
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
                value: appointment.clientPhoneNumber,
            },
            {
                label: "ספר",
                value: appointment.barber?.firstName
                    ? `${appointment.barber.firstName} ${appointment.barber.lastName}`
                    : "לא ידוע",
            },
            {
                label: "שירות",
                value: appointment.service?.name || "לא ידוע",
            },
            {
                label: "זמן",
                value: appointment.service?.duration_minutes
                    ? `${appointment.service.duration_minutes} דקות `
                    : "לא ידוע",
            },
            {
                label: "מחיר",
                value: appointment.service?.price
                    ? `₪${appointment.service.price}`
                    : "לא ידוע",
            },
            {
                label: "סטטוס",
                value: appointment.status
                    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                    : "לא ידוע",
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
                return appointment?.clientName ?? "לא ידוע";
            },
        },
        {
            field: "clientPhoneNumber",
            headerName: "טלפון",
            align: "right",
            valueGetter: (params) => {
                const appointment = params.row;
                return appointment?.clientPhoneNumber ?? "לא ידוע";
            },
        },
        {
            field: "service",
            headerName: "שירות",
            align: "right",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.name || "לא ידוע";
            },
        },
        {
            field: "price",
            headerName: "מחיר",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.price ? `₪${service.price}` : "לא ידוע";
            },
            align: "right",
        },
        {
            field: "duration",
            headerName: "זמן",
            valueGetter: (params) => {
                const service = params.row.service;
                return service?.duration_minutes ? `${service.duration_minutes} דקות` : "לא ידוע";
            },
            align: "right",
        },
        {
            field: "barber",
            headerName: "ספר",
            align: "right",
            valueGetter: (params) => {
                const barber = params.row.barber;
                return barber?.firstName ? `${barber.firstName} ${barber.lastName}` : "לא ידוע";
            },
        },
    ];

    const initialFormData = {
        clientName: '',
        clientPhoneNumber: '',
        date: selectedDate,
        time: "",
        serviceId: services[0]?.id,
        barberId: barbers[0]?.id,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t.appointmentManagement}</h1>
                <div className="flex items-center space-x-4">
                    <label htmlFor="date" className="text-sm font-medium text-gray-700">
                        Select Date:
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
                columns={appointmentColumns}
                getDetails={getAppointmentDetails}
                initialFormData={initialFormData}
                dialogTitle="תור"
            />
        </div>
    );
}
