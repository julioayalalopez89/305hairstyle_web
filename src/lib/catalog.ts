// Servicios y horario de la web. Salen de la API (GET /api/catalog), que es lo que se
// edita en /admin/. Mientras carga, si falla o si el panel aún no tiene servicios,
// se usan los datos de respaldo de src/data/services.ts y el horario de businessTime.ts.

import { useEffect, useState } from "react";
import { getCatalog, type BusinessDayDto, type CatalogResponse, type CatalogServiceDto } from "./api";
import { SERVICES, HERO_SERVICE_PILLS, FOOTER_SERVICES, type ServiceCategory } from "@/data/services";
import { DEFAULT_SCHEDULE, formatHoursSummary, openDaysSentence, type Schedule } from "./businessTime";

export type Catalog = {
  services: ServiceCategory[];
  schedule: Schedule;
  /** "api" cuando los datos vienen del panel; "fallback" con los datos del código. */
  source: "api" | "fallback";
};

const STORAGE_KEY = "305hs.catalog.v1";

const FALLBACK: Catalog = { services: SERVICES, schedule: DEFAULT_SCHEDULE, source: "fallback" };

/** Agrupa por categoría respetando el orden en que aparecen. */
export function groupServices(list: CatalogServiceDto[]): ServiceCategory[] {
  const groups: ServiceCategory[] = [];
  for (const s of list) {
    let g = groups.find((x) => x.category === s.category);
    if (!g) groups.push((g = { category: s.category, items: [] }));
    g.items.push({
      name: s.name,
      durationMinutes: s.durationMinutes,
      price: s.price,
      desc: s.description ?? "",
      popular: s.popular,
    });
  }
  return groups;
}

export function scheduleFromDays(days: BusinessDayDto[], closedDates: string[] = []): Schedule {
  return { days: [...days].sort((a, b) => a.day - b.day), closedDates };
}

function fromResponse(r: CatalogResponse): Catalog {
  const schedule = scheduleFromDays(r.schedule.days, r.schedule.closedDates.map((c) => c.date));
  const services = r.services.length ? groupServices(r.services) : SERVICES;
  return { services, schedule, source: r.services.length ? "api" : "fallback" };
}

function readStored(): Catalog | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? fromResponse(JSON.parse(raw) as CatalogResponse) : null;
  } catch {
    return null;
  }
}

let current: Catalog = readStored() ?? FALLBACK;
let inflight: Promise<void> | null = null;
const listeners = new Set<(c: Catalog) => void>();

function refresh(): Promise<void> {
  inflight ??= getCatalog()
    .then((r) => {
      current = fromResponse(r);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
      } catch {
        // sin almacenamiento: se vuelve a pedir en la próxima visita
      }
      listeners.forEach((l) => l(current));
    })
    .catch(() => {
      // Sin API: se quedan los datos guardados o los de respaldo.
    });
  return inflight;
}

/** Servicios y horario actuales. Pide la API una vez por visita y actualiza a todos los componentes. */
export function useCatalog(): Catalog {
  const [catalog, setCatalog] = useState(current);
  useEffect(() => {
    listeners.add(setCatalog);
    setCatalog(current);
    refresh();
    return () => { listeners.delete(setCatalog); };
  }, []);
  return catalog;
}

/** Atajos del hero: hasta 3 servicios populares ("Corte + Peinado · $55"). */
export function heroPills(c: Catalog): string[] {
  if (c.source !== "api") return HERO_SERVICE_PILLS;
  const all = c.services.flatMap((g) => g.items);
  const picks = [...all.filter((s) => s.popular), ...all.filter((s) => !s.popular)].slice(0, 3);
  return picks.map((s) => `${s.name} · ${s.price}`);
}

/** Lista corta de servicios del footer. */
export function footerServices(c: Catalog): string[] {
  if (c.source !== "api") return FOOTER_SERVICES;
  return c.services.flatMap((g) => g.items.map((s) => s.name)).slice(0, 5);
}

/** "Sáb–Lun: 9am – 7pm" a partir del horario. */
export const hoursText = (c: Catalog) => formatHoursSummary(c.schedule);
/** "Abrimos sábado, domingo y lunes." */
export const openDaysText = (c: Catalog) => openDaysSentence(c.schedule);
