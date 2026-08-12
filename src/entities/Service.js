export class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.duration_minutes = parseInt(data.duration_minutes); // in minutes
    this.suspended = data.suspended ?? false;
    this.hasFutureAppointments = data.hasFutureAppointments ?? false;
  }

  static async getAll() {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }
      const data = await response.json();
      return data.map(service => new Service(service));
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const response = await fetch(`/api/services/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch service');
      }
      const data = await response.json();
      return new Service(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  async save() {
    try {
      const method = this.id ? 'PUT' : 'POST';
      const url = this.id ? `/api/services/${this.id}` : '/api/services';
      
      const requestBody = {
        name: this.name,
        price: this.price,
        duration_minutes: this.duration_minutes,
        suspended: this.suspended
      };

      console.log('Sending request:', { method, url, body: requestBody });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.error || 'Failed to save service');
      }

      return new Service(responseData);
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const response = await fetch(`/api/services/${this.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
} 