// Colores de pelo que la visitante puede elegir. Cambian la seda del hero y
// también el color de acento de toda la web (botones, títulos, estrellas...).
// deep/main/shine = sombra, base y brillo de la seda.
// accent/accentHover/onAccent = color de la web, su hover y el texto encima del botón.
export type HairColor = {
  id: string; name: string;
  deep: string; main: string; shine: string;
  accent: string; accentHover: string; onAccent: string;
};

export const HAIR_COLORS: HairColor[] = [
  { id: "oro", name: "Oro", deep: "#3A2608", main: "#E8B94A", shine: "#FFEBB0", accent: "#E8B94A", accentHover: "#F5D27A", onAccent: "#0D0B09" },
  { id: "rubio", name: "Rubio miel", deep: "#4A3212", main: "#D9B26F", shine: "#FFF1CF", accent: "#D9B26F", accentHover: "#EACB94", onAccent: "#0D0B09" },
  { id: "platino", name: "Platino", deep: "#3A3A40", main: "#C9CCD3", shine: "#FFFFFF", accent: "#CDD1D9", accentHover: "#E8EAEE", onAccent: "#0D0B09" },
  { id: "castano", name: "Castaño", deep: "#140903", main: "#4A2410", shine: "#8C5A38", accent: "#B98355", accentHover: "#CF9D72", onAccent: "#0D0B09" },
  { id: "negro", name: "Negro azabache", deep: "#030303", main: "#141416", shine: "#4E5664", accent: "#A3AEBF", accentHover: "#C0C9D6", onAccent: "#0D0B09" },
  { id: "cobrizo", name: "Cobrizo", deep: "#2A0C03", main: "#A4441A", shine: "#E88A55", accent: "#E0733A", accentHover: "#EC9160", onAccent: "#0D0B09" },
  { id: "borgona", name: "Borgoña", deep: "#1E030B", main: "#6A1029", shine: "#C25A78", accent: "#C8456A", accentHover: "#D96A8A", onAccent: "#FFFFFF" },
  { id: "rosa", name: "Rosa", deep: "#3A0A24", main: "#D9478F", shine: "#FFC4E1", accent: "#E45C9F", accentHover: "#EE82B7", onAccent: "#0D0B09" },
];

export const DEFAULT_HAIR_COLOR = "oro";
const STORAGE_KEY = "305hs.hairColor";

export function loadHairColor(): HairColor {
  let id = DEFAULT_HAIR_COLOR;
  try {
    id = window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_HAIR_COLOR;
  } catch {
    // modo privado o almacenamiento bloqueado: se usa el color por defecto
  }
  return HAIR_COLORS.find((c) => c.id === id) ?? HAIR_COLORS[0];
}

export function saveHairColor(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // sin almacenamiento: el color se aplica igual, solo no se recuerda
  }
}

/** Pone el color de acento de la web (variables CSS --brand, --brand-hover, --on-brand). */
export function applyAccent(c: HairColor) {
  const s = document.documentElement.style;
  s.setProperty("--brand", c.accent);
  s.setProperty("--brand-hover", c.accentHover);
  s.setProperty("--on-brand", c.onAccent);
}
