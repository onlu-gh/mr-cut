export class BroadcastMessage {
  constructor(data) {
    this.id = data.id;
    this.content = data.content;
    // Tolerate the string values the <select> form control produces.
    this.active = data.active === true || data.active === 'true';
    // Server-derived; null when the message is inactive.
    this.order = data.order ?? null;
    this.created_at = data.created_at ?? null;
  }

  static async getAll() {
    try {
      const response = await fetch('/api/broadcast');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch broadcast messages');
      }
      const data = await response.json();
      return data.map(message => new BroadcastMessage(message));
    } catch (error) {
      console.error('Error fetching broadcast messages:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const response = await fetch(`/api/broadcast/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch broadcast message');
      }
      const data = await response.json();
      return new BroadcastMessage(data);
    } catch (error) {
      console.error('Error fetching broadcast message:', error);
      throw error;
    }
  }

  // ids: array of active message ids in the desired display order (first = order 0).
  static async reorder(ids) {
    try {
      const response = await fetch('/api/broadcast/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder broadcast messages');
      }
      return true;
    } catch (error) {
      console.error('Error reordering broadcast messages:', error);
      throw error;
    }
  }

  async save() {
    try {
      const method = this.id ? 'PUT' : 'POST';
      const url = this.id ? `/api/broadcast/${this.id}` : '/api/broadcast';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: this.content,
          active: this.active,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save broadcast message');
      }

      return new BroadcastMessage(responseData);
    } catch (error) {
      console.error('Error saving broadcast message:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const response = await fetch(`/api/broadcast/${this.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete broadcast message');
      }
      return true;
    } catch (error) {
      console.error('Error deleting broadcast message:', error);
      throw error;
    }
  }
}
