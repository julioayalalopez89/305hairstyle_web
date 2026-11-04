// Fotos reales del salón (public/images), en WebP. Las de 768 px tienen además una
// versión de 480 px para teléfonos (srcset). width/height son los del archivo grande:
// el navegador reserva el hueco y la página no salta al cargar (CLS).
// Se antepone BASE_URL para que funcionen también en las vistas previas /preview/pr-<n>/.
const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export type Photo = { url: string; srcSet?: string; width: number; height: number; alt: string };

export const GALLERY_PHOTOS: Photo[] = [
  { url: img("studio-1.webp"), width: 474, height: 815, alt: "Cliente recibiendo tratamiento capilar en el salón" },
  { url: img("studio-2.webp"), srcSet: `${img("studio-2-480.webp")} 480w, ${img("studio-2.webp")} 768w`, width: 768, height: 1024, alt: "Interior elegante del salón 305 Hair Style" },
  { url: img("studio-3.webp"), srcSet: `${img("studio-3-480.webp")} 480w, ${img("studio-3.webp")} 768w`, width: 768, height: 1024, alt: "Estilista profesional usando secador de pelo" },
  { url: img("studio-4.webp"), srcSet: `${img("studio-4-480.webp")} 480w, ${img("studio-4.webp")} 768w`, width: 768, height: 1024, alt: "Resultado de coloración rubio dorado" },
  { url: img("studio-5.webp"), width: 475, height: 809, alt: "Herramientas profesionales de peluquería" },
];

// Foto de la sección "Nosotros" (Unsplash, ya servida en WebP/AVIF con auto=format).
export const ABOUT_PHOTO: Photo = {
  url: "https://images.unsplash.com/photo-1629397685944-7073f5589754?w=600&h=750&fit=crop&auto=format",
  srcSet:
    "https://images.unsplash.com/photo-1629397685944-7073f5589754?w=400&h=500&fit=crop&auto=format 400w, " +
    "https://images.unsplash.com/photo-1629397685944-7073f5589754?w=600&h=750&fit=crop&auto=format 600w",
  width: 600,
  height: 750,
  alt: "El equipo de 305 Hair Style en Miami",
};
