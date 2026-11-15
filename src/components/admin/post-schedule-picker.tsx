"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function getBrasiliaNow(): {
  dateObj: Date;
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

  return {
    dateObj: new Date(year, month - 1, day),
    year,
    month,
    day,
    hour,
    minute,
  };
}

function parseInitialValue(value?: string | null): {
  date?: Date;
  hour: string;
  minute: string;
} {
  if (!value || !value.trim()) {
    const bNow = getBrasiliaNow();
    // Sugere o próximo horário cheio (ex: se são 14:15, sugere 15:00)
    let nextHour = bNow.hour + 1;
    let nextDayObj = bNow.dateObj;
    if (nextHour >= 24) {
      nextHour = 9; // 09:00 do dia seguinte
      nextDayObj = new Date(bNow.dateObj);
      nextDayObj.setDate(nextDayObj.getDate() + 1);
    }
    return {
      date: nextDayObj,
      hour: String(nextHour).padStart(2, "0"),
      minute: "00",
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
        hour12: false,
      });

      const parts = formatter.formatToParts(d);
      const map: Record<string, string> = {};
      for (const p of parts) {
        map[p.type] = p.value;
      }

      return {
        date: new Date(Number(map.year), Number(map.month) - 1, Number(map.day)),
        hour: map.hour.padStart(2, "0"),
        minute: map.minute.padStart(2, "0"),
      };
    }
  } catch {
    // Ignora
  }

  return {
    date: undefined,
    hour: "12",
    minute: "00",
  };
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
  const initial = React.useMemo(() => parseInitialValue(value), []);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initial.date
  );
  const [selectedHour, setSelectedHour] = React.useState<string>(initial.hour);
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    initial.minute
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const bNow = getBrasiliaNow();
  const isTodaySelected = selectedDate ? isSameDay(selectedDate, bNow.dateObj) : false;

  // Atualiza e notifica o valor ISO combinado quando data ou hora mudam
  const updateCombinedValue = React.useCallback(
    (d: Date | undefined, h: string, m: string) => {
      if (!d) {
        onChange("");
        return;
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}T${h}:${m}:00-03:00`;
      onChange(iso);
    },
    [onChange]
  );

  React.useEffect(() => {
    updateCombinedValue(selectedDate, selectedHour, selectedMinute);
  }, [selectedDate, selectedHour, selectedMinute, updateCombinedValue]);

  // Se a data selecionada for hoje e a hora atual for maior que a selecionada, ajusta a hora
  React.useEffect(() => {
    if (isTodaySelected) {
      const hNum = Number(selectedHour);
      const mNum = Number(selectedMinute);
      if (hNum < bNow.hour || (hNum === bNow.hour && mNum <= bNow.minute)) {
        let validHour = bNow.hour;
        let validMin = bNow.minute + 5;
        if (validMin >= 60) {
          validMin = 0;
          validHour += 1;
        }
        if (validHour < 24) {
          setSelectedHour(String(validHour).padStart(2, "0"));
          setSelectedMinute(String(validMin).padStart(2, "0"));
        }
      }
    }
  }, [isTodaySelected, bNow.hour, bNow.minute, selectedHour, selectedMinute]);

  // Validação em tempo real se o horário está no passado
  const isPastTime = React.useMemo(() => {
    if (!selectedDate) return false;
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const target = new Date(
      `${yyyy}-${mm}-${dd}T${selectedHour}:${selectedMinute}:00-03:00`
    );
    return target.getTime() <= Date.now();
  }, [selectedDate, selectedHour, selectedMinute]);

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-4">
      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
        <i className="bx bx-calendar-event text-blue-500 text-lg" />
        <span>Agendamento de Publicação</span>
        <span className="text-xs font-normal text-muted-foreground ml-auto">
          Fuso: Horário de Brasília (UTC-3)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Componente Shadcn: Calendário com Popover */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Data de Publicação
          </Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9 bg-card hover:bg-accent/40 border-border text-xs sm:text-sm",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <i className="bx bx-calendar mr-2 text-base text-blue-500" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setPopoverOpen(false);
                }}
                disabled={(date) => {
                  const check = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                  );
                  return check < bNow.dateObj;
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Componentes Shadcn: Seletores de Horas e Minutos */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Horário de Publicação
          </Label>
          <div className="flex items-center gap-2">
            {/* Hora */}
            <div className="flex-1">
              <Select
                value={selectedHour}
                onValueChange={(h) => setSelectedHour(h)}
              >
                <SelectTrigger className="h-9 font-mono text-xs sm:text-sm bg-card">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {HOURS.map((h) => {
                    const hNum = Number(h);
                    const disabled = isTodaySelected && hNum < bNow.hour;
                    return (
                      <SelectItem
                        key={h}
                        value={h}
                        disabled={disabled}
                        className="font-mono text-xs"
                      >
                        {h}h
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <span className="text-muted-foreground font-bold">:</span>

            {/* Minuto */}
            <div className="flex-1">
              <Select
                value={selectedMinute}
                onValueChange={(m) => setSelectedMinute(m)}
              >
                <SelectTrigger className="h-9 font-mono text-xs sm:text-sm bg-card">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {MINUTES.map((m) => {
                    const mNum = Number(m);
                    const disabled =
                      isTodaySelected &&
                      Number(selectedHour) === bNow.hour &&
                      mNum <= bNow.minute;
                    return (
                      <SelectItem
                        key={m}
                        value={m}
                        disabled={disabled}
                        className="font-mono text-xs"
                      >
                        {m} min
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

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
              às <strong>{selectedHour}:{selectedMinute}</strong> (Horário de Brasília).
            </span>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
