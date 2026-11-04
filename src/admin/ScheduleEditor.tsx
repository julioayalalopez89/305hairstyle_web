import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarOff, Copy, Plus, X } from "lucide-react";
import { ApiError, adminGetSchedule, adminSaveSchedule, type Appointment, type ClosedDateDto, type ScheduleDto } from "@/lib/api";
import {
  addDays, formatDayLong, formatDayShort, formatHoursSummary, formatTime, isOpenDay, toBusinessLocal, todayInBusinessTz,
  type DaySchedule, type Schedule,
} from "@/lib/businessTime";
import { Loading, Notice, SaveBar, Toggle, chipBtn, iconBtn, inputClass, labelClass, serif, useUnsavedWarning } from "./ui";

// Panel → Horario: qué días se puede reservar, de qué hora a qué hora, y días cerrados
// puntuales (festivos, vacaciones). Se guarda todo junto (PUT /api/catalog/schedule).

type Props = {
  adminKey: string;
  /** Citas cargadas en la agenda, para avisar de las que quedan fuera del nuevo horario. */
  appointments: Appointment[] | null;
  onUnauthorized: () => void;
  onDirtyChange: (dirty: boolean) => void;
};

type Draft = { days: DaySchedule[]; closed: ClosedDateDto[] };

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes primero
const MAX_RANGE_DAYS = 60;

const toDraft = (s: ScheduleDto): Draft => ({
  days: [...s.days].sort((a, b) => a.day - b.day),
  closed: [...s.closedDates].sort((a, b) => a.date.localeCompare(b.date)),
});

const asSchedule = (d: Draft): Schedule => ({ days: d.days, closedDates: d.closed.map((c) => c.date) });

/** Días cerrados seguidos con el mismo motivo se muestran juntos ("24–31 dic · Vacaciones"). */
function groupClosed(list: ClosedDateDto[]): ClosedDateDto[][] {
  const groups: ClosedDateDto[][] = [];
  for (const c of list) {
    const g = groups[groups.length - 1];
    const prev = g?.[g.length - 1];
    if (prev && addDays(prev.date, 1) === c.date && (prev.reason ?? "") === (c.reason ?? "")) g.push(c);
    else groups.push([c]);
  }
  return groups;
}

function shortDate(date: string) {
  const { weekday, day, month } = formatDayShort(date);
  return `${weekday} ${day} ${month}`;
}

