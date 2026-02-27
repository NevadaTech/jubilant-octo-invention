export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  jobTitle?: string;
  department?: string;
}

export interface ProfileResponseDto {
  success: boolean;
  message: string;
  data: {
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
    roles: string[];
    permissions: string[];
  };
  timestamp: string;
}
