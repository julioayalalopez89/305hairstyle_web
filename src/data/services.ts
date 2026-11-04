export type Service = {
  name: string;
  /** Lo que ocupa la cita en la agenda (la API usa esto para los horarios libres). */
  durationMinutes: number;
  price: string;
  desc: string;
  popular: boolean;
};

export type ServiceCategory = { category: string; items: Service[] };

// RESPALDO: los servicios reales se editan en /admin/ → Servicios y la web los lee de la API
// (src/lib/catalog.ts). Esta lista solo se usa mientras carga, si la API no responde o si el
// panel todavía no tiene servicios guardados. En /admin/ hay un botón para importarla.
export const SERVICES: ServiceCategory[] = [
  {
    category: "Cabello",
    items: [
      { name: "Corte + Peinado", durationMinutes: 60, price: "$55", desc: "Corte personalizado y blow-out profesional", popular: true },
      { name: "Coloración Completa", durationMinutes: 150, price: "$180+", desc: "Tinte de alta gama, sin amoníaco disponible", popular: false },
      { name: "Balayage / Highlights", durationMinutes: 180, price: "$120+", desc: "Técnica francesa con degradado natural", popular: true },
      { name: "Alisado Brasileño", durationMinutes: 180, price: "$180+", desc: "Keratina profesional, dura hasta 4 meses", popular: false },
    ],
  },
  {
    category: "Tratamientos",
    items: [
      { name: "Hidratación Profunda", durationMinutes: 45, price: "$35", desc: "Máscara nutritiva + vapor para pelo dañado", popular: false },
      { name: "Botox Capilar", durationMinutes: 120, price: "$180+", desc: "Reparación profunda, brillo y control del frizz.", popular: true },
      { name: "Keratina", durationMinutes: 180, price: "$180+", desc: "Alisado profesional con efecto suave y duradero.", popular: false },
    ],
  },
];

// Atajos del hero y lista del footer: respaldo (con servicios del panel se calculan solos).
export const HERO_SERVICE_PILLS = ["Corte + Peinado · $55", "Coloración · $180+", "Balayage · $120+"];

// Lista corta de servicios del footer.
export const FOOTER_SERVICES = ["Corte + Peinado", "Coloración", "Balayage", "Alisado Brasileño", "Tratamientos"];
