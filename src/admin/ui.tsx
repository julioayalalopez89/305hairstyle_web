import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Piezas compartidas del panel (/admin/).

export const serif = { fontFamily: "'Cormorant Garamond', serif" };

export const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-border focus:border-[var(--brand)] focus:outline-none text-sm transition-colors aria-[invalid=true]:border-[#F08A8A]";
export const labelClass = "block text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5";
export const chipBtn =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-[var(--brand)] disabled:opacity-40 disabled:pointer-events-none";
export const iconBtn =
  "p-2 rounded-lg text-foreground/45 hover:text-foreground hover:bg-white/5 disabled:opacity-25 disabled:pointer-events-none";

/** Interruptor accesible (role="switch"). */
export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[var(--brand)]" : "bg-foreground/15"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

/** Barra fija abajo cuando hay cambios sin guardar. */
export function SaveBar({ dirty, saving, onSave, onDiscard, message }: {
  dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; message?: ReactNode;
}) {
  if (!dirty && !saving) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <p className="text-sm text-foreground/70 min-w-0 flex-1">{message ?? "Tienes cambios sin guardar."}</p>
        <button type="button" onClick={onDiscard} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-50">
          Descartar
        </button>
        <button
          type="button" onClick={onSave} disabled={saving}
          className="px-5 py-2 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] text-sm font-semibold hover:bg-[var(--brand-hover)] disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />} Guardar
        </button>
      </div>
    </div>
  );
}

/** Avisa al cerrar o recargar la pestaña con cambios sin guardar. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok" | "warn"; children: ReactNode }) {
  const styles = {
    info: "border-border bg-card text-foreground/70",
    error: "border-destructive/50 bg-destructive/10",
    ok: "border-emerald-500/40 bg-emerald-500/10",
    warn: "border-[var(--brand)]/40 bg-[var(--brand)]/10",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function Loading({ text }: { text: string }) {
  return <p className="flex items-center gap-2 text-sm text-foreground/60"><Loader2 size={16} className="animate-spin" /> {text}</p>;
}
