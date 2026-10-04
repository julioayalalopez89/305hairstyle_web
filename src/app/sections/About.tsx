import { Clock, MapPin, Phone, Star } from "lucide-react";
import { ADDRESS, HOURS, PHONE_DISPLAY } from "@/data/business";
import { ABOUT_PHOTO } from "@/data/gallery";

export default function About() {
  return (
    <section id="nosotros" className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="rounded-3xl overflow-hidden bg-secondary aspect-[4/5]">
            <img
              src={ABOUT_PHOTO.url}
              alt={ABOUT_PHOTO.alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-[var(--brand)] text-[var(--on-brand)] rounded-2xl p-5 shadow-xl max-w-[160px]">
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>3+</div>
            <div className="text-xs font-semibold opacity-90">Años transformando looks en Miami</div>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--brand)] mb-4 block">Nuestra historia</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Más que cabello, transformamos la <em className="italic font-medium text-[var(--brand)]">confianza</em> de cada mujer
          </h2>
          <p className="text-foreground/65 leading-relaxed mb-5">
            Soy Ana, fundadora de 305 Hair Style, y desde hace 3 años mi pasión ha sido ayudar a cada clienta a sentirse hermosa, segura y feliz con su imagen.
          </p>
          <p className="text-foreground/65 leading-relaxed mb-5">
            Cada corte, color y tratamiento lo realizo con dedicación, utilizando productos de alta calidad y técnicas profesionales para cuidar la salud del cabello y lograr resultados naturales y duraderos.
          </p>
          <p className="text-foreground/65 leading-relaxed mb-5">
            En 305 Hair Style no eres una cita más. Me tomo el tiempo de escuchar lo que deseas y recomendarte lo que mejor se adapta a tu estilo y a tu cabello, para que salgas del salón sintiéndote la mejor versión de ti.
          </p>
          <p className="text-foreground/65 leading-relaxed mb-8">
            Gracias por confiar en mí. Será un placer ayudarte a lucir el cabello que siempre has soñado.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, text: HOURS },
              { icon: MapPin, text: ADDRESS },
              { icon: Phone, text: PHONE_DISPLAY },
              { icon: Star, text: "5★ en Google Reviews" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-foreground/70">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-[var(--brand)]" />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
