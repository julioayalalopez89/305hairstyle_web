import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, LogOut, Mail, MessageCircle, Phone, RefreshCw, X } from "lucide-react";
import { ApiError, cancelAppointment, listAppointments, type Appointment } from "@/lib/api";
import { addDays, formatDayLong, formatDuration, formatTime, toBusinessLocal, todayInBusinessTz } from "@/lib/businessTime";

// Agenda privada del salón (/admin/). Pide la clave de administración de la API
// (Security__AdminApiKey en Azure) y muestra las citas agrupadas por día.
// La clave solo se guarda en este navegador; nunca está en el código.

const KEY_STORAGE = "305hs.adminKey";
const REFRESH_MS = 60_000;

type View = "upcoming" | "past" | "cancelled";

function readKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function storeKey(key: string, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(KEY_STORAGE, key);
  } catch {
    // sin almacenamiento: la clave dura mientras la página esté abierta
  }
}

function clearKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
    sessionStorage.removeItem(KEY_STORAGE);
  } catch {
    // nada que borrar
  }
}

const serif = { fontFamily: "'Cormorant Garamond', serif" };

export default function AdminApp() {
  const [key, setKey] = useState(readKey);
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("upcoming");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (k: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments(k, signal);
      setItems(data);
      setUpdatedAt(new Date());
    } catch (e) {
      if (signal?.aborted) return;
      if (e instanceof ApiError && e.kind === "unauthorized") {
        clearKey();
        setKey("");
        setItems(null);
        setError("La clave no es correcta o cambió. Escríbela de nuevo.");
      } else {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar la agenda.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Carga inicial y refresco automático mientras la pestaña está visible.
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    load(key, ctrl.signal);
    const id = setInterval(() => { if (!document.hidden) load(key); }, REFRESH_MS);
    return () => { ctrl.abort(); clearInterval(id); };
  }, [key, load]);

  if (!key) return <Login onLogin={(k, remember) => { storeKey(k, remember); setKey(k); }} error={error} />;

  const logout = () => { clearKey(); setKey(""); setItems(null); setError(null); };

  const onCancel = async (a: Appointment) => {
    const when = toBusinessLocal(a.startTime);
    if (!window.confirm(`¿Cancelar la cita de ${a.customerName} (${formatDayLong(when.date)}, ${formatTime(when.time)})?`)) return;
    try {
      const updated = await cancelAppointment(key, a.id, "Cancelada desde la agenda del salón");
      setItems((list) => list?.map((x) => (x.id === a.id ? updated : x)) ?? null);
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "No se pudo cancelar.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Jost', sans-serif" }}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <CalendarDays size={20} className="text-[var(--brand)]" />
          <div className="leading-tight">
            <div className="text-xl font-semibold" style={serif}>Agenda</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--brand)] font-semibold">305 Hair Style</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button" onClick={() => load(key)} disabled={loading}
              className="p-2 rounded-lg hover:bg-white/5 text-foreground/70" aria-label="Actualizar" title="Actualizar"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            </button>
            <button type="button" onClick={logout} className="p-2 rounded-lg hover:bg-white/5 text-foreground/70" aria-label="Salir" title="Salir">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {([["upcoming", "Próximas"], ["past", "Pasadas"], ["cancelled", "Canceladas"]] as const).map(([v, label]) => (
            <button
              key={v} type="button" onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                view === v ? "bg-[var(--brand)] text-[var(--on-brand)]" : "bg-secondary text-foreground/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">{error}</p>}
        {items === null && loading && (
          <p className="flex items-center gap-2 text-sm text-foreground/60"><Loader2 size={16} className="animate-spin" /> Cargando citas…</p>
        )}
        {items && <Agenda items={items} view={view} onCancel={onCancel} />}
        {updatedAt && (
          <p className="mt-8 text-center text-xs text-foreground/35">
            Actualizado {updatedAt.toLocaleTimeString("es-US", { hour: "numeric", minute: "2-digit" })} · se actualiza solo cada minuto
          </p>
        )}
      </main>
    </div>
  );
}