export default function ScheduleEditor({ adminKey, appointments, onUnauthorized, onDirtyChange }: Props) {
  const [server, setServer] = useState<ScheduleDto | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const today = todayInBusinessTz();

  // Ref: el padre crea onUnauthorized en cada render y no debe volver a disparar la carga.
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;
  const handle = useCallback((e: unknown, fallback: string) => {
    if (e instanceof ApiError && e.kind === "unauthorized") { onUnauthorizedRef.current(); return null; }
    return e instanceof ApiError ? e.message : fallback;
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    adminGetSchedule(adminKey, ctrl.signal)
      .then((s) => { setServer(s); setDraft(toDraft(s)); })
      .catch((e) => { if (!ctrl.signal.aborted) setLoadError(handle(e, "No se pudo cargar el horario.")); });
    return () => ctrl.abort();
  }, [adminKey, handle]);

  const dirty = useMemo(
    () => !!server && !!draft && JSON.stringify(draft) !== JSON.stringify(toDraft(server)),
    [draft, server],
  );
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useUnsavedWarning(dirty);

  const dayErrors = useMemo(() => {
    const e: Record<number, string> = {};
    for (const d of draft?.days ?? []) if (d.isOpen && d.close <= d.open) e[d.day] = "La hora de cierre tiene que ser después de la de apertura.";
    return e;
  }, [draft]);

  // Citas próximas (no canceladas) que quedarían fuera del horario del borrador.
  const outside = useMemo(() => {
    if (!draft || !appointments) return [];
    const sched = asSchedule(draft);
    const now = Date.now();
    return appointments.filter((a) => {
      if (a.status === 1 || new Date(a.startTime).getTime() < now) return false;
      const start = toBusinessLocal(a.startTime);
      const end = toBusinessLocal(a.endTime);
      if (!isOpenDay(start.date, sched)) return true;
      const day = sched.days.find((d) => d.day === new Date(`${start.date}T12:00:00Z`).getUTCDay())!;
      return start.time < day.open || end.date !== start.date || end.time > day.close;
    });
  }, [draft, appointments]);

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!draft || !server) return <Loading text="Cargando horario…" />;

  const setDay = (day: number, patch: Partial<DaySchedule>) => {
    setSavedOk(false);
    setDraft((d) => d && { ...d, days: d.days.map((x) => (x.day === day ? { ...x, ...patch } : x)) });
  };

  const copyToOpenDays = (from: DaySchedule) => {
    setSavedOk(false);
    setDraft((d) => d && { ...d, days: d.days.map((x) => (x.isOpen ? { ...x, open: from.open, close: from.close } : x)) });
  };

  const addClosed = (from: string, to: string, reason: string) => {
    const dates: string[] = [];
    for (let d = from; d <= to && dates.length < MAX_RANGE_DAYS; d = addDays(d, 1)) dates.push(d);
    setSavedOk(false);
    setDraft((d) => {
      if (!d) return d;
      const map = new Map(d.closed.map((c) => [c.date, c]));
      for (const date of dates) map.set(date, { date, reason: reason.trim() || null });
      return { ...d, closed: [...map.values()].sort((a, b) => a.date.localeCompare(b.date)) };
    });
  };

  const removeClosed = (dates: string[]) => {
    setSavedOk(false);
    setDraft((d) => d && { ...d, closed: d.closed.filter((c) => !dates.includes(c.date)) });
  };

  const save = async () => {
    setSaveError(null);
    if (Object.keys(dayErrors).length) { setSaveError("Revisa las horas marcadas en rojo."); return; }
    setSaving(true);
    try {
      const result = await adminSaveSchedule(adminKey, { days: draft.days, closedDates: draft.closed });
      setServer(result);
      setDraft(toDraft(result));
      setSavedOk(true);
    } catch (e) {
      const msg = handle(e, "No se pudo guardar.");
      if (msg) setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!window.confirm("¿Descartar los cambios sin guardar?")) return;
    setDraft(toDraft(server));
    setSaveError(null);
  };

  const sched = asSchedule(draft);
  const upcomingClosed = draft.closed.filter((c) => c.date >= today);
  const pastClosed = draft.closed.filter((c) => c.date < today);

  return (
    <div className="pb-24 space-y-10">
      <div>
        {savedOk && !dirty && <Notice tone="ok">Guardado. La reserva en línea ya usa este horario.</Notice>}
        {saveError && <Notice tone="error">{saveError}</Notice>}
        {!server.customized && !dirty && (
          <Notice>Este horario es el que trae el servidor por defecto. En cuanto lo guardes aquí, manda el del panel.</Notice>
        )}
        {outside.length > 0 && (
          <Notice tone="warn">
            <b>{outside.length === 1 ? "1 cita próxima queda" : `${outside.length} citas próximas quedan`} fuera de este horario.</b>{" "}
            No se cancelan solas; avisa a la clienta o cancélala desde la Agenda.
            <ul className="mt-2 space-y-0.5 text-foreground/75">
              {outside.slice(0, 5).map((a) => {
                const s = toBusinessLocal(a.startTime);
                return <li key={a.id}>· {formatDayLong(s.date)}, {formatTime(s.time)} — {a.customerName}</li>;
              })}
              {outside.length > 5 && <li>· y {outside.length - 5} más</li>}
            </ul>
          </Notice>
        )}
      </div>

      {/* Horario semanal */}
      <section>
        <h2 className="text-2xl font-semibold mb-1" style={serif}>Días y horas de reserva</h2>
        <p className="text-sm text-foreground/55 mb-4">
          Así se verá en la web: <span className="text-foreground font-semibold">{formatHoursSummary(sched)}</span>
        </p>
        <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
          {WEEK_ORDER.map((n) => {
            const d = draft.days.find((x) => x.day === n)!;
            const err = dayErrors[n];
            return (
              <li key={n} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-3 w-40">
                    <Toggle id={`day-${n}`} checked={d.isOpen} onChange={(v) => setDay(n, { isOpen: v })} label={`${DAY_NAMES[n]} abierto`} />
                    <label htmlFor={`day-${n}`} className="font-semibold">{DAY_NAMES[n]}</label>
                  </div>
                  {d.isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time" step={900} value={d.open} aria-label={`${DAY_NAMES[n]}: abre`} aria-invalid={!!err}
                        onChange={(e) => e.target.value && setDay(n, { open: e.target.value })}
                        className={`${inputClass} w-[7.5rem] py-2`}
                      />
                      <span className="text-foreground/40 text-sm">a</span>
                      <input
                        type="time" step={900} value={d.close} aria-label={`${DAY_NAMES[n]}: cierra`} aria-invalid={!!err}
                        onChange={(e) => e.target.value && setDay(n, { close: e.target.value })}
                        className={`${inputClass} w-[7.5rem] py-2`}
                      />
                      <button type="button" onClick={() => copyToOpenDays(d)} className={iconBtn} title="Usar este horario en todos los días abiertos" aria-label={`Copiar el horario del ${DAY_NAMES[n].toLowerCase()} a los demás días abiertos`}>
                        <Copy size={15} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground/40">Cerrado</span>
                  )}
                </div>
                {err && <p className="mt-1.5 text-xs text-[#F08A8A]">{err}</p>}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-foreground/45">
          Las citas empiezan cada {server.slotIntervalMinutes} min y tienen que terminar antes del cierre. Hora de Miami.
        </p>
      </section>

      {/* Días cerrados */}
      <section>
        <h2 className="text-2xl font-semibold mb-1" style={serif}>Días cerrados</h2>
        <p className="text-sm text-foreground/55 mb-4">Festivos, vacaciones o cualquier día que normalmente abres pero esta vez no.</p>
        <AddClosedForm today={today} onAdd={addClosed} />

        {upcomingClosed.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/45">No hay días cerrados próximos.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {groupClosed(upcomingClosed).map((g) => <ClosedItem key={g[0].date} group={g} schedule={sched} onRemove={removeClosed} />)}
          </ul>
        )}

        {pastClosed.length > 0 && (
          <div className="mt-4">
            <button type="button" onClick={() => setShowPast((v) => !v)} className="text-xs font-semibold text-foreground/50 hover:text-foreground">
              {showPast ? "Ocultar" : "Ver"} días cerrados pasados ({pastClosed.length})
            </button>
            {showPast && (
              <ul className="mt-2 space-y-2 opacity-60">
                {groupClosed(pastClosed).map((g) => <ClosedItem key={g[0].date} group={g} schedule={sched} onRemove={removeClosed} />)}
              </ul>
            )}
          </div>
        )}
      </section>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={discard} />
    </div>
  );
}

function ClosedItem({ group, schedule, onRemove }: { group: ClosedDateDto[]; schedule: Schedule; onRemove: (dates: string[]) => void }) {
  const first = group[0].date;
  const last = group[group.length - 1].date;
  const label = group.length === 1 ? formatDayLong(first) : `${shortDate(first)} – ${shortDate(last)}`;
  // Aviso si ninguno de esos días abre normalmente (no cambia nada).
  const weekly = { ...schedule, closedDates: [] };
  const noEffect = group.every((c) => !isOpenDay(c.date, weekly));
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
      <CalendarOff size={16} className="text-[var(--brand)] shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}{group.length > 1 && <span className="font-normal text-foreground/50"> · {group.length} días</span>}</div>
        {(group[0].reason || noEffect) && (
          <div className="text-xs text-foreground/50">
            {group[0].reason}{group[0].reason && noEffect ? " · " : ""}{noEffect && "ese día ya está cerrado por el horario semanal"}
          </div>
        )}
      </div>
      <button type="button" onClick={() => onRemove(group.map((c) => c.date))} className={iconBtn} aria-label={`Quitar ${label}`} title="Quitar">
        <X size={16} />
      </button>
    </li>
  );
}

