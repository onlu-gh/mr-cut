'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {Service} from '@/entities/Service';
import ManagementSection from '@/components/ManagementSection';
import {Alert, Backdrop, CircularProgress, Slide, Snackbar, Switch} from '@mui/material';
import {getTranslations} from '@/translations';
import useConfirm from '@/components/useConfirm';

const t = getTranslations(true);

export default function ServiceManagementPage() {
    const router = useRouter();
    const [confirm, ConfirmDialog] = useConfirm();
    const [services, setServices] = useState([]);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const userData = Cookies.get('userData');
        if (!userData) {
            router.push('/');
            return;
        }

        const {userType} = JSON.parse(userData);
        if (userType !== 'barber' && userType !== 'admin') {
            router.push('/home');
            return;
        }

        loadServices();
    }, [router]);

    const loadServices = async () => {
        try {
            const servicesList = await Service.getAll();
            setServices(servicesList);
        } catch (error) {
            setError('טעינת השירותים נכשלה');
        }
    };

    const handleAdd = async (formData) => {
        try {
            setError(null);
            const service = new Service(formData);
            await service.save();
            await loadServices();
        } catch (error) {
            setError('שמירת השירות נכשלה');
        }
    };

    const handleEdit = async (id, formData) => {
        try {
            setError(null);
            const service = new Service({...formData, id});
            await service.save();
            await loadServices();
        } catch (error) {
            setError('עדכון השירות נכשל');
        }
    };

    const handleDelete = async (id) => {
        const target = services.find((service) => service.id === id);

        if (target?.hasFutureAppointments) {
            confirm({
                alert: true,
                confirmLabel: 'הבנתי',
                message: 'לא ניתן למחוק שירות עם תורים קיימים, באפשרותך להשהות את השירות ולהסירו במועד מאוחר יותר.',
            });
            return;
        }

        confirm({
            message: 'אתם בטוחים שברצונכם למחוק את השירות? \n (שירות זה יופיע בתור "שירות שהוסר")',
            successMessage: 'השירות נמחק בהצלחה',
            onConfirm: async () => {
                try {
                    setError(null);
                    const service = new Service({id});
                    await service.delete();
                    await loadServices();
                } catch (error) {
                    setError(error.message || 'מחיקת השירות נכשלה');
                    throw error;
                }
            },
        });
    };

    const handleToggleSuspended = async (item) => {
        setUpdatingStatus(true);
        try {
            setError(null);
            const service = new Service({...item, suspended: !item.suspended});
            await service.save();
            await loadServices();
        } catch (error) {
            setError('עדכון סטטוס השירות נכשל');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getServiceDetails = (service) => [
        {label: 'מחיר', value: `₪${service.price}`},
        {label: 'זמן', value: `${service.duration_minutes} דקות`}
    ];

    const serviceFields = [
        {
            name: 'name',
            label: 'שם השירות',
            required: true
        },
        {
            name: 'price',
            label: 'מחיר',
            type: 'number',
            required: true,
            inputProps: {step: "0.01"}
        },
        {
            name: 'duration_minutes',
            label: 'זמן (דקות)',
            type: 'number',
            required: true
        }
    ];

    const renderStatusToggle = (item) => (
        <Switch
            color="success"
            checked={!item.suspended}
            onChange={() => handleToggleSuspended(item)}
            inputProps={{'aria-label': item.suspended ? 'הפעל שירות' : 'השהה שירות'}}
        />
    );

    const statusColumn = {
        field: 'suspended',
        headerName: 'סטטוס',
        align: 'right',
        renderCell: renderStatusToggle,
    };

    const serviceColumns = [
        statusColumn,
        {field: 'name', headerName: 'שם', align: 'right'},
        {field: 'price', headerName: 'מחיר', align: 'right'},
        {field: 'duration_minutes', headerName: 'זמן (דקות)', align: 'right'}
    ];

    // Desktop shows the toggle in the status column; mobile cards get it in actions.
    const renderItemActions = (item, view) => (view === 'desktop' ? null : renderStatusToggle(item));

    const initialFormData = {
        name: '',
        price: '',
        duration_minutes: ''
    };

    const activeServices = services.filter((service) => !service.suspended);
    const suspendedServices = services.filter((service) => service.suspended);

    return (
        <>
            <Backdrop open={updatingStatus} sx={{zIndex: (theme) => theme.zIndex.modal + 1}}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <div>
                <ManagementSection
                    showBackButton
                    title={t.serviceManagement}
                    items={activeServices}
                    fields={serviceFields}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    columns={serviceColumns}
                    getDetails={getServiceDetails}
                    initialFormData={initialFormData}
                    renderItemActions={renderItemActions}
                    dialogTitle="שירות"
                />
            </div>
            <div style={{marginTop: 20}}>
                <ManagementSection
                    title="שירותים מושהים"
                    items={suspendedServices}
                    fields={serviceFields}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    columns={serviceColumns}
                    getDetails={getServiceDetails}
                    initialFormData={initialFormData}
                    renderItemActions={renderItemActions}
                    dialogTitle="שירות"
                />
            </div>
            <Snackbar open={!!error}
                      onClose={() => setError(null)}
                      TransitionComponent={({children, ...props}) => <Slide {...props} direction="down"
                                                                            children={children}/>}
                      anchorOrigin={{horizontal: 'center', vertical: 'top'}}
                      autoHideDuration={3000}>
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            </Snackbar>
            {ConfirmDialog}
        </>
    );
}
