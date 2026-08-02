export class User {
  constructor({
    id,
    phone_number,
    firstName,
    lastName,
    role = 'customer', // 'customer', 'barber', or 'admin'
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.phone_number = phone_number;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return {
      id: this.id,
      phone_number: this.phone_number,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new User({
      id: json.id,
      phone_number: json.phone_number,
      firstName: json.firstName,
      lastName: json.lastName,
      role: json.role,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }
} 