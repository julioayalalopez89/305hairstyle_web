import { ChevronRight, Facebook, Instagram, MessageCircle } from "lucide-react";
import BookingFlow from "../components/booking/BookingFlow";
import { ADDRESS, FACEBOOK_URL, INSTAGRAM_URL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data/business";
import { SERVICES } from "@/data/services";

type Props = {
  /** Servicio elegido con "Reservar este servicio"; `n` cambia en cada clic. */
  preselect: { name: string; n: number } | null;
};

export default function Contact({ preselect }: Props) {
  return (
    <section id="contacto" className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--brand)] mb-4 block">Agenda tu visita</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Reserva tu turno hoy
          </h2>
          <p className="text-foreground/60 leading-relaxed mb-8">
            Elige servicio, día y hora: tu cita queda reservada al momento. Si prefieres, también puedes escribirnos por WhatsApp.
          </p>

          <div className="space-y-5">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border hover:border-[var(--brand)]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">WhatsApp</div>
                <div className="text-xs text-foreground/55">{PHONE_DISPLAY}</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[var(--brand)] transition-colors" />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border hover:border-[var(--brand)]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
              >
                <Instagram size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">Instagram</div>
                <div className="text-xs text-foreground/55">@305hairstyle</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[var(--brand)] transition-colors" />
            </a>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border hover:border-[var(--brand)]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shrink-0">
                <Facebook size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">Facebook</div>
                <div className="text-xs text-foreground/55">305 Hair Style Miami</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[var(--brand)] transition-colors" />
            </a>
          </div>
        </div>

        {/* Reserva en línea (API de citas) */}
        <div id="reservar" className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
          <BookingFlow
            services={SERVICES.flatMap((cat) => cat.items.map((i) => ({ ...i, category: cat.category })))}
            preselect={preselect}
            address={ADDRESS}
            whatsappUrl={WHATSAPP_URL}
          />
        </div>
      </div>
    </section>
  );
}
