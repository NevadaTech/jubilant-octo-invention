export interface UpdateAlertConfigurationDto {
  cronFrequency?: string;
  notifyLowStock?: boolean;
  notifyCriticalStock?: boolean;
  notifyOutOfStock?: boolean;
  recipientEmails?: string;
  isEnabled?: boolean;
}

export interface AlertConfigurationData {
  id: string;
  orgId: string;
  cronFrequency: string;
  notifyLowStock: boolean;
  notifyCriticalStock: boolean;
  notifyOutOfStock: boolean;
  recipientEmails: string;
  isEnabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertConfigurationResponseDto {
  success: boolean;
  message: string;
  data: AlertConfigurationData;
  timestamp: string;
}
