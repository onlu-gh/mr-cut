import {format} from "date-fns";

export class UniqueWorkingHours {
    constructor(data) {
        this.barberId = data.barberId ?? data.barber_id;
        this.date = data.date ? format(new Date(data.date), 'yyyy-MM-dd') : null;
        this.start = data.start;
        this.end = data.end;
        this.middayWindows = data.middayWindows ?? data.midday_windows;
    }

    static async getOne({barberId, date} = {}) {
        try {

            const response = await fetch(`/api/uniqueWorkingHours/${barberId}/${date}`);
            if (!response.ok) throw new Error('Failed to fetch unique working hours');
            const data = await response.json();
            return new UniqueWorkingHours(data);
        } catch (error) {
            console.error('Error fetching unique working hours:', error);
            throw error;
        }
    }

    static async get({barberId, startDate, endDate} = {}) {
        try {
            const url = new URL('/api/uniqueWorkingHours', window.location.origin);
            if (barberId) url.searchParams.append('barberId', barberId);
            if (startDate) url.searchParams.append('startDate', startDate);
            if (endDate) url.searchParams.append('endDate', endDate);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch unique working hours');
            const data = await response.json();
            return data.map(uniqueWorkingHours => new UniqueWorkingHours(uniqueWorkingHours));
        } catch (error) {
            console.error('Error fetching unique working hours:', error);
            throw error;
        }
    }

    async save() {
        try {
            const method = 'PUT';
            const url = `/api/uniqueWorkingHours/${this.barber_id}/${this.date}`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start: this.start,
                    end: this.end,
                    midday_windows: this.middayWindows,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save unique working hours');
            }
            const data = await response.json();
            return new UniqueWorkingHours(data);
        } catch (error) {
            console.error('Error saving unique working hours:', error);
            throw error;
        }
    }

    async delete() {
        try {
            const response = await fetch(`/api/uniqueWorkingHours/${this.barber_id}/${this.date}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete unique working hours');
            return true;
        } catch (error) {
            console.error('Error deleting unique working hours:', error);
            throw error;
        }
    }
} 