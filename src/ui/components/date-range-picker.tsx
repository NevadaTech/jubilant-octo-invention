"use client";

import { useState } from "react";
import { format, isSameDay, type Locale } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/popover";
import { Calendar } from "@/ui/components/calendar";
import type { DateRange } from "react-day-picker";

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  id?: string;
  className?: string;
}

function DateRangePicker({
  value,
  onChange,
  placeholder,
  disabled,
  maxDate,
  minDate,
  id,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  // Internal draft so we never push a partial range to the parent
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const locale = useLocale();
  const dateLocale = localeMap[locale] ?? enUS;

  const disabledMatcher = [];
  if (maxDate) disabledMatcher.push({ after: maxDate });
  if (minDate) disabledMatcher.push({ before: minDate });

  const handleSelect = (range: DateRange | undefined) => {
    const hasFrom = !!range?.from;
    const hasTo = !!range?.to;
    // react-day-picker fires { from: X, to: X } on the first click (same day).
    // We treat that as "only from selected" and wait for a real second click.
    const isFirstClick =
      hasFrom && hasTo && isSameDay(range.from!, range.to!) && !draft;

    if (hasFrom && hasTo && !isFirstClick) {
      // Complete range with two distinct clicks → commit and close
      setDraft(undefined);
      onChange(range);
      setOpen(false);
    } else {
      // First click or partial → keep in draft, don't notify parent
      setDraft(range);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Closing without a complete range → discard the draft
      setDraft(undefined);
    }
    setOpen(nextOpen);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(undefined);
    onChange(undefined);
  };

  // What the calendar shows: the draft (partial click) takes priority over the committed value
  const calendarValue = draft ?? value;

  const formatDateRange = () => {
    if (!value?.from && !value?.to) return undefined;

    const fromStr = value?.from
      ? format(value.from, "PP", { locale: dateLocale })
      : "";
    const toStr = value?.to
      ? format(value.to, "PP", { locale: dateLocale })
      : "";

    if (fromStr && toStr) {
      return `${fromStr} - ${toStr}`;
    }
    return fromStr || toStr;
  };

  const displayValue = formatDateRange();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !displayValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {displayValue || (placeholder ?? "Pick a date range")}
          {displayValue && (
            <X
              className="ml-auto h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={calendarValue}
          onSelect={handleSelect}
          disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
          defaultMonth={value?.from ?? new Date()}
          locale={dateLocale}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
export type { DateRangePickerProps };
