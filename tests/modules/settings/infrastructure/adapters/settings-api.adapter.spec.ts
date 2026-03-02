import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http/axios-http-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http/axios-http-client";
import { SettingsApiAdapter } from "@/modules/settings/infrastructure/adapters/settings-api.adapter";
import type {
  ProfileResponseDto,
  AlertConfigurationResponseDto,
} from "@/modules/settings/application/dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPut = vi.mocked(apiClient.put);

function buildProfileResponse(
  overrides: Partial<ProfileResponseDto> = {},
): ProfileResponseDto {
  return {
    success: true,
    message: "OK",
    data: {
      id: "user-1",
      email: "admin@example.com",
      username: "admin",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      timezone: "America/New_York",
      language: "en",
      jobTitle: "Manager",
      department: "Operations",
      roles: ["ADMIN"],
      permissions: ["USERS:CREATE", "SALES:READ"],
    },
    timestamp: "2026-02-20T10:00:00.000Z",
    ...overrides,
  };
}

function buildAlertConfigResponse(
  overrides: Partial<AlertConfigurationResponseDto> = {},
): AlertConfigurationResponseDto {
  return {
    success: true,
    message: "OK",
    data: {
      id: "alert-1",
      orgId: "org-1",
      cronFrequency: "EVERY_HOUR",
      notifyLowStock: true,
      notifyCriticalStock: true,
      notifyOutOfStock: false,
      recipientEmails: "admin@example.com,ops@example.com",
      isEnabled: true,
      lastRunAt: "2026-02-20T09:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-20T09:00:00.000Z",
    },
    timestamp: "2026-02-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("SettingsApiAdapter", () => {
  let adapter: SettingsApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new SettingsApiAdapter();
  });

  describe("getProfile", () => {
    it("Given the user is authenticated, When getProfile is called, Then it returns the ProfileResponseDto from /users/me", async () => {
      const profile = buildProfileResponse();
      mockedGet.mockResolvedValue({ data: profile, status: 200, headers: {} });

      const result = await adapter.getProfile();

      expect(mockedGet).toHaveBeenCalledWith("/users/me");
      expect(result.data.id).toBe("user-1");
      expect(result.data.email).toBe("admin@example.com");
      expect(result.data.firstName).toBe("John");
      expect(result.data.roles).toContain("ADMIN");
    });
  });

  describe("updateProfile", () => {
    it("Given valid profile data, When updateProfile is called, Then it puts to /users/me and returns updated ProfileResponseDto", async () => {
      const updateDto = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+9876543210",
        timezone: "Europe/London",
        language: "es",
        jobTitle: "Director",
        department: "Sales",
      };
      const updatedProfile = buildProfileResponse({
        data: {
          id: "user-1",
          email: "admin@example.com",
          username: "admin",
          firstName: "Jane",
          lastName: "Smith",
          phone: "+9876543210",
          timezone: "Europe/London",
          language: "es",
          jobTitle: "Director",
          department: "Sales",
          roles: ["ADMIN"],
          permissions: ["USERS:CREATE"],
        },
      });
      mockedPut.mockResolvedValue({
        data: updatedProfile,
        status: 200,
        headers: {},
      });

      const result = await adapter.updateProfile(updateDto);

      expect(mockedPut).toHaveBeenCalledWith("/users/me", updateDto);
      expect(result.data.firstName).toBe("Jane");
      expect(result.data.timezone).toBe("Europe/London");
    });

    it("Given partial profile data, When updateProfile is called, Then only provided fields are sent", async () => {
      const updateDto = { jobTitle: "Senior Manager" };
      const updatedProfile = buildProfileResponse();
      mockedPut.mockResolvedValue({
        data: updatedProfile,
        status: 200,
        headers: {},
      });

      await adapter.updateProfile(updateDto);

      expect(mockedPut).toHaveBeenCalledWith("/users/me", {
        jobTitle: "Senior Manager",
      });
    });
  });

  describe("getAlertConfiguration", () => {
    it("Given alert config exists, When getAlertConfiguration is called, Then it returns the AlertConfigurationResponseDto from /settings/alerts", async () => {
      const alertConfig = buildAlertConfigResponse();
      mockedGet.mockResolvedValue({
        data: alertConfig,
        status: 200,
        headers: {},
      });

      const result = await adapter.getAlertConfiguration();

      expect(mockedGet).toHaveBeenCalledWith("/settings/alerts");
      expect(result.data.cronFrequency).toBe("EVERY_HOUR");
      expect(result.data.notifyLowStock).toBe(true);
      expect(result.data.isEnabled).toBe(true);
      expect(result.data.recipientEmails).toBe(
        "admin@example.com,ops@example.com",
      );
    });
  });

  describe("updateAlertConfiguration", () => {
    it("Given valid alert configuration data, When updateAlertConfiguration is called, Then it puts to /settings/alerts", async () => {
      const updateDto = {
        cronFrequency: "EVERY_6_HOURS",
        notifyLowStock: false,
        notifyCriticalStock: true,
        notifyOutOfStock: true,
        recipientEmails: "new@example.com",
        isEnabled: false,
      };
      const updatedConfig = buildAlertConfigResponse({
        data: {
          id: "alert-1",
          orgId: "org-1",
          cronFrequency: "EVERY_6_HOURS",
          notifyLowStock: false,
          notifyCriticalStock: true,
          notifyOutOfStock: true,
          recipientEmails: "new@example.com",
          isEnabled: false,
          lastRunAt: "2026-02-20T09:00:00.000Z",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-02-20T10:30:00.000Z",
        },
      });
      mockedPut.mockResolvedValue({
        data: updatedConfig,
        status: 200,
        headers: {},
      });

      const result = await adapter.updateAlertConfiguration(updateDto);

      expect(mockedPut).toHaveBeenCalledWith("/settings/alerts", updateDto);
      expect(result.data.cronFrequency).toBe("EVERY_6_HOURS");
      expect(result.data.isEnabled).toBe(false);
    });

    it("Given partial alert configuration data, When updateAlertConfiguration is called, Then only provided fields are sent", async () => {
      const updateDto = { isEnabled: true };
      const config = buildAlertConfigResponse();
      mockedPut.mockResolvedValue({ data: config, status: 200, headers: {} });

      await adapter.updateAlertConfiguration(updateDto);

      expect(mockedPut).toHaveBeenCalledWith("/settings/alerts", {
        isEnabled: true,
      });
    });
  });

  describe("error propagation", () => {
    it("Given the API returns an error, When getProfile is called, Then the error propagates to the caller", async () => {
      mockedGet.mockRejectedValue(new Error("Unauthorized"));

      await expect(adapter.getProfile()).rejects.toThrow("Unauthorized");
    });

    it("Given the API returns an error, When updateAlertConfiguration is called, Then the error propagates", async () => {
      mockedPut.mockRejectedValue(new Error("Forbidden"));

      await expect(
        adapter.updateAlertConfiguration({ isEnabled: false }),
      ).rejects.toThrow("Forbidden");
    });
  });
});
