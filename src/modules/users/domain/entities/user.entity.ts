import { Entity } from "@/shared/domain";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface UserProps {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  roles: string[];
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<string> {
  private readonly props: Omit<UserProps, "id">;

  private constructor(id: string, props: Omit<UserProps, "id">) {
    super(id);
    this.props = props;
  }

  static create(props: UserProps): User {
    return new User(props.id, {
      email: props.email,
      username: props.username,
      firstName: props.firstName,
      lastName: props.lastName,
      status: props.status,
      roles: props.roles,
      lastLoginAt: props.lastLoginAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get email(): string {
    return this.props.email;
  }
  get username(): string {
    return this.props.username;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get roles(): string[] {
    return this.props.roles;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return { id: this._id, ...this.props };
  }

  get isActive(): boolean {
    return this.props.status === "ACTIVE";
  }
  get isInactive(): boolean {
    return this.props.status === "INACTIVE";
  }
  get isLocked(): boolean {
    return this.props.status === "LOCKED";
  }
}
