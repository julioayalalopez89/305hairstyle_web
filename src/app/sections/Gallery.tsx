import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/data/business";
import { GALLERY_PHOTOS } from "@/data/gallery";

export default function Gallery() {
  return (
    <section id="galeria" className="py-24" style={{ background: "#15110E" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--brand)] mb-3 block">Nuestro trabajo</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Galería
          </h2>
          <p className="text-foreground/60 text-base max-w-md mx-auto">
            Cada cliente es una obra de arte. Mira algunos de nuestros trabajos más recientes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-secondary ${
                i === 0 || i === 5 ? "row-span-2" : ""
              }`}
              style={{ aspectRatio: i === 0 || i === 5 ? "3/4" : "4/3" }}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A14]/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline underline-offset-4"
          >
            <Instagram size={16} />
            Ver más en @305hairstyle
          </a>
        </div>
      </div>
    </section>
  );
}
