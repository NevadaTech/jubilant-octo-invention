"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

function formatDisplay(num: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  disabled,
  id,
  className,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() =>
    value ? formatDisplay(value) : ""
  );

  // Sync display when value changes externally (e.g. form reset)
  useEffect(() => {
    setDisplay(value ? formatDisplay(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");

    if (!digits) {
      setDisplay("");
      onChange(0);
      return;
    }

    const num = parseInt(digits, 10);
    setDisplay(formatDisplay(num));
    onChange(num);
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("tabular-nums pl-7", className)}
      />
    </div>
  );
}
