import { describe, it, expect, beforeEach } from "vitest";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

describe("useCompanyStore", () => {
  beforeEach(() => {
    useCompanyStore.setState({ selectedCompanyId: null });
  });

  it("Given: initial state When: reading selectedCompanyId Then: should be null", () => {
    const state = useCompanyStore.getState();

    expect(state.selectedCompanyId).toBeNull();
  });

  it("Given: a company ID When: setSelectedCompany is called Then: should update the ID", () => {
    useCompanyStore.getState().setSelectedCompany("company-001");

    expect(useCompanyStore.getState().selectedCompanyId).toBe("company-001");
  });

  it("Given: a selected company When: setSelectedCompany(null) is called Then: should clear selection", () => {
    useCompanyStore.getState().setSelectedCompany("company-001");
    useCompanyStore.getState().setSelectedCompany(null);

    expect(useCompanyStore.getState().selectedCompanyId).toBeNull();
  });

  it("Given: a selected company When: setSelectedCompany with different ID Then: should update", () => {
    useCompanyStore.getState().setSelectedCompany("company-001");
    useCompanyStore.getState().setSelectedCompany("company-002");

    expect(useCompanyStore.getState().selectedCompanyId).toBe("company-002");
  });
});
