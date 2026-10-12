// Datos del negocio (una sola fuente para hero, "Nosotros", contacto, footer y SEO).
// vite.config.ts también importa este archivo para generar el JSON-LD, robots.txt y
// sitemap.xml, así que aquí no se puede usar el alias "@/" ni importar componentes.

export const BUSINESS_NAME = "305 Hair Style";
/** Dominio público, sin "/" final. Se usa en canonical, Open Graph y sitemap. */
export const SITE_URL = "https://305hairstyle.com";
export const SITE_DESCRIPTION =
  "Salón de belleza en Miami: cortes, color, peinados y tratamientos. Reserva tu cita en línea en Novus Salon Suites, Coral Way.";
export const LOCATION_SHORT = "Novus Salon Suites, Miami, FL";
export const ADDRESS = "8631 Coral Wy, Miami, FL 33155";
export const MAPS_URL = "https://maps.app.goo.gl/Twibn3iCQszrQgE4A";
export const HOURS = "Sáb–Lun: 9am – 7pm";
export const PHONE_DISPLAY = "(786) 566-9938";
/** Teléfono en formato internacional (E.164) para el JSON-LD. */
export const PHONE_E164 = "+17865669938";
export const WHATSAPP_URL = "https://wa.me/17865669938";
export const INSTAGRAM_URL = "https://www.instagram.com/305hairstyle/";
export const FACEBOOK_URL = "https://facebook.com";

// --- Datos estructurados (JSON-LD HairSalon) -------------------------------------
// TODO(Julio): confirmar dirección, horario y rango de precios antes de dar el SEO por
// cerrado. El horario debe coincidir con HOURS (arriba), OPEN_WEEKDAYS
// (src/lib/businessTime.ts) y Business:OpeningHours de la API.

/** Dirección desglosada (schema.org PostalAddress). TODO: confirmar. */
export const POSTAL_ADDRESS = {
  streetAddress: "8631 Coral Wy",
  addressLocality: "Miami",
  addressRegion: "FL",
  postalCode: "33155",
  addressCountry: "US",
};

/** Horario de apertura (schema.org OpeningHoursSpecification). TODO: confirmar. */
export const OPENING_HOURS = [
  { days: ["Saturday", "Sunday", "Monday"], opens: "09:00", closes: "19:00" },
];

/** Rango de precios aproximado ("$", "$$", "$$$"). TODO: confirmar. */
export const PRICE_RANGE = "$$";

export const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

// Cifras de la franja bajo el hero.
export const QUICK_STATS = [
  { value: "+200", label: "Clientas satisfechas" },
  { value: "6+", label: "Años de experiencia" },
  { value: "15+", label: "Servicios disponibles" },
  { value: "5★", label: "Calificación promedio" },
];
