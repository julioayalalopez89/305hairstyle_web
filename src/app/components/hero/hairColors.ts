// Colores de pelo que la visitante puede elegir para la seda del hero.
// deep = sombra, main = color base, shine = reflejo del brillo.
export type HairColor = { id: string; name: string; deep: string; main: string; shine: string };

export const HAIR_COLORS: HairColor[] = [
  { id: "oro", name: "Oro", deep: "#3A2608", main: "#E8B94A", shine: "#FFEBB0" },
  { id: "rubio", name: "Rubio miel", deep: "#4A3212", main: "#D9B26F", shine: "#FFF1CF" },
  { id: "platino", name: "Platino", deep: "#3A3A40", main: "#C9CCD3", shine: "#FFFFFF" },
  { id: "castano", name: "Castaño", deep: "#1F0F06", main: "#6B3A1E", shine: "#D9A57A" },
  { id: "negro", name: "Negro azabache", deep: "#050505", main: "#2A2A2E", shine: "#B8C4D6" },
  { id: "cobrizo", name: "Cobrizo", deep: "#3A1206", main: "#B5501F", shine: "#FFB27A" },
  { id: "borgona", name: "Borgoña", deep: "#2A0510", main: "#7E1734", shine: "#F2A0B5" },
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
