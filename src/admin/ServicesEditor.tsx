import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Clock, EyeOff, Plus, Sparkles, Trash2 } from "lucide-react";
import { ApiError, adminGetServices, adminSaveServices, type CatalogServiceDto } from "@/lib/api";
import { formatDuration } from "@/lib/businessTime";
import { SERVICES } from "@/data/services";
import { Loading, Notice, SaveBar, Toggle, chipBtn, iconBtn, inputClass, labelClass, serif, useUnsavedWarning } from "./ui";

// Panel → Servicios: nombre, categoría, precio, duración, descripción, "Popular" y si se ve en la web.
// Se guarda la lista entera de una vez (PUT /api/catalog/services); el orden de la lista es el de la web.

type Row = CatalogServiceDto & { key: string };

type Props = {
  adminKey: string;
  onUnauthorized: () => void;
  onDirtyChange: (dirty: boolean) => void;
};

/** Duraciones del selector: de 15 min a 8 h, cada 15 min. */
const DURATIONS = Array.from({ length: 32 }, (_, i) => (i + 1) * 15);

let nextKey = 0;
const withKey = (s: CatalogServiceDto): Row => ({ ...s, key: `k${nextKey++}` });
const strip = (rows: Row[]): CatalogServiceDto[] => rows.map(({ key: _key, ...s }) => s); // eslint-disable-line @typescript-eslint/no-unused-vars

/** Servicios de respaldo de la web (src/data/services.ts) en el formato de la API. */
const fromWebsite = (): CatalogServiceDto[] =>
  SERVICES.flatMap((cat) => cat.items.map((i) => ({
    id: null, category: cat.category, name: i.name, durationMinutes: i.durationMinutes,
    price: i.price, description: i.desc, popular: i.popular, active: true,
  })));

