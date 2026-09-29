// Cliente de la API de citas (appointments-service).
// La URL base sale de VITE_API_URL (ver .env.example). Los tipos siguen los DTOs de
// la API: CreateAppointmentRequest, AvailabilityResponse y Appointment.

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const TIMEOUT_MS = 15000;

/** GET /api/availability → huecos libres de un día (hora local del salón, HH:mm). */
export type AvailabilityResponse = {
  date: string; // yyyy-MM-dd
  timeZone: string; // IANA, p. ej. "America/New_York"
  slots: string[]; // ["09:00", "09:15", ...]
};

/** Cuerpo de POST /api/appointments. */
export type CreateAppointmentRequest = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceName: string;
  providerName?: string | null;
  startTime: string; // ISO 8601 con offset, p. ej. "2026-10-03T10:00:00-04:00"
  durationMinutes: number; // 5–480
  notes?: string | null;
};

/** 0 = Booked, 1 = Cancelled, 2 = Completed (la API serializa el enum como número). */
export type AppointmentStatus = 0 | 1 | 2;

/** Respuesta de POST /api/appointments (201). */
export type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceName: string;
  providerName: string | null;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  notes: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string | null;
};

export type ApiErrorKind = "validation" | "conflict" | "rate_limit" | "network" | "server" | "config";

/** Error con mensaje en español listo para mostrar. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  /** Errores por campo (400 de validación), con claves en camelCase: customerPhone, customerEmail... */
  readonly fieldErrors: Record<string, string>;

  constructor(kind: ApiErrorKind, message: string, status?: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const FIELD_MESSAGES: Record<string, string> = {
  customerName: "Escribe tu nombre.",
  customerPhone: "Ese teléfono no parece válido.",
  customerEmail: "Ese email no parece válido.",
  startTime: "Elige un horario.",
  durationMinutes: "La duración del servicio no es válida.",
};

const camel = (k: string) => k.charAt(0).toLowerCase() + k.slice(1);

async function toApiError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // sin cuerpo JSON
  }

  switch (res.status) {
    case 400: {
      // ValidationProblem de ASP.NET: { errors: { CustomerPhone: ["..."] } }
      const errors = (body as { errors?: Record<string, string[]> } | null)?.errors ?? {};
      const fieldErrors: Record<string, string> = {};
      for (const key of Object.keys(errors)) {
        const field = camel(key.replace(/^\$\./, ""));
        fieldErrors[field] = FIELD_MESSAGES[field] ?? "Revisa este dato.";
      }
      const message = Object.keys(fieldErrors).length
        ? "Revisa los datos marcados e inténtalo de nuevo."
        : // { message } de las reglas de horario: pasado, día cerrado o fuera de horario
          "Ese horario ya no se puede reservar. Elige otro, por favor.";
      return new ApiError("validation", message, 400, fieldErrors);
    }
    case 409:
      return new ApiError("conflict", "Ese horario se acaba de ocupar. Elige otro, por favor.", 409);
    case 429:
      return new ApiError("rate_limit", "Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.", 429);
    default:
      return new ApiError(
        "server",
        "El sistema de reservas tuvo un problema. Inténtalo en unos minutos o escríbenos por WhatsApp.",
        res.status,
      );
  }
}

async function request<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  if (!API_URL) {
    throw new ApiError("config", "Las reservas en línea no están configuradas todavía. Escríbenos por WhatsApp.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
      signal: controller.signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err; // cancelado por quien llama: no es un error para mostrar
    throw new ApiError(
      "network",
      "No pudimos conectar con el sistema de reservas. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }

  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

/** Horarios libres para un servicio de `durationMinutes` el día `date` (yyyy-MM-dd). */
export function getAvailability(date: string, durationMinutes: number, signal?: AbortSignal) {
  const qs = new URLSearchParams({ date, durationMinutes: String(durationMinutes) });
  return request<AvailabilityResponse>(`/api/availability?${qs}`, {}, signal);
}

/** Crea la cita. Lanza ApiError (409 si el horario se ocupó entre medias). */
export function createAppointment(data: CreateAppointmentRequest) {
  return request<Appointment>("/api/appointments", { method: "POST", body: JSON.stringify(data) });
}
