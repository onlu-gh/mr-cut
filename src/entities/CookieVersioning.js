export class CookieVersioning {
  constructor(data) {
    this.name = data.name;
    this.version = data.version ?? 1;
    this.updated_at = data.updated_at ?? null;
  }

  static async getAll() {
    try {
      const response = await fetch('/api/cookies');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cookie registry');
      }
      const data = await response.json();
      return data.map((cookie) => new CookieVersioning(cookie));
    } catch (error) {
      console.error('Error fetching cookie registry:', error);
      throw error;
    }
  }
}