function Agenda({ items, view, onCancel }: { items: Appointment[]; view: View; onCancel: (a: Appointment) => void }) {
  const today = todayInBusinessTz();
  const now = Date.now();

  const groups = useMemo(() => {
    const filtered = items.filter((a) => {
      if (view === "cancelled") return a.status === 1;
      if (a.status === 1) return false;
      const ended = new Date(a.endTime).getTime() < now;
      return view === "past" ? ended : !ended;
    });
    filtered.sort((x, y) => new Date(x.startTime).getTime() - new Date(y.startTime).getTime());
    if (view !== "upcoming") filtered.reverse(); // lo más reciente primero
    const byDay = new Map<string, Appointment[]>();
    for (const a of filtered) {
      const d = toBusinessLocal(a.startTime).date;
      byDay.set(d, [...(byDay.get(d) ?? []), a]);
    }
    return [...byDay.entries()];
  }, [items, view, now]);

  if (groups.length === 0) {
    const empty = { upcoming: "No hay citas próximas.", past: "Todavía no hay citas pasadas.", cancelled: "No hay citas canceladas." }[view];
    return <p className="py-10 text-center text-foreground/50">{empty}</p>;
  }

  const dayTitle = (d: string) => (d === today ? "Hoy" : d === addDays(today, 1) ? "Mañana" : formatDayLong(d));

  return (
    <div className="space-y-8">
      {groups.map(([day, list]) => (
        <section key={day}>
          <h2 className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold" style={serif}>{dayTitle(day)}</span>
            {(day === today || day === addDays(today, 1)) && <span className="text-sm text-foreground/50">{formatDayLong(day)}</span>}
            <span className="ml-auto text-xs text-foreground/45">{list.length} {list.length === 1 ? "cita" : "citas"}</span>
          </h2>
          <ul className="space-y-3">
            {list.map((a) => <AppointmentCard key={a.id} a={a} onCancel={view === "upcoming" ? onCancel : undefined} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AppointmentCard({ a, onCancel }: { a: Appointment; onCancel?: (a: Appointment) => void }) {
  const start = toBusinessLocal(a.startTime);
  const end = toBusinessLocal(a.endTime);
  const digits = a.customerPhone.replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `1${digits}` : digits; // números de EE. UU. sin el 1
  const cancelled = a.status === 1;

  return (
    <li className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${cancelled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-20">
          <div className="text-lg font-bold text-[var(--brand)]" style={serif}>{formatTime(start.time)}</div>
          <div className="text-xs text-foreground/45">hasta {formatTime(end.time)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{a.customerName}</div>
          <div className="text-sm text-foreground/65">{a.serviceName} · {formatDuration(a.durationMinutes)}</div>
          {a.notes && <p className="mt-2 text-sm text-foreground/60 italic">“{a.notes}”</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`tel:${a.customerPhone}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-[var(--brand)]">
              <Phone size={13} /> {a.customerPhone}
            </a>
            {waNumber.length >= 10 && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-[#25D366]">
                <MessageCircle size={13} /> WhatsApp
              </a>
            )}
            {a.customerEmail && (
              <a href={`mailto:${a.customerEmail}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-[var(--brand)]">
                <Mail size={13} /> {a.customerEmail}
              </a>
            )}
          </div>
        </div>
        {onCancel && !cancelled && (
          <button
            type="button" onClick={() => onCancel(a)}
            className="shrink-0 p-2 rounded-lg text-foreground/40 hover:text-[#F08A8A] hover:bg-white/5" aria-label={`Cancelar la cita de ${a.customerName}`} title="Cancelar cita"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </li>
  );
}

function Login({ onLogin, error }: { onLogin: (key: string, remember: boolean) => void; error: string | null }) {
  const [value, setValue] = useState("");
  const [remember, setRemember] = useState(true);
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5" style={{ fontFamily: "'Jost', sans-serif" }}>
      <form
        onSubmit={(e) => { e.preventDefault(); if (value.trim()) onLogin(value.trim(), remember); }}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-7"
      >
        <CalendarDays size={28} className="text-[var(--brand)] mb-3" />
        <h1 className="text-3xl font-semibold mb-1" style={serif}>Agenda del salón</h1>
        <p className="text-sm text-foreground/55 mb-6">Escribe la clave de administración para ver las citas.</p>
        <label htmlFor="admin-key" className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Clave</label>
        <input
          id="admin-key" type="password" autoComplete="current-password" value={value} onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[var(--brand)] focus:outline-none text-sm"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-foreground/65">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--brand)]" />
          Recordar en este dispositivo
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-[#F08A8A]">{error}</p>}
        <button type="submit" className="mt-6 w-full py-3.5 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] font-semibold hover:bg-[var(--brand-hover)]">
          Entrar
        </button>
      </form>
    </div>
  );
}
