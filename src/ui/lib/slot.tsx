"use client";

import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ReactNode, HTMLAttributes } from "react";

interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
) {
  const overrideProps: Record<string, unknown> = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ");
    } else if (propName === "style") {
      overrideProps[propName] = {
        ...(slotPropValue as object),
        ...(childPropValue as object),
      };
    } else if (
      propName.startsWith("on") &&
      typeof slotPropValue === "function" &&
      typeof childPropValue === "function"
    ) {
      overrideProps[propName] = (...args: unknown[]) => {
        childPropValue(...args);
        slotPropValue(...args);
      };
    }
  }

  return { ...slotProps, ...overrideProps };
}

export const Slot = forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    const childrenArray = Children.toArray(children);
    const child = childrenArray[0];

    if (!isValidElement(child)) {
      return null;
    }

    return cloneElement(child, {
      ...mergeProps(slotProps, child.props as Record<string, unknown>),
      ref: forwardedRef,
    } as Record<string, unknown>);
  },
);

Slot.displayName = "Slot";
