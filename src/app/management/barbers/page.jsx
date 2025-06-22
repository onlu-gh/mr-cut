'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Barber} from '@/entities/Barber';
import ManagementSection from '@/components/ManagementSection';
import {getTranslations} from '@/translations';
import {Alert, Snackbar} from '@mui/material';
import Cookies from 'js-cookie';

const t = getTranslations(true);

export default function BarbersManagement() {
    const [barbers, setBarbers] = useState([]);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

    const userData = useMemo(() => {
        const userData = Cookies.get("userData");

        if (userData) {
            return JSON.parse(decodeURI(userData));
        }

        return null;
    }, []);

    useEffect(() => {
        loadBarbers();
    }, []);

    const loadBarbers = async () => {
        try {
            const barbersList = await Barber.getAll();
            setBarbers(barbersList.filter((b) => userData.role === 'ADMIN' || b.id === userData.id));
        } catch (error) {
            setError('Failed to load barbers');
        }
    };

    const handleAdd = async (formData) => {
        try {
            const barber = new Barber(formData);
            await barber.save();
            await loadBarbers();
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message === 'user already exists' ? 'מספר טלפון זה כבר במערכת!' : 'קרתה שגיאה בהוספת ספר',
                severity: "error"
            });
        }
    };

    const handleEdit = async (id, formData) => {
        try {
            const barber = new Barber({...formData, id});
            await barber.save();
            await loadBarbers();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to update barber',
                severity: "error"
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this barber?')) {
            try {
                const barber = new Barber({id});
                await barber.delete();
                await loadBarbers();
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to delete barber',
                    severity: "error"
                });
            }
        }
    };

    const getBarberDetails = (barber) => [
        {label: 'שם מלא', value: `${barber.firstName} ${barber.lastName}`},
        {label: 'טלפון', value: barber.phoneNumber},
    ];

    const barberFields = [
        {
            name: 'firstName',
            label: 'שם פרטי',
            required: true
        },
        {
            name: 'lastName',
            label: 'שם משפחה',
            required: true
        },
        {
            name: 'phoneNumber',
            label: 'טלפון',
            required: true
        },
        {
            name: 'workingHours',
            label: 'שעות עבודה',
            customComponent: 'WorkingHoursEditor'
        }
    ];

    const barberColumns = [
        {field: 'firstName', headerName: 'שם פרטי', align: 'right'},
        {field: 'lastName', headerName: 'שם משפחה', align: 'right'},
        {field: 'phoneNumber', headerName: 'טלפון', align: 'right'},
    ];

    const initialFormData = {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        specialties: '',
        workingHours: {
            sunday: {start: '09:00', end: '17:00'},
            monday: {start: '09:00', end: '17:00'},
            tuesday: {start: '09:00', end: '17:00'},
            wednesday: {start: '09:00', end: '17:00'},
            thursday: {start: '09:00', end: '17:00'},
            friday: {start: '09:00', end: '17:00'},
        }
    };

    return (
        <>
            <ManagementSection
                title={t.barberManagement}
                items={barbers}
                fields={barberFields}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                columns={barberColumns}
                getDetails={getBarberDetails}
                initialFormData={initialFormData}
                dialogTitle="ספר"
            />

            <Snackbar open={snackbar.open}
                      autoHideDuration={6000}
                      onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert onClose={() => setSnackbar({...snackbar, open: false})}
                       severity={snackbar.severity}
                       sx={{width: '100%'}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}