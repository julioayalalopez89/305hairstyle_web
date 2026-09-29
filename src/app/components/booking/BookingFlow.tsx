import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarCheck, ChevronLeft, Clock, Loader2, RefreshCw } from "lucide-react";
import { ApiError, createAppointment, getAvailability, type Appointment } from "@/lib/api";
import {
  formatDayLong, formatDayShort, formatDuration, formatTime, isOpenDay, toBusinessIso, upcomingDays,
} from "@/lib/businessTime";

// Flujo de reserva: servicio → día → hora → datos → confirmar.
// Los horarios libres y la cita salen de la API de citas (src/lib/api.ts).

export type BookableService = { name: string; price: string; durationMinutes: number; category: string };

type Props = {
  services: BookableService[];
  /** Servicio elegido desde otra parte de la página ("Reservar este servicio"). `n` cambia en cada clic. */
  preselect?: { name: string; n: number } | null;
  address: string;
  whatsappUrl: string;
};

type Step = "service" | "date" | "time" | "details" | "done";

type DetailsForm = { name: string; phone: string; email: string; notes: string };

type SlotsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; slots: string[] }
  | { status: "error"; message: string };

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[var(--brand)] focus:outline-none text-sm transition-colors";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5";
const primaryBtn =
  "w-full py-3.5 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] font-semibold hover:bg-[var(--brand-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--brand)]/25 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

const STEPS: { id: Exclude<Step, "done">; label: string }[] = [
  { id: "service", label: "Servicio" },
  { id: "date", label: "Día" },
  { id: "time", label: "Hora" },
  { id: "details", label: "Tus datos" },
];

