"use client";

import { createContext, use, type ReactNode } from "react";
import { type Container, createContainer } from "./container";

const ContainerContext = createContext<Container | null>(null);

interface ContainerProviderProps {
  children: ReactNode;
}

export function ContainerProvider({ children }: ContainerProviderProps) {
  const container = createContainer();

  return <ContainerContext value={container}>{children}</ContainerContext>;
}

export function useContainer(): Container {
  const context = use(ContainerContext);
  if (!context) {
    throw new Error("useContainer must be used within a ContainerProvider");
  }
  return context;
}
