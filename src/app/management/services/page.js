'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Service } from '@/entities/Service';
import ManagementSection from '@/components/ManagementSection';
import {getTranslations} from '@/translations';

const t = getTranslations(true);

export default function ServiceManagementPage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = Cookies.get('userData');
    if (!userData) {
      router.push('/');
      return;
    }

    const { userType } = JSON.parse(userData);
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
      setError('Failed to load services');
    }
  };

  const handleAdd = async (formData) => {
    try {
      const service = new Service(formData);
      await service.save();
      await loadServices();
    } catch (error) {
      setError('Failed to save service');
    }
  };

  const handleEdit = async (id, formData) => {
    try {
      const service = new Service({ ...formData, id });
      await service.save();
      await loadServices();
    } catch (error) {
      setError('Failed to update service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const service = new Service({ id });
        await service.delete();
        await loadServices();
      } catch (error) {
        setError('Failed to delete service');
      }
    }
  };

  const getServiceDetails = (service) => [
    { label: 'מחיר', value: `₪${service.price}` },
    { label: 'זמן', value: `${service.duration_minutes} דקות` }
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
      inputProps: { step: "0.01" }
    },
    {
      name: 'duration_minutes',
      label: 'זמן (דקות)',
      type: 'number',
      required: true
    }
  ];

  const serviceColumns = [
    { field: 'name', headerName: 'שם', align: 'right' },
    { field: 'price', headerName: 'מחיר', align: 'right' },
    { field: 'duration_minutes', headerName: 'זמן (דקות)', align: 'right' }
  ];

  const initialFormData = {
    name: '',
    price: '',
    duration_minutes: ''
  };

  return (
    <ManagementSection
      title={t.serviceManagement}
      items={services}
      fields={serviceFields}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      columns={serviceColumns}
      getDetails={getServiceDetails}
      initialFormData={initialFormData}
      dialogTitle="שירות"
    />
  );
}