export default function BookingFlow({ services, preselect, address, whatsappUrl }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<BookableService | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotsState>({ status: "idle" });
  const [slotsNonce, setSlotsNonce] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Appointment | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const days = useRef(upcomingDays()).current;
  const {
    register, handleSubmit, setError, reset, formState: { errors, isSubmitting },
  } = useForm<DetailsForm>({ defaultValues: { name: "", phone: "", email: "", notes: "" } });

  // "Reservar este servicio" en otra sección → empezar con ese servicio elegido.
  useEffect(() => {
    if (!preselect) return;
    const s = services.find((x) => x.name === preselect.name);
    if (!s) return;
    setService(s); setTime(null); setBooked(null); setNotice(null);
    setStep(date ? "time" : "date");
  }, [preselect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Horarios libres del día elegido.
  useEffect(() => {
    if (!service || !date) return;
    const ctrl = new AbortController();
    setSlots({ status: "loading" });
    getAvailability(date, service.durationMinutes, ctrl.signal)
      .then((r) => setSlots({ status: "ok", slots: r.slots }))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setSlots({ status: "error", message: e instanceof ApiError ? e.message : "No pudimos cargar los horarios." });
      });
    return () => ctrl.abort();
  }, [service, date, slotsNonce]);

  const go = (s: Step) => {
    setStep(s);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const onSubmit = async (form: DetailsForm) => {
    if (!service || !date || !time) return;
    setSubmitError(null);
    try {
      const appt = await createAppointment({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || null,
        serviceName: service.name,
        startTime: toBusinessIso(date, time),
        durationMinutes: service.durationMinutes,
        notes: form.notes.trim() || null,
      });
      setBooked(appt);
      go("done");
    } catch (e) {
      if (!(e instanceof ApiError)) { setSubmitError("Algo salió mal. Inténtalo de nuevo."); return; }
      if (e.kind === "conflict" || (e.kind === "validation" && Object.keys(e.fieldErrors).length === 0)) {
        // El horario se ocupó (o ya no vale): volver a elegir hora con la lista recargada.
        setTime(null);
        setNotice(e.message);
        setSlotsNonce((n) => n + 1);
        go("time");
        return;
      }
      const map: Record<string, keyof DetailsForm> = { customerName: "name", customerPhone: "phone", customerEmail: "email", notes: "notes" };
      for (const [field, msg] of Object.entries(e.fieldErrors)) {
        if (map[field]) setError(map[field], { message: msg });
      }
      setSubmitError(e.message);
    }
  };

  const startOver = () => {
    setService(null); setDate(null); setTime(null); setBooked(null); setNotice(null);
    reset();
    go("service");
  };

  // ───────────── Confirmación ─────────────
  if (step === "done" && booked && service && date && time) {
    return (
      <div ref={topRef} className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-[var(--brand)]/10 flex items-center justify-center mx-auto mb-4">
          <CalendarCheck size={28} className="text-[var(--brand)]" />
        </div>
        <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>¡Cita reservada!</h3>
        <p className="text-foreground/60 text-sm mb-6">Gracias, {booked.customerName.split(" ")[0]}. Te esperamos.</p>
        <dl className="text-left rounded-2xl border border-border bg-muted p-5 space-y-3 text-sm mb-6">
          <Row label="Servicio" value={`${service.name} · ${service.price}`} />
          <Row label="Día" value={formatDayLong(date)} capitalize />
          <Row label="Hora" value={`${formatTime(time)} (${formatDuration(service.durationMinutes)})`} />
          <Row label="Dónde" value={address} />
        </dl>
        <p className="text-xs text-foreground/50 mb-6">
          ¿Necesitas cambiarla? Escríbenos por{" "}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] underline underline-offset-2">WhatsApp</a>.
        </p>
        <button type="button" onClick={startOver} className="text-sm font-semibold text-[var(--brand)] hover:underline underline-offset-4">
          Hacer otra reserva
        </button>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const back = () => go(STEPS[Math.max(0, stepIndex - 1)].id);

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progreso */}
      <ol className="flex items-center gap-1.5 mb-6" aria-label="Pasos de la reserva">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex-1">
            <div className={`h-1 rounded-full ${i <= stepIndex ? "bg-[var(--brand)]" : "bg-border"}`} />
            <span className={`mt-1.5 block text-[10px] uppercase tracking-widest font-bold ${i === stepIndex ? "text-[var(--brand)]" : "text-foreground/35"}`}>
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {stepIndex > 0 && (
        <button type="button" onClick={back} className="mb-4 -ml-1 inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-[var(--brand)]">
          <ChevronLeft size={14} /> Atrás
        </button>
      )}

      {/* Resumen de lo elegido */}
      {service && step !== "service" && (
        <p className="mb-4 text-sm text-foreground/70">
          <span className="font-semibold text-foreground">{service.name}</span> · {formatDuration(service.durationMinutes)}
          {date && step !== "date" && <> · <span className="capitalize">{formatDayLong(date)}</span></>}
          {time && step === "details" && <> · {formatTime(time)}</>}
        </p>
      )}

      {/* 1. Servicio */}
      {step === "service" && (
        <fieldset>
          <legend className={labelClass}>¿Qué te hacemos?</legend>
          <div className="grid gap-2">
            {services.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => { setService(s); setTime(null); go("date"); }}
                className={`flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl border transition-colors ${
                  service?.name === s.name ? "border-[var(--brand)] bg-[var(--brand)]/10" : "border-border bg-input-background hover:border-[var(--brand)]/50"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{s.name}</span>
                  <span className="flex items-center gap-1 text-xs text-foreground/50"><Clock size={11} /> {formatDuration(s.durationMinutes)}</span>
                </span>
                <span className="text-lg font-bold text-[var(--brand)]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.price}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* 2. Día */}
      {step === "date" && (
        <fieldset>
          <legend className={labelClass}>Elige el día</legend>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {days.map((d) => {
              const open = isOpenDay(d);
              const { weekday, day, month } = formatDayShort(d);
              const selected = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={!open}
                  onClick={() => { setDate(d); setTime(null); setNotice(null); go("time"); }}
                  aria-label={`${formatDayLong(d)}${open ? "" : " (cerrado)"}`}
                  className={`rounded-xl border py-2 text-center transition-colors ${
                    selected
                      ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]"
                      : open
                        ? "border-border bg-input-background hover:border-[var(--brand)]/60"
                        : "border-transparent text-foreground/20 cursor-not-allowed"
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-wider">{weekday}</span>
                  <span className="block text-lg font-bold leading-tight">{day}</span>
                  <span className="block text-[10px] uppercase">{month}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-foreground/45">Abrimos sábado, domingo y lunes. Los demás días están cerrados.</p>
        </fieldset>
      )}

      {/* 3. Hora */}
      {step === "time" && (
        <fieldset>
          <legend className={labelClass}>Elige la hora</legend>
          {notice && (
            <p role="alert" className="mb-3 rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 px-4 py-3 text-sm">{notice}</p>
          )}
          {slots.status === "loading" && (
            <p className="flex items-center gap-2 py-6 text-sm text-foreground/60"><Loader2 size={16} className="animate-spin" /> Buscando horarios libres…</p>
          )}
          {slots.status === "error" && (
            <div className="py-4 text-sm">
              <p className="text-foreground/70 mb-3">{slots.message}</p>
              <button type="button" onClick={() => setSlotsNonce((n) => n + 1)} className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand)]">
                <RefreshCw size={14} /> Reintentar
              </button>
            </div>
          )}
          {slots.status === "ok" && slots.slots.length === 0 && (
            <p className="py-4 text-sm text-foreground/70">
              No quedan horarios libres ese día para este servicio.{" "}
              <button type="button" onClick={() => go("date")} className="font-semibold text-[var(--brand)] underline underline-offset-2">Elige otro día</button>.
            </p>
          )}
          {slots.status === "ok" && slots.slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {slots.slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTime(t); setNotice(null); go("details"); }}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                    t === time ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : "border-border bg-input-background hover:border-[var(--brand)]/60"
                  }`}
                >
                  {formatTime(t)}
                </button>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {/* 4. Datos */}
      {step === "details" && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="bk-name" className={labelClass}>Nombre completo</label>
            <input
              id="bk-name" type="text" autoComplete="name" placeholder="Tu nombre" className={inputClass}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Escribe tu nombre.",
                minLength: { value: 2, message: "Escribe tu nombre." },
                maxLength: { value: 200, message: "Máximo 200 caracteres." },
              })}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label htmlFor="bk-phone" className={labelClass}>Teléfono / WhatsApp</label>
            <input
              id="bk-phone" type="tel" autoComplete="tel" placeholder="(305) 000-0000" className={inputClass}
              aria-invalid={!!errors.phone}
              {...register("phone", {
                required: "Necesitamos tu teléfono para confirmar.",
                validate: (v) => {
                  const digits = v.replace(/\D/g, "");
                  return (/^[+\d\s().-]+$/.test(v.trim()) && digits.length >= 10 && digits.length <= 15) || "Escribe un teléfono válido (10 dígitos).";
                },
              })}
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div>
            <label htmlFor="bk-email" className={labelClass}>Email (opcional)</label>
            <input
              id="bk-email" type="email" autoComplete="email" placeholder="tu@email.com" className={inputClass}
              aria-invalid={!!errors.email}
              {...register("email", {
                validate: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Ese email no parece válido.",
              })}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="bk-notes" className={labelClass}>Algo que debamos saber (opcional)</label>
            <textarea
              id="bk-notes" rows={3} placeholder="Largo de tu pelo, color que buscas…" className={`${inputClass} resize-none`}
              {...register("notes", { maxLength: { value: 1000, message: "Máximo 1000 caracteres." } })}
            />
            <FieldError message={errors.notes?.message} />
          </div>
          {submitError && <p role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">{submitError}</p>}
          <button type="submit" disabled={isSubmitting} className={primaryBtn}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Reservando…</span>
            ) : (
              "Confirmar reserva"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-[#F08A8A]">{message}</p> : null;
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-foreground/50">{label}</dt>
      <dd className={`font-semibold text-right ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}
