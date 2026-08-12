"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {Appointment} from "@/entities/Appointment";
import ManagementSection from "@/components/ManagementSection";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import {buildAppointmentEvent} from "@/lib/ics";
import {format, startOfDay} from "date-fns";
import {Service} from '@/entities/Service';
import {getTranslations} from '@/translations';
import {Barber} from "@/entities/Barber";
import {isAppointmentWithin30Minutes} from '@/utils';
import {formatPhoneNumberForDisplay} from '@/components/PhoneNumberField';
import useConfirm from '@/components/useConfirm';

const t = getTranslations(true);

const UNKNOWN_INFO_PLACEHOLDER = "לא ידוע";
const DELETED_SERVICE_DATA_PLACEHOLDER = "-";

export default function CustomerAppointmentsManagementPage() {
    const router = useRouter();
    const [confirm, ConfirmDialog] = useConfirm();
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [error, setError] = useState(null);

    const userData = useMemo(() => {
        const userData = Cookies.get("userData");

        if (userData) {
            return JSON.parse(decodeURI(userData));
        }

        return null;
    }, []);

    const loadAppointments = useCallback(async () => {
        try {
            const appointmentsList = await Appointment.getAllByClientPhoneNumber({
                clientPhoneNumber: userData.phone_number,
                startDate: startOfDay(new Date()),
            });

            let filteredAppointments = userData.role === "BARBER" ? appointmentsList.filter((a) => a.barberId === userData.id) : appointmentsList;
            setAppointments(filteredAppointments.sort((a, b) => new Date(`${a.date.split("T")[0]}T${a.time}`).getTime() - new Date(`${b.date.split("T")[0]}T${b.time}`).getTime()));

            setError(null);
        } catch (error) {
            setError("Failed to load appointments");
        }
    }, [userData]);

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

        loadAppointments();
        loadServices();
        loadBarbers();
    }, [loadAppointments, router]);

    const handleDelete = async (id) => {
        confirm({
            message: "אתם בטוחים שברצונכם לבטל את התור?",
            successMessage: "התור בוטל בהצלחה",
            onConfirm: async () => {
                try {
                    const appointment = new Appointment({id});
                    await appointment.delete(true);

                    await loadAppointments();
                } catch (error) {
                    setError("Failed to cancel appointment");
                    throw error;
                }
            },
        });
    };

    const buildCalendarEvent = (appointment) => buildAppointmentEvent({
        start: new Date(`${appointment.date.split("T")[0]}T${appointment.time}`),
        durationMinutes: appointment.service?.duration_minutes,
        serviceName: appointment.service?.name,
        barberFirstName: appointment.barber?.firstName,
        barberLastName: appointment.barber?.lastName,
        withLabel: t.calendarEventWith,
        fallbackTitle: t.bookAnAppointment,
    });

    const renderAppointmentActions = (appointment) => {
        if (!appointment.date || !appointment.time) return null;

        return (
            <AddToCalendarButton
                event={buildCalendarEvent(appointment)}
                iconOnly={true}
                googleOnlyLabel={t.addToGoogleCalendar}
                googleLabel={t.googleCalendar}
                icsLabel={t.appleOutlookCalendar}
            >
                {t.addToCalendar}
            </AddToCalendarButton>
        );
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
                    : DELETED_SERVICE_DATA_PLACEHOLDER,
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
        clientId: '',
        clientName: '',
        clientPhoneNumber: '',
        time: "",
        serviceId: services[0]?.id,
        barberId: barbers[0]?.id,
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t.myAppointments}</h1>
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

            <ManagementSection
                title=""
                items={appointments}
                fields={appointmentFields}
                preventDelete={(appointment) => isAppointmentWithin30Minutes(appointment)}
                onDelete={handleDelete}
                deleteText={'ביטול תור'}
                cannotDeleteText={"לא ניתן לבצע ביטול פחות מחצי שעה ממועד התור, נא צרו קשר עם המספרה"}
                columns={appointmentColumns}
                getDetails={getAppointmentDetails}
                initialFormData={initialFormData}
                renderItemActions={renderAppointmentActions}
                dialogTitle="תור"
            />
            {ConfirmDialog}
        </div>
    );
}