function AddClosedForm({ today, onAdd }: { today: string; onAdd: (from: string, to: string, reason: string) => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!from) { setError("Elige el día."); return; }
    const end = to || from;
    if (end < from) { setError("El “hasta” no puede ser antes del “desde”."); return; }
    const span = (new Date(`${end}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86_400_000 + 1;
    if (span > MAX_RANGE_DAYS) { setError(`Máximo ${MAX_RANGE_DAYS} días seguidos. Si cierras más tiempo, apaga los días en el horario semanal.`); return; }
    onAdd(from, end, reason);
    setFrom(""); setTo(""); setReason("");
  };

  return (
    <div className="rounded-2xl border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end">
        <div>
          <label htmlFor="closed-from" className={labelClass}>Desde</label>
          <input id="closed-from" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} py-2`} />
        </div>
        <div>
          <label htmlFor="closed-to" className={labelClass}>Hasta (opcional)</label>
          <input id="closed-to" type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className={`${inputClass} py-2`} />
        </div>
        <div>
          <label htmlFor="closed-reason" className={labelClass}>Motivo (opcional)</label>
          <input id="closed-reason" maxLength={200} placeholder="Vacaciones, Navidad…" value={reason} onChange={(e) => setReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className={`${inputClass} py-2`} />
        </div>
        <button type="button" onClick={submit} className={`${chipBtn} justify-center py-2.5`}>
          <Plus size={14} /> Agregar
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-[#F08A8A]">{error}</p>}
    </div>
  );
}
