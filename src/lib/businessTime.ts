// Fechas y horas del salón. La API trabaja en la zona horaria del negocio y
// devuelve los huecos como "HH:mm" locales; aquí se convierten para mostrar y enviar.

export const BUSINESS_TZ = "America/New_York";

/** Días abiertos (0 = domingo … 6 = sábado). Debe coincidir con Business:OpeningHours de la API. */
export const OPEN_WEEKDAYS = [6, 0, 1]; // sábado, domingo y lunes

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

export function isOpenDay(date: string): boolean {
  return OPEN_WEEKDAYS.includes(weekdayOf(date));
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
