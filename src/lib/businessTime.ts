// Fechas y horas del salón. La API trabaja en la zona horaria del negocio y
// devuelve los huecos como "HH:mm" locales; aquí se convierten para mostrar y enviar.

export const BUSINESS_TZ = "America/New_York";

/** Horario de un día de la semana (0 = domingo … 6 = sábado), horas locales "HH:mm". */
export type DaySchedule = { day: number; isOpen: boolean; open: string; close: string };

/** Horario de reservas: los 7 días y las fechas cerradas (yyyy-MM-dd). Se edita en /admin/. */
export type Schedule = { days: DaySchedule[]; closedDates: string[] };

/**
 * Respaldo mientras carga la API (o si no responde). El horario real es el que se
 * guarda en /admin/ → Horario; sin nada guardado, la API usa Business:OpeningHours.
 */
export const OPEN_WEEKDAYS = [6, 0, 1]; // sábado, domingo y lunes
export const DEFAULT_SCHEDULE: Schedule = {
  days: Array.from({ length: 7 }, (_, day) => ({ day, isOpen: OPEN_WEEKDAYS.includes(day), open: "09:00", close: "19:00" })),
  closedDates: [],
};

/** Cuántos días hacia adelante se puede reservar. */
export const BOOKING_WINDOW_DAYS = 28;

/** "Hoy" en la zona del salón, yyyy-MM-dd. */
export function todayInBusinessTz(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

// Mediodía UTC: evita que el cambio de hora mueva el día al calcular.
const noon = (date: string) => new Date(`${date}T12:00:00Z`);

export function addDays(date: string, days: number): string {
  const d = noon(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  return noon(date).getUTCDay();
}

export function isOpenDay(date: string, schedule: Schedule = DEFAULT_SCHEDULE): boolean {
  if (schedule.closedDates.includes(date)) return false;
  return schedule.days.some((d) => d.day === weekdayOf(date) && d.isOpen);
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** "09:00" → "9am", "19:30" → "7:30pm" */
function compactTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
}

/** Tramos de días seguidos (la semana es circular: sáb, dom, lun es un tramo). */
function dayRuns(days: number[]): number[][] {
  const set = new Set(days);
  if (set.size === 7) return [[1, 2, 3, 4, 5, 6, 0]];
  const runs: number[][] = [];
  for (const start of days) {
    if (set.has((start + 6) % 7)) continue; // no empieza aquí
    const run = [start];
    for (let d = (start + 1) % 7; set.has(d); d = (d + 1) % 7) run.push(d);
    runs.push(run);
  }
  const order = (d: number) => (d + 6) % 7; // lunes primero
  return runs.sort((a, b) => order(a[0]) - order(b[0]));
}

/** "Sáb–Lun: 9am – 7pm" · "Mar–Vie: 10am – 6pm · Sáb: 9am – 3pm" · "Cerrado temporalmente" */
export function formatHoursSummary(schedule: Schedule): string {
  const open = schedule.days.filter((d) => d.isOpen);
  if (open.length === 0) return "Cerrado temporalmente";
  const byHours = new Map<string, number[]>();
  for (const d of open) {
    const k = `${d.open}-${d.close}`;
    byHours.set(k, [...(byHours.get(k) ?? []), d.day]);
  }
  return [...byHours.entries()]
    .map(([k, days]) => {
      const [o, c] = k.split("-");
      const label = dayRuns(days)
        .map((r) => (r.length === 7 ? "Todos los días" : r.length >= 3 ? `${DAY_SHORT[r[0]]}–${DAY_SHORT[r[r.length - 1]]}` : r.map((d) => DAY_SHORT[d]).join(", ")))
        .join(", ");
      return { first: (days.map((d) => (d + 6) % 7).sort()[0]), text: `${label}: ${compactTime(o)} – ${compactTime(c)}` };
    })
    .sort((a, b) => a.first - b.first)
    .map((x) => x.text)
    .join(" · ");
}

/** "Abrimos sábado, domingo y lunes." (en el orden de la semana, empezando por el primer tramo) */
export function openDaysSentence(schedule: Schedule): string {
  const open = schedule.days.filter((d) => d.isOpen).map((d) => d.day);
  if (open.length === 0) return "Por ahora no hay días disponibles para reservar.";
  if (open.length === 7) return "Abrimos todos los días.";
  // Un solo tramo se lee en su orden (sábado, domingo y lunes); varios, de lunes a domingo.
  const runs = dayRuns(open);
  const ordered = runs.length === 1 ? runs[0] : open.sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const names = ordered.map((d) => DAY_LONG[d]);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  return `Abrimos ${list}. Los demás días están cerrados.`;
}

/** Próximos días (desde hoy) para el selector de fecha. */
export function upcomingDays(count = BOOKING_WINDOW_DAYS, now = new Date()): string[] {
  const today = todayInBusinessTz(now);
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

/** "sáb 3 oct" */
export function formatDayShort(date: string): { weekday: string; day: string; month: string } {
  const d = noon(date);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-US", { timeZone: "UTC", ...o }).format(d);
  return { weekday: f({ weekday: "short" }).replace(".", ""), day: f({ day: "numeric" }), month: f({ month: "short" }).replace(".", "") };
}

/** "Sábado, 3 de octubre" (solo la primera letra en mayúscula) */
export function formatDayLong(date: string): string {
  const text = new Intl.DateTimeFormat("es-US", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(noon(date));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "14:30" → "2:30 pm" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** 150 → "2 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
}

/**
 * Fecha + hora local del salón → ISO con el offset correcto de ese día
 * (−04:00 en horario de verano, −05:00 en invierno). Es lo que espera StartTime.
 */
export function toBusinessIso(date: string, hhmm: string): string {
  const guess = new Date(`${date}T${hhmm}:00Z`);
  const tzName = new Intl.DateTimeFormat("en-US", { timeZone: BUSINESS_TZ, timeZoneName: "longOffset" })
    .formatToParts(guess)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const offset = tzName === "GMT" ? "+00:00" : tzName.replace("GMT", "");
  return `${date}T${hhmm}:00${offset}`;
}

/** Instante ISO (con cualquier offset) → { date: "yyyy-MM-dd", time: "HH:mm" } en la hora del salón. */
export function toBusinessLocal(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
