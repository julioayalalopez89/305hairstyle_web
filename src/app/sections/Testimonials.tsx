import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-[var(--brand)] text-[var(--brand)]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24" style={{ background: "#110D0A" }}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--brand)] mb-3 block">Reseñas</span>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Lo que dicen nuestras clientas
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-[#1F1914] rounded-2xl p-6 shadow-sm border border-[var(--brand)]/15">
              <StarRating count={t.rating} />
              <p className="mt-4 mb-5 text-foreground/75 leading-relaxed text-sm italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--brand)] flex items-center justify-center text-[var(--on-brand)] text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-foreground/50">{t.service}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
