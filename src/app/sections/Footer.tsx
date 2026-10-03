import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import SalonLogo from "../components/SalonLogo";
import { ADDRESS, HOURS, INSTAGRAM_URL, LOCATION_SHORT, PHONE_DISPLAY } from "@/data/business";
import { FOOTER_SERVICES } from "@/data/services";

export default function Footer({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <footer className="bg-[#080706] text-white py-14 border-t border-[var(--brand)]/15">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <SalonLogo size={34} className="opacity-90" />
              <div>
                <div className="text-base font-bold tracking-[0.2em]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  305 HAIR STYLE
                </div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--brand)] font-semibold">
                  {LOCATION_SHORT}
                </div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Salón de belleza premium en Miami, FL. Tu transformación comienza aquí.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-[var(--brand)] mb-4">Servicios</h4>
            <ul className="space-y-2">
              {FOOTER_SERVICES.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => onNavigate("#servicios")}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-[var(--brand)] mb-4">Contacto</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: ADDRESS },
                { icon: Phone, text: PHONE_DISPLAY },
                { icon: Clock, text: HOURS },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-white/55">
                  <Icon size={13} className="text-[var(--brand)] shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[var(--brand)] transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">© 2026 305 Hair Style. Miami, FL. Todos los derechos reservados.</p>
          <p className="text-white/20 text-xs italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Tu belleza, nuestra pasión
          </p>
        </div>
      </div>
    </footer>
  );
}
