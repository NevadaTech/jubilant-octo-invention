"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompanyStoreState {
  selectedCompanyId: string | null;
  setSelectedCompany: (id: string | null) => void;
}

export const useCompanyStore = create<CompanyStoreState>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompany: (id) => set({ selectedCompanyId: id }),
    }),
    {
      name: "company-selection",
    },
  ),
);
