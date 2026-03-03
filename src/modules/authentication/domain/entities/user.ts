import { Entity } from "@/shared/domain";

export interface UserProps {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  jobTitle?: string;
  department?: string;
  mustChangePassword?: boolean;
  roles: string[];
  permissions: string[];
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
      phone: props.phone,
      timezone: props.timezone,
      language: props.language,
      jobTitle: props.jobTitle,
      department: props.department,
      mustChangePassword: props.mustChangePassword,
      roles: props.roles,
      permissions: props.permissions,
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

  get phone(): string | undefined {
    return this.props.phone;
  }

  get timezone(): string | undefined {
    return this.props.timezone;
  }

  get language(): string | undefined {
    return this.props.language;
  }

  get jobTitle(): string | undefined {
    return this.props.jobTitle;
  }

  get department(): string | undefined {
    return this.props.department;
  }

  get mustChangePassword(): boolean {
    return this.props.mustChangePassword ?? false;
  }

  get roles(): string[] {
    return [...this.props.roles];
  }

  get permissions(): string[] {
    return [...this.props.permissions];
  }

  hasPermission(permission: string): boolean {
    return this.props.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    return this.props.roles.includes(role);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }
}
