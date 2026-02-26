"use client";

import { useEffect, useCallback, useRef } from "react";
import { eventBus } from "@/shared/infrastructure/events/event-bus";
import type { DomainEvent } from "@/shared/domain/entities/aggregate-root";

export function useDomainEvent(
  eventName: string,
  handler: (event: DomainEvent) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const stableHandler = useCallback(
    (event: DomainEvent) => handlerRef.current(event),
    [],
  );

  useEffect(() => {
    return eventBus.subscribe(eventName, stableHandler);
  }, [eventName, stableHandler]);
}
