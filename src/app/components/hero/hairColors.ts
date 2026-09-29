// Colores de pelo que la visitante puede elegir para la seda del hero.
// deep = sombra, main = color base, shine = reflejo del brillo.
export type HairColor = { id: string; name: string; deep: string; main: string; shine: string };

export const HAIR_COLORS: HairColor[] = [
  { id: "oro", name: "Oro", deep: "#3A2608", main: "#E8B94A", shine: "#FFEBB0" },
  { id: "rubio", name: "Rubio miel", deep: "#4A3212", main: "#D9B26F", shine: "#FFF1CF" },
  { id: "platino", name: "Platino", deep: "#3A3A40", main: "#C9CCD3", shine: "#FFFFFF" },
  { id: "castano", name: "Castaño", deep: "#140903", main: "#4A2410", shine: "#8C5A38" },
  { id: "negro", name: "Negro azabache", deep: "#030303", main: "#141416", shine: "#4E5664" },
  { id: "cobrizo", name: "Cobrizo", deep: "#2A0C03", main: "#A4441A", shine: "#E88A55" },
  { id: "borgona", name: "Borgoña", deep: "#1E030B", main: "#6A1029", shine: "#C25A78" },
  { id: "rosa", name: "Rosa", deep: "#3A0A24", main: "#D9478F", shine: "#FFC4E1" },
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
