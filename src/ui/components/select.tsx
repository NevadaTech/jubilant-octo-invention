"use client";

import {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/ui/lib/utils";

interface SelectContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  displayText: string;
  setDisplayText: (text: string) => void;
  disabled: boolean;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

interface SelectProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
}

function Select({
  children,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  defaultOpen = false,
  disabled = false,
}: SelectProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [displayText, setDisplayText] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isOpenControlled = controlledOpen !== undefined;
  const isValueControlled = controlledValue !== undefined;

  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;
  const value = isValueControlled ? controlledValue : uncontrolledValue;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isOpenControlled, onOpenChange],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isValueControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      handleOpenChange(false);
    },
    [isValueControlled, onValueChange, handleOpenChange],
  );

  return (
    <SelectContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        value,
        onValueChange: handleValueChange,
        triggerRef,
        displayText,
        setDisplayText,
        disabled,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  disabled?: boolean;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, disabled: disabledProp, ...props }, ref) => {
    const {
      open,
      onOpenChange,
      triggerRef,
      disabled: disabledCtx,
    } = useSelectContext();
    const isDisabled = disabledProp ?? disabledCtx;

    const combinedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
        }
      },
      [ref, triggerRef],
    );

    return (
      <button
        ref={combinedRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className,
        )}
        disabled={isDisabled}
        onClick={() => !isDisabled && onOpenChange(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value, displayText } = useSelectContext();
  if (children) {
    return <span>{children}</span>;
  }
  return <span>{(value ? displayText || value : null) || placeholder}</span>;
}

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "item-aligned";
}

function computePosition(
  triggerRect: DOMRect,
  contentEl: HTMLDivElement | null,
): { top: number; left: number; width: number } {
  const gap = 4;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const width = Math.max(triggerRect.width, 128);

  // Measure content height (fallback to 200 if not yet rendered)
  const contentH = contentEl?.offsetHeight || 200;

  // Vertical: prefer below, flip above if not enough space
  const spaceBelow = viewportH - triggerRect.bottom - gap;
  const spaceAbove = triggerRect.top - gap;
  let top: number;
  if (spaceBelow >= contentH || spaceBelow >= spaceAbove) {
    top = triggerRect.bottom + window.scrollY + gap;
  } else {
    top = triggerRect.top + window.scrollY - contentH - gap;
  }

  // Horizontal: prefer left-aligned, shift left if overflows right
  let left = triggerRect.left + window.scrollX;
  if (left + width > viewportW + window.scrollX) {
    left = triggerRect.right + window.scrollX - width;
  }
  // Clamp to viewport left edge
  if (left < window.scrollX) {
    left = window.scrollX + gap;
  }

  return { top, left, width };
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useSelectContext();
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const contentRef = useRef<HTMLDivElement>(null);

    const combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
        // Re-position once the content DOM node mounts (real height is known)
        if (node && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setCoords(computePosition(rect, node));
        }
      },
      [ref, triggerRef],
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    // Initial position pass (before content renders, uses estimated height)
    useLayoutEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords(computePosition(rect, null));
      }
    }, [open, triggerRef]);

    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (triggerRef.current?.contains(e.target as Node)) return;
        if (contentRef.current?.contains(e.target as Node)) return;
        onOpenChange(false);
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange, triggerRef]);

    if (!mounted || !open) return null;

    return createPortal(
      <div
        ref={combinedRef}
        className={cn(
          "fixed z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
        {...props}
      >
        <div className="p-1 overflow-y-auto max-h-[var(--select-content-available-height,theme(maxHeight.96))]">
          {children}
        </div>
      </div>,
      document.body,
    );
  },
);
SelectContent.displayName = "SelectContent";

const SelectLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  ),
);
SelectLabel.displayName = "SelectLabel";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node))
    return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      setDisplayText,
    } = useSelectContext();
    const isSelected = selectedValue === value;

    // Extract text content from children for display
    useEffect(() => {
      if (isSelected) {
        const text = extractText(children);
        if (text) {
          setDisplayText(text);
        }
      }
    }, [isSelected, children, setDisplayText]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-disabled={disabled}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          !disabled &&
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
          className,
        )}
        onClick={() => {
          if (!disabled) {
            const text = extractText(children);
            if (text) setDisplayText(text);
            onValueChange(value);
          }
        }}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  },
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
