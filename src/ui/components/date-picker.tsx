"use client";

import { useState } from "react";
import { format, type Locale } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/popover";
import { Calendar } from "@/ui/components/calendar";

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  id?: string;
}

function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  maxDate,
  minDate,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const dateLocale = localeMap[locale] ?? enUS;

  const disabledMatcher = [];
  if (maxDate) disabledMatcher.push({ after: maxDate });
  if (minDate) disabledMatcher.push({ before: minDate });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {value
            ? format(value, "PPP", { locale: dateLocale })
            : (placeholder ?? "Pick a date")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
          defaultMonth={value}
          locale={dateLocale}
          animate
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";

export { DatePicker };
export type { DatePickerProps };
