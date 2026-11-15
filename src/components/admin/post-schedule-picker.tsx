"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function getBrasiliaNow(): {
  dateObj: Date;
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);
  const hour = Number(map.hour);
  const minute = Number(map.minute);
  const second = Number(map.second || 0);

  return {
    dateObj: new Date(year, month - 1, day),
    year,
    month,
    day,
    hour,
    minute,
    second,
  };
}

export function parseScheduleValue(value?: string | null): {
  hasValue: boolean;
  date?: Date;
  time: string;
} {
  if (!value || !value.trim()) {
    return {
      hasValue: false,
      date: undefined,
      time: "12:00:00",
    };
  }

  try {
    let str = value.trim();
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
      str += ":00-03:00";
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
      str += "-03:00";
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const parts = formatter.formatToParts(d);
      const map: Record<string, string> = {};
      for (const p of parts) {
        map[p.type] = p.value;
      }

      const year = Number(map.year);
      const month = Number(map.month);
      const day = Number(map.day);
      const hour = map.hour.padStart(2, "0");
      const minute = map.minute.padStart(2, "0");
      const second = (map.second || "00").padStart(2, "0");

      return {
        hasValue: true,
        date: new Date(year, month - 1, day),
        time: `${hour}:${minute}:${second}`,
      };
    }
  } catch {
    // fallback
  }

  return {
    hasValue: false,
    date: undefined,
    time: "12:00:00",
  };
}

export function composeIso(
  date: Date | undefined,
  timeString: string
): string {
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  let [h = "12", m = "00", s = "00"] = (timeString || "12:00:00").split(":");
  h = h.padStart(2, "0");
  m = m.padStart(2, "0");
  s = s.padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${h}:${m}:${s}-03:00`;
}

export function PostSchedulePicker({
  value,
  onChange,
  error,
}: {
  value?: string | null;
  onChange: (isoString: string) => void;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // Deriva data e horário a partir do valor recebido (sem loop de re-render)
  const parsed = React.useMemo(() => parseScheduleValue(value), [value]);

  const [fallbackTime, setFallbackTime] = React.useState("12:00:00");

  const selectedDate = parsed.date;
  const selectedTime = parsed.hasValue ? parsed.time : fallbackTime;

  // Hora atual em Brasília
  const bNow = getBrasiliaNow();

  // Interação do Usuário: Seleção de data no Calendário
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onChange("");
      return;
    }

    let targetTime = selectedTime;

    // Se selecionou o dia de hoje, ajusta para horário futuro caso o atual já tenha passado
    if (isSameDay(newDate, bNow.dateObj)) {
      let [h = "0", m = "0"] = targetTime.split(":");
      const hNum = Number(h);
      const mNum = Number(m);
      if (hNum < bNow.hour || (hNum === bNow.hour && mNum <= bNow.minute)) {
        let validHour = bNow.hour;
        let validMin = bNow.minute + 5;
        if (validMin >= 60) {
          validMin = 0;
          validHour += 1;
        }
        if (validHour >= 24) {
          validHour = 23;
          validMin = 59;
        }
        targetTime = `${String(validHour).padStart(2, "0")}:${String(validMin).padStart(2, "0")}:00`;
        setFallbackTime(targetTime);
      }
    }

    onChange(composeIso(newDate, targetTime));
    setOpen(false);
  };

  // Interação do Usuário: Mudança de horário (Input type="time" step="1")
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFallbackTime(val || "12:00:00");
    if (selectedDate && val) {
      onChange(composeIso(selectedDate, val));
    }
  };

  // Verificação em tempo real se o horário está no passado
  const isPastTime = React.useMemo(() => {
    if (!selectedDate) return false;
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    let [h = "12", m = "00", s = "00"] = (selectedTime || "12:00:00").split(":");
    const target = new Date(
      `${yyyy}-${mm}-${dd}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}-03:00`
    );
    return target.getTime() <= Date.now();
  }, [selectedDate, selectedTime]);

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-4">
      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
        <i className="bx bx-calendar-event text-blue-500 text-lg" />
        <span>Agendamento de Publicação</span>
        <span className="text-xs font-normal text-muted-foreground ml-auto">
          Fuso: Horário de Brasília (UTC-3)
        </span>
      </div>

      <FieldGroup className="flex-row items-end gap-3 flex-wrap">
        {/* Campo de Data (com Shadcn Popover e Calendar pt-BR) */}
        <Field className="flex-1 min-w-[200px]">
          <FieldLabel htmlFor="date-picker-schedule" className="text-xs font-medium">
            Data
          </FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker-schedule"
                className={cn(
                  "w-full justify-between font-normal h-9 bg-card hover:bg-accent/40 border-border text-xs sm:text-sm",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
                <i className="bx bx-chevron-down text-base opacity-60 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                defaultMonth={selectedDate}
                locale={ptBR}
                disabled={(d) => {
                  const check = new Date(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate()
                  );
                  return check < bNow.dateObj;
                }}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </Field>

        {/* Campo de Horário (Shadcn Field com Input type="time" step="1") */}
        <Field className="w-36">
          <FieldLabel htmlFor="time-picker-schedule" className="text-xs font-medium">
            Horário
          </FieldLabel>
          <Input
            type="time"
            id="time-picker-schedule"
            step="1"
            value={selectedTime}
            onChange={handleTimeChange}
            className="appearance-none bg-card font-mono text-xs sm:text-sm h-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </Field>
      </FieldGroup>

      {/* Resumo e Alertas de Validação */}
      {selectedDate && (
        <div
          className={cn(
            "text-xs rounded-md px-3 py-2 flex items-center gap-2 border",
            isPastTime
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
              : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300"
          )}
        >
          <i
            className={cn(
              "text-base",
              isPastTime ? "bx bx-error-circle" : "bx bx-info-circle"
            )}
          />
          {isPastTime ? (
            <span>
              O horário selecionado já passou. Por favor, selecione um horário futuro.
            </span>
          ) : (
            <span>
              O post será publicado em{" "}
              <strong>
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </strong>{" "}
              às <strong>{selectedTime}</strong> (Horário de Brasília).
            </span>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
