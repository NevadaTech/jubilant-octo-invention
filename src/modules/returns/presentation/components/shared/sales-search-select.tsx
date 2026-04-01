"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/ui/lib/utils";
import { useSalesSearch } from "@/modules/sales/presentation/hooks/use-sales-search";

interface SalesSearchSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  companyId?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  excludeStatuses?: string[];
}

/**
 * Selector de ventas con:
 * - Búsqueda en backend por número de venta, referencia cliente, nombre de contacto (con debounce 300ms)
 * - Lazy loading / infinite scroll (intersection observer)
 * - Portal para evitar overflow clipping en modales
 * - Excluye ventas con ciertos estados (ej: DRAFT, CANCELLED)
 */
export function SalesSearchSelect({
  value,
  onValueChange,
  companyId,
  placeholder = "Seleccionar venta...",
  searchPlaceholder = "Buscar por número, cliente o referencia...",
  emptyMessage = "Sin resultados",
  disabled = false,
  className,
  excludeStatuses = ["DRAFT", "CANCELLED"],
}: SalesSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openAbove: false,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { sales, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSalesSearch({
      search,
      companyId,
      enabled: open,
    });

  // Filtrar ventas excluyendo estados no deseados
  const filteredSales = sales.filter(
    (sale) => !excludeStatuses.includes(sale.status),
  );

  const selectedSale = filteredSales.find((s) => s.id === value);
  const selectedLabel = selectedSale
    ? `${selectedSale.saleNumber} — ${selectedSale.currency} ${selectedSale.totalAmount.toLocaleString()}`
    : undefined;

  // Calcular posición del dropdown
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setCoords({
      top: openAbove ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openAbove,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      updateCoords();
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    } else {
      setSearch("");
    }
  }, [open, updateCoords]);

  // Cerrar al click fuera o Escape
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
    const handleScroll = () => updateCoords();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updateCoords]);

  // Intersection observer para lazy loading
  useEffect(() => {
    if (!bottomRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className,
        )}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className={cn(!selectedLabel && "text-muted-foreground")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={contentRef}
            className={cn(
              "z-50 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
              coords.openAbove && "flex flex-col-reverse",
            )}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: Math.max(coords.width, 300),
              ...(coords.openAbove ? { transform: "translateY(-100%)" } : {}),
            }}
          >
            {/* Search input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Lista de ventas */}
            <div className="max-h-64 overflow-y-auto p-1">
              {isLoading && filteredSales.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      role="option"
                      aria-selected={value === sale.id}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        value === sale.id && "bg-accent text-accent-foreground",
                      )}
                      onClick={() => {
                        onValueChange?.(sale.id);
                        setOpen(false);
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {value === sale.id && <Check className="h-4 w-4" />}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{sale.saleNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {sale.warehouseName} — {sale.currency}{" "}
                          {sale.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Sentinel para el intersection observer */}
                  <div ref={bottomRef} className="py-1">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Cargando más...
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
