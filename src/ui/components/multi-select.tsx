"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/ui/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  allLabel?: string;
  selectedLabel?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

function computePosition(
  triggerRect: DOMRect,
  contentEl: HTMLDivElement | null,
): { top: number; left: number; width: number } {
  const gap = 4;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const width = Math.max(triggerRect.width, 128);
  const contentH = contentEl?.offsetHeight || 200;

  const spaceBelow = viewportH - triggerRect.bottom - gap;
  const spaceAbove = triggerRect.top - gap;
  let top: number;
  if (spaceBelow >= contentH || spaceBelow >= spaceAbove) {
    top = triggerRect.bottom + window.scrollY + gap;
  } else {
    top = triggerRect.top + window.scrollY - contentH - gap;
  }

  let left = triggerRect.left + window.scrollX;
  if (left + width > viewportW + window.scrollX) {
    left = triggerRect.right + window.scrollX - width;
  }
  if (left < window.scrollX) {
    left = window.scrollX + gap;
  }

  return { top, left, width };
}

export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  allLabel,
  selectedLabel,
  className,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search, searchable]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords(computePosition(rect, null));
    }
  }, [open]);

  const contentCallbackRef = useCallback((node: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current =
      node;
    if (node && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords(computePosition(rect, node));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (contentRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onValueChange(value.filter((v) => v !== val));
    } else {
      onValueChange([...value, val]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange([]);
  };

  const isAllSelected = value.length === 0;
  const selectedCount = value.length;

  const displayText = isAllSelected
    ? allLabel || placeholder
    : selectedCount === 1
      ? options.find((o) => o.value === value[0])?.label || value[0]
      : `${selectedCount} ${selectedLabel || "selected"}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1">
          {selectedCount > 0 && (
            <span
              role="button"
              tabIndex={-1}
              className="rounded-sm p-0.5 hover:bg-accent"
              onClick={clearAll}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  clearAll(e as unknown as React.MouseEvent);
              }}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={contentCallbackRef}
            className="fixed z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {searchable && (
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <div className="p-1 overflow-y-auto max-h-80">
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50",
                    )}
                    onClick={() => toggleValue(option.value)}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50",
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </span>
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
