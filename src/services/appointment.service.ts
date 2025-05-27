import {BaseService} from '@/lib/base.service';
import {query} from '@/lib/db';

export class AppointmentService extends BaseService {
  constructor() {
    super('Appointment');
  }

  async checkAvailability(barberId: number, date: string, time: string) {
      const result = await query(
      `SELECT * FROM "${this.tableName}" WHERE barber_id = $1 AND date = $2 AND time = $3`,
      [barberId, date, time]
    );

    return result.rows.length === 0;
  }
}