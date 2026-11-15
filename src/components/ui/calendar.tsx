"use client";

import * as React from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarDropdown({
  value,
  onChange,
  options,
  disabled,
}: DropdownProps) {
  const selectedOption = options?.find((o) => o.value === value);

  return (
    <Select
      value={String(value)}
      onValueChange={(val) => {
        if (onChange) {
          const fakeEvent = {
            target: { value: val },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(fakeEvent);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-7 w-auto min-w-[5.25rem] px-2 py-0 text-xs font-medium bg-card border-border hover:bg-accent/50 gap-1 capitalize">
        <SelectValue placeholder={selectedOption?.label}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-56 z-50">
        {options?.map((opt) => (
          <SelectItem
            key={opt.value}
            value={String(opt.value)}
            disabled={opt.disabled}
            className="text-xs capitalize cursor-pointer"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CalendarChevron({ orientation }: { orientation?: string }) {
  if (orientation === "left") {
    return <i className="bx bx-chevron-left text-base" />;
  }
  if (orientation === "right") {
    return <i className="bx bx-chevron-right text-base" />;
  }
  return <i className="bx bx-chevron-down text-xs opacity-60" />;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  startMonth,
  endMonth,
  components,
  ...props
}: CalendarProps) {
  const nowYear = new Date().getFullYear();
  const resolvedStartMonth = startMonth ?? new Date(nowYear, 0, 1);
  const resolvedEndMonth = endMonth ?? new Date(nowYear + 10, 11, 31);

  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      startMonth={resolvedStartMonth}
      endMonth={resolvedEndMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-2",
        month: "flex flex-col gap-2",
        month_caption:
          "flex justify-center items-center h-8 relative w-full mb-1",
        caption_label: "text-sm font-medium capitalize",
        dropdowns: "flex items-center justify-center gap-1.5 z-20",
        nav: "flex items-center justify-between w-full absolute top-0.5 inset-x-0 px-0.5 pointer-events-none z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-card p-0 opacity-70 hover:opacity-100 pointer-events-auto"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-card p-0 opacity-70 hover:opacity-100 pointer-events-auto"
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] capitalize text-center",
        week: "flex w-full mt-2 justify-between",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground font-semibold rounded-md",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: CalendarChevron,
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
