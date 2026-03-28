"use client";

import {
  useState,
  useCallback,
  createContext,
  useContext,
  type ComponentProps,
} from "react";
import {
  DayPicker,
  type DayPickerProps,
  type MonthChangeEventHandler,
} from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import { cn } from "@/ui/lib/utils";
import { Button, buttonVariants } from "@/ui/components/button";

type CalendarView = "days" | "months" | "years";

const YEAR_RANGE = 12;

// Context to share Calendar state with extracted sub-components
interface CalendarState {
  displayMonth: Date;
  handleMonthChange: (m: Date) => void;
  setView: (view: CalendarView) => void;
  locale?: ComponentProps<typeof DayPicker>["locale"];
}

const CalendarStateContext = createContext<CalendarState | null>(null);

function CustomMonthCaption({
  calendarMonth,
}: {
  calendarMonth: { date: Date };
}) {
  const { displayMonth, handleMonthChange, setView, locale } =
    useContext(CalendarStateContext)!;
  const label = format(calendarMonth.date, "LLLL yyyy", {
    locale: locale as import("date-fns").Locale | undefined,
  });
  return (
    <MonthYearHeader
      label={label}
      onPrev={() => {
        const prev = new Date(displayMonth);
        prev.setMonth(prev.getMonth() - 1);
        handleMonthChange(prev);
      }}
      onNext={() => {
        const next = new Date(displayMonth);
        next.setMonth(next.getMonth() + 1);
        handleMonthChange(next);
      }}
      onLabelClick={() => setView("months")}
    />
  );
}

function EmptyNav() {
  return <></>;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  locale,
  ...props
}: ComponentProps<typeof DayPicker>) {
  const [view, setView] = useState<CalendarView>("days");
  const [internalMonth, setInternalMonth] = useState(
    () => controlledMonth ?? defaultMonth ?? new Date(),
  );

  const displayMonth = controlledMonth ?? internalMonth;

  const handleMonthChange: MonthChangeEventHandler = useCallback(
    (m) => {
      setInternalMonth(m);
      onMonthChange?.(m);
    },
    [onMonthChange],
  );

  const [yearRangeStart, setYearRangeStart] = useState(
    () => displayMonth.getFullYear() - Math.floor(YEAR_RANGE / 2),
  );

  // ── Month grid view ──
  if (view === "months") {
    const months = Array.from({ length: 12 }, (_, i) => ({
      index: i,
      name: format(new Date(displayMonth.getFullYear(), i, 1), "MMM", {
        locale: locale as import("date-fns").Locale | undefined,
      }),
    }));

    return (
      <div className={cn("p-3 w-[280px]", className)}>
        <MonthYearHeader
          label={String(displayMonth.getFullYear())}
          onPrev={() => {
            const prev = setYear(displayMonth, displayMonth.getFullYear() - 1);
            handleMonthChange(prev);
          }}
          onNext={() => {
            const next = setYear(displayMonth, displayMonth.getFullYear() + 1);
            handleMonthChange(next);
          }}
          onLabelClick={() => {
            setYearRangeStart(
              displayMonth.getFullYear() - Math.floor(YEAR_RANGE / 2),
            );
            setView("years");
          }}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {months.map((m) => {
            const isCurrentMonth = m.index === displayMonth.getMonth();
            return (
              <Button
                key={m.name}
                variant={isCurrentMonth ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 text-sm capitalize",
                  isCurrentMonth && "font-semibold",
                )}
                onClick={() => {
                  handleMonthChange(setMonth(displayMonth, m.index));
                  setView("days");
                }}
              >
                {m.name}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Year grid view ──
  if (view === "years") {
    const years = Array.from(
      { length: YEAR_RANGE },
      (_, i) => yearRangeStart + i,
    );

    return (
      <div className={cn("p-3 w-[280px]", className)}>
        <MonthYearHeader
          label={`${yearRangeStart} – ${yearRangeStart + YEAR_RANGE - 1}`}
          onPrev={() => setYearRangeStart((s) => s - YEAR_RANGE)}
          onNext={() => setYearRangeStart((s) => s + YEAR_RANGE)}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {years.map((year) => {
            const isCurrent = year === displayMonth.getFullYear();
            return (
              <Button
                key={year}
                variant={isCurrent ? "default" : "ghost"}
                size="sm"
                className={cn("h-9 text-sm", isCurrent && "font-semibold")}
                onClick={() => {
                  handleMonthChange(setYear(displayMonth, year));
                  setView("months");
                }}
              >
                {year}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Days view (default DayPicker) ──
  const dayPickerProps: DayPickerProps = {
    showOutsideDays,
    month: displayMonth,
    onMonthChange: handleMonthChange,
    locale,
    ...props,
  };

  return (
    <CalendarStateContext.Provider
      value={{ displayMonth, handleMonthChange, setView, locale }}
    >
      <DayPicker
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          month_caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "flex items-center gap-1",
          button_previous: cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          button_next: cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          week: "flex w-full mt-2",
          day: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            "h-9 w-9 [&:has(button)]:hover:bg-accent [&:has(button)]:rounded-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          ),
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 aria-selected:bg-transparent aria-selected:text-inherit",
          ),
          range_start:
            "day-range-start rounded-md bg-primary text-primary-foreground",
          range_end:
            "day-range-end rounded-md bg-primary text-primary-foreground",
          selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
          today: "bg-accent text-accent-foreground rounded-md",
          outside:
            "day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50",
          disabled: "text-muted-foreground opacity-50",
          range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          hidden: "invisible",
          ...classNames,
        }}
        components={{
          MonthCaption: CustomMonthCaption,
          Nav: EmptyNav,
        }}
        {...dayPickerProps}
      />
    </CalendarStateContext.Provider>
  );
}

Calendar.displayName = "Calendar";

// ── Shared header with arrows beside the label ──

function MonthYearHeader({
  label,
  onPrev,
  onNext,
  onLabelClick,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onLabelClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-transparent opacity-50 hover:opacity-100"
        onClick={onPrev}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <button
        type="button"
        className={cn(
          "px-2 py-1 text-sm font-medium rounded-md capitalize transition-colors",
          onLabelClick
            ? "hover:bg-accent hover:text-accent-foreground cursor-pointer"
            : "cursor-default",
        )}
        onClick={onLabelClick}
      >
        {label}
      </button>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-transparent opacity-50 hover:opacity-100"
        onClick={onNext}
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export { Calendar };