function validate(rows: Row[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Map<string, string>();
  for (const r of rows) {
    const msgs: string[] = [];
    if (!r.name.trim()) msgs.push("Falta el nombre.");
    if (!r.category.trim()) msgs.push("Falta la categoría.");
    if (!r.price.trim()) msgs.push("Falta el precio.");
    if (r.price.trim().length > 30) msgs.push("Precio: máximo 30 caracteres.");
    if ((r.description ?? "").length > 500) msgs.push("Descripción: máximo 500 caracteres.");
    const n = r.name.trim().toLowerCase();
    if (n && seen.has(n)) msgs.push("Ya hay otro servicio con este nombre.");
    if (n) seen.set(n, r.key);
    if (msgs.length) errors[r.key] = msgs.join(" ");
  }
  return errors;
}

export default function ServicesEditor({ adminKey, onUnauthorized, onDirtyChange }: Props) {
  const [saved, setSaved] = useState<Row[] | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const focusKey = useRef<string | null>(null);

  // Ref: el padre crea onUnauthorized en cada render y no debe volver a disparar la carga.
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;
  const handle = useCallback((e: unknown, fallback: string) => {
    if (e instanceof ApiError && e.kind === "unauthorized") { onUnauthorizedRef.current(); return null; }
    return e instanceof ApiError ? e.message : fallback;
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    adminGetServices(adminKey, ctrl.signal)
      .then((list) => { const r = list.map(withKey); setSaved(r); setRows(r); })
      .catch((e) => { if (!ctrl.signal.aborted) setLoadError(handle(e, "No se pudieron cargar los servicios.")); });
    return () => ctrl.abort();
  }, [adminKey, handle]);

  const dirty = useMemo(() => saved !== null && JSON.stringify(strip(rows)) !== JSON.stringify(strip(saved)), [rows, saved]);
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useUnsavedWarning(dirty);

  const errors = useMemo(() => validate(rows), [rows]);

  // Enfocar el nombre del servicio recién añadido.
  useEffect(() => {
    if (!focusKey.current) return;
    document.getElementById(`svc-name-${focusKey.current}`)?.focus();
    focusKey.current = null;
  });

  const categories = useMemo(() => {
    const list: string[] = [];
    for (const r of rows) if (!list.includes(r.category)) list.push(r.category);
    return list;
  }, [rows]);

  const update = (key: string, patch: Partial<CatalogServiceDto>) => {
    setSavedOk(false);
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const toggleOpen = (key: string, value?: boolean) =>
    setOpen((s) => { const n = new Set(s); (value ?? !n.has(key)) ? n.add(key) : n.delete(key); return n; });

  const add = (category: string) => {
    const row = withKey({ id: null, category, name: "", durationMinutes: 60, price: "", description: "", popular: false, active: true });
    setSavedOk(false);
    setRows((list) => {
      // Al final de su categoría (o al final de todo si es nueva).
      const last = list.map((r) => r.category).lastIndexOf(category);
      const at = last === -1 ? list.length : last + 1;
      return [...list.slice(0, at), row, ...list.slice(at)];
    });
    toggleOpen(row.key, true);
    focusKey.current = row.key;
  };

  const addCategory = () => {
    const name = window.prompt("Nombre de la nueva categoría (ej. Uñas, Maquillaje):")?.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) { window.alert("Esa categoría ya existe."); return; }
    add(name);
  };

  const remove = (r: Row) => {
    if (!window.confirm(`¿Eliminar "${r.name || "servicio sin nombre"}"? Las citas ya reservadas no cambian.\n\nSi solo quieres que no se vea en la web, usa "Visible en la web".`)) return;
    setSavedOk(false);
    setRows((list) => list.filter((x) => x.key !== r.key));
  };

  /** Mueve un servicio dentro de su categoría. */
  const move = (key: string, dir: -1 | 1) => {
    setSavedOk(false);
    setRows((list) => {
      const i = list.findIndex((r) => r.key === key);
      const sameCat = list.map((r, idx) => ({ r, idx })).filter((x) => x.r.category === list[i].category);
      const pos = sameCat.findIndex((x) => x.idx === i);
      const target = sameCat[pos + dir];
      if (!target) return list;
      const next = [...list];
      [next[i], next[target.idx]] = [next[target.idx], next[i]];
      return next;
    });
  };

  /** Mueve una categoría entera (con sus servicios) arriba o abajo. */
  const moveCategory = (category: string, dir: -1 | 1) => {
    const order = [...categories];
    const i = order.indexOf(category);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setSavedOk(false);
    setRows((list) => order.flatMap((c) => list.filter((r) => r.category === c)));
  };

  const renameCategory = (from: string) => {
    const to = window.prompt(`Nuevo nombre para "${from}":`, from)?.trim();
    if (!to || to === from) return;
    setSavedOk(false);
    setRows((list) => list.map((r) => (r.category === from ? { ...r, category: to } : r)));
  };

  const save = async () => {
    setShowErrors(true);
    setSaveError(null);
    if (Object.keys(errors).length) {
      setOpen((s) => new Set([...s, ...Object.keys(errors)]));
      setSaveError("Revisa los servicios marcados en rojo.");
      return;
    }
    setSaving(true);
    try {
      const payload = strip(rows).map((s) => ({ ...s, name: s.name.trim(), category: s.category.trim(), price: s.price.trim(), description: s.description?.trim() || null }));
      const result = (await adminSaveServices(adminKey, payload)).map(withKey);
      setSaved(result);
      setRows(result);
      setOpen(new Set());
      setShowErrors(false);
      setSavedOk(true);
    } catch (e) {
      const msg = handle(e, "No se pudo guardar.");
      if (msg) setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!saved || !window.confirm("¿Descartar los cambios sin guardar?")) return;
    setRows(saved);
    setOpen(new Set());
    setShowErrors(false);
    setSaveError(null);
  };

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!saved) return <Loading text="Cargando servicios…" />;

  // Todavía no hay servicios en el panel: la web muestra los del código.
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Sparkles size={26} className="mx-auto mb-3 text-[var(--brand)]" />
        <h2 className="text-2xl font-semibold mb-1" style={serif}>Todavía no hay servicios aquí</h2>
        <p className="text-sm text-foreground/60 mb-5 max-w-md mx-auto">
          Ahora la web muestra la lista que viene en el código ({SERVICES.reduce((n, c) => n + c.items.length, 0)} servicios).
          Impórtala para editarla desde aquí, o empieza una nueva.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button" onClick={() => { setRows(fromWebsite().map(withKey)); setSavedOk(false); }}
            className="px-5 py-2.5 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] text-sm font-semibold hover:bg-[var(--brand-hover)]"
          >
            Importar los servicios de la web
          </button>
          <button type="button" onClick={() => add("Cabello")} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:border-[var(--brand)]">
            Empezar de cero
          </button>
        </div>
        <p className="mt-4 text-xs text-foreground/45">No se publica nada hasta que pulses Guardar.</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {savedOk && !dirty && <Notice tone="ok">Guardado. La web ya muestra estos servicios y precios.</Notice>}
      {saveError && <Notice tone="error">{saveError}</Notice>}
      <p className="mb-6 text-sm text-foreground/55">
        Lo que guardes aquí es lo que ve la clienta en la web y en la reserva. La duración decide cuánto tiempo bloquea la cita en la agenda.
      </p>

      <datalist id="svc-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>

      <div className="space-y-8">
        {categories.map((cat, ci) => {
          const items = rows.filter((r) => r.category === cat);
          return (
            <section key={cat || "(sin categoría)"}>
              <div className="mb-3 flex items-center gap-1">
                <h2 className="text-2xl font-semibold mr-auto" style={serif}>{cat || <span className="text-foreground/40">Sin categoría</span>}</h2>
                {cat && <button type="button" onClick={() => renameCategory(cat)} className="px-2 py-1 text-xs font-semibold text-foreground/50 hover:text-[var(--brand)]">Renombrar</button>}
                <button type="button" onClick={() => moveCategory(cat, -1)} disabled={ci === 0} className={iconBtn} aria-label={`Subir la categoría ${cat}`} title="Subir categoría"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => moveCategory(cat, 1)} disabled={ci === categories.length - 1} className={iconBtn} aria-label={`Bajar la categoría ${cat}`} title="Bajar categoría"><ArrowDown size={16} /></button>
              </div>
              <ul className="space-y-2">
                {items.map((r, i) => (
                  <ServiceRow
                    key={r.key} row={r} expanded={open.has(r.key)} error={showErrors ? errors[r.key] : undefined}
                    first={i === 0} last={i === items.length - 1}
                    onToggle={() => toggleOpen(r.key)} onChange={(p) => update(r.key, p)}
                    onMove={(d) => move(r.key, d)} onRemove={() => remove(r)}
                  />
                ))}
              </ul>
              <button type="button" onClick={() => add(cat)} className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--brand)] hover:underline underline-offset-4">
                <Plus size={15} /> Añadir servicio{cat ? ` en ${cat}` : ""}
              </button>
            </section>
          );
        })}
      </div>

      <button type="button" onClick={addCategory} className={`${chipBtn} mt-8`}>
        <Plus size={14} /> Nueva categoría
      </button>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={discard} />
    </div>
  );
}

