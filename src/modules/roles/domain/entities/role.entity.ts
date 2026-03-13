import { Entity } from "@/shared/domain";

export interface PermissionProps {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

export interface RoleProps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  permissions: PermissionProps[];
  createdAt: Date;
  updatedAt: Date;
}

export class Role extends Entity<string> {
  constructor(private readonly roleProps: RoleProps) {
    super(roleProps.id);
  }

  get name(): string {
    return this.roleProps.name;
  }

  get description(): string | null {
    return this.roleProps.description;
  }

  get isActive(): boolean {
    return this.roleProps.isActive;
  }

  get isSystem(): boolean {
    return this.roleProps.isSystem;
  }

  get permissions(): PermissionProps[] {
    return this.roleProps.permissions;
  }

  get permissionCount(): number {
    return this.roleProps.permissions.length;
  }

  get createdAt(): Date {
    return this.roleProps.createdAt;
  }

  get updatedAt(): Date {
    return this.roleProps.updatedAt;
  }

  toJSON() {
    return { ...this.roleProps };
  }

  get canEdit(): boolean {
    return !this.isSystem;
  }

  get canDelete(): boolean {
    return !this.isSystem;
  }
}
