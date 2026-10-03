import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SERVICES } from "@/data/services";

type Props = {
  /** "Reservar este servicio": preselecciona el servicio en la reserva. */
  onBook: (serviceName: string) => void;
  onNavigate: (href: string) => void;
};

export default function Services({ onBook, onNavigate }: Props) {
  const [activeService, setActiveService] = useState(0);

  return (
    <section id="servicios" className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--brand)] mb-3 block">Lo que ofrecemos</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Nuestros servicios
          </h2>
          <p className="text-foreground/60 text-base max-w-md mx-auto">
            Cada servicio es una experiencia diseñada para realzar tu belleza natural con productos de primera calidad.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {SERVICES.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setActiveService(i)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeService === i
                  ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-lg shadow-[var(--brand)]/20"
                  : "bg-secondary text-foreground/70 hover:text-foreground"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES[activeService].items.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => onBook(item.name)}
              className="group relative text-left bg-card rounded-2xl p-6 border border-border hover:border-[var(--brand)]/30 hover:shadow-lg hover:shadow-[var(--brand)]/5 transition-all duration-300 cursor-pointer"
            >
              {item.popular && (
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold text-[var(--brand)] bg-secondary px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {item.name}
                </h3>
                <span className="text-xl font-bold text-[var(--brand)] shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {item.price}
                </span>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[var(--brand)] text-xs font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <span>Reservar este servicio</span>
                <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate("#contacto")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--brand)] text-[var(--on-brand)] font-semibold hover:bg-[var(--brand-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--brand)]/25"
          >
            Reservar un turno
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