function ServiceRow({ row: r, expanded, error, first, last, onToggle, onChange, onMove, onRemove }: {
  row: Row; expanded: boolean; error?: string; first: boolean; last: boolean;
  onToggle: () => void; onChange: (p: Partial<CatalogServiceDto>) => void; onMove: (d: -1 | 1) => void; onRemove: () => void;
}) {
  const id = (f: string) => `svc-${f}-${r.key}`;
  const [category, setCategory] = useState(r.category);
  useEffect(() => { setCategory(r.category); }, [r.category]);
  return (
    <li className={`rounded-2xl border bg-card ${error ? "border-[#F08A8A]/70" : "border-border"} ${!r.active ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-2 p-3 pl-4">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-2">
            <span className="font-semibold truncate">{r.name || <span className="text-foreground/40">Servicio sin nombre</span>}</span>
            {r.popular && <span className="shrink-0 text-[9px] uppercase tracking-widest font-bold text-[var(--brand)] bg-secondary px-1.5 py-0.5 rounded-full">Popular</span>}
            {!r.active && <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/50"><EyeOff size={11} /> Oculto</span>}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-foreground/55">
            <span className="font-bold text-[var(--brand)] text-sm" style={serif}>{r.price || "—"}</span>
            <span className="inline-flex items-center gap-1"><Clock size={11} /> {formatDuration(r.durationMinutes)}</span>
          </span>
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={first} className={iconBtn} aria-label={`Subir ${r.name}`} title="Subir"><ArrowUp size={16} /></button>
        <button type="button" onClick={() => onMove(1)} disabled={last} className={iconBtn} aria-label={`Bajar ${r.name}`} title="Bajar"><ArrowDown size={16} /></button>
        <button type="button" onClick={onToggle} className={iconBtn} aria-label={expanded ? "Cerrar" : `Editar ${r.name}`} title={expanded ? "Cerrar" : "Editar"}>
          <ChevronDown size={18} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {error && !expanded && <p className="px-4 pb-3 -mt-1 text-xs text-[#F08A8A]">{error}</p>}

      {expanded && (
        <div className="border-t border-border p-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={id("name")} className={labelClass}>Nombre</label>
            <input id={id("name")} value={r.name} maxLength={200} onChange={(e) => onChange({ name: e.target.value })} className={inputClass} aria-invalid={!!error && !r.name.trim()} />
          </div>
          <div>
            <label htmlFor={id("price")} className={labelClass}>Precio</label>
            <input id={id("price")} value={r.price} maxLength={30} placeholder="$55 o $180+" onChange={(e) => onChange({ price: e.target.value })} className={inputClass} aria-invalid={!!error && !r.price.trim()} />
          </div>
          <div>
            <label htmlFor={id("duration")} className={labelClass}>Duración en la agenda</label>
            <select id={id("duration")} value={r.durationMinutes} onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })} className={inputClass}>
              {!DURATIONS.includes(r.durationMinutes) && <option value={r.durationMinutes}>{formatDuration(r.durationMinutes)}</option>}
              {DURATIONS.map((m) => <option key={m} value={m}>{formatDuration(m)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={id("category")} className={labelClass}>Categoría</label>
            {/* Se aplica al salir del campo: cambiar la categoría mueve el servicio de grupo. */}
            <input
              id={id("category")} value={category} maxLength={100} list="svc-categories"
              onChange={(e) => setCategory(e.target.value)}
              onBlur={() => { if (category.trim() !== r.category) onChange({ category: category.trim() }); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className={inputClass} aria-invalid={!!error && !r.category.trim()}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={id("desc")} className={labelClass}>Descripción</label>
            <textarea id={id("desc")} rows={2} maxLength={500} value={r.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex items-center gap-3">
            <Toggle id={id("popular")} checked={r.popular} onChange={(v) => onChange({ popular: v })} label="Marcar como popular" />
            <label htmlFor={id("popular")} className="text-sm">Marcar como <b>Popular</b></label>
          </div>
          <div className="flex items-center gap-3">
            <Toggle id={id("active")} checked={r.active} onChange={(v) => onChange({ active: v })} label="Visible en la web" />
            <label htmlFor={id("active")} className="text-sm">Visible en la web</label>
          </div>
          {error && <p className="sm:col-span-2 text-xs text-[#F08A8A]">{error}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-foreground/50 hover:text-[#F08A8A] hover:bg-white/5">
              <Trash2 size={15} /> Eliminar servicio
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
