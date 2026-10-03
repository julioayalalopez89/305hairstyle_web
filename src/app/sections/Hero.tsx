import { lazy, Suspense } from "react";
import { MapPin } from "lucide-react";
import { LOCATION_SHORT, MAPS_URL } from "@/data/business";
import { HERO_SERVICE_PILLS } from "@/data/services";

// three.js se carga aparte para no frenar la primera pintura de la página.
const SilkBackground = lazy(() => import("../components/hero/SilkBackground"));

export default function Hero({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "radial-gradient(120% 90% at 80% 20%, #231910 0%, #0D0B09 60%)" }}
    >
      {/* Seda 3D: sigue el cursor o la inclinación del teléfono */}
      <Suspense fallback={null}>
        <SilkBackground className="absolute inset-0 w-full h-full pointer-events-none" />
      </Suspense>

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-48 md:pt-24 pb-24 md:pb-16 w-full grid md:grid-cols-2 gap-12 items-center max-md:self-end">
        {/* Left text */}
        <div className="max-md:bg-[#0D0B09]/70 max-md:backdrop-blur-[3px] max-md:rounded-3xl max-md:p-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border mb-6 backdrop-blur-sm">
            <MapPin size={12} className="text-[var(--brand)]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--brand)]">
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {LOCATION_SHORT}
              </a>
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Tu belleza,{" "}
            <em className="italic font-medium text-[var(--brand)]">nuestra</em>
            <br />
            pasión
          </h1>

          <p className="text-lg text-foreground/65 mb-8 max-w-md leading-relaxed font-light">
            Salón de belleza de lujo en el corazón de Miami. Especialistas en color, corte y tratamientos capilares de alta gama.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => onNavigate("#contacto")}
              className="px-7 py-3.5 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-semibold text-base hover:bg-[var(--brand-hover)] transition-all duration-200 hover:shadow-xl hover:shadow-[var(--brand)]/25 active:scale-95"
            >
              Reservar turno
            </button>
            <button
              onClick={() => onNavigate("#servicios")}
              className="px-7 py-3.5 rounded-full border-2 border-[var(--brand)] text-[var(--brand)] font-semibold text-base hover:bg-secondary transition-all duration-200"
            >
              Ver servicios
            </button>
          </div>

          {/* Quick service pills */}
          <div className="flex flex-wrap gap-2">
            {HERO_SERVICE_PILLS.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs font-semibold text-foreground/70 backdrop-blur-sm">
                {s}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/40">
        <span className="text-[10px] uppercase tracking-widest font-semibold">Explorar</span>
        <div className="w-px h-8 bg-current animate-pulse" />
      </div>
    </section>
  );
}
