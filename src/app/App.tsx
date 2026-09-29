import { useState, useEffect, useRef } from "react";
import { Menu, X, Star, Phone, MapPin, Clock, ChevronRight, Instagram, Facebook, MessageCircle } from "lucide-react";
import logoImg from "@/imports/Screenshot_2026-06-23_211525.png";

// Datos del negocio (una sola fuente para hero, "Nosotros", contacto y footer).
const LOCATION_SHORT = "Novus Salon Suites, Miami, FL";
const ADDRESS = "8631 Coral Wy, Miami, FL 33155";
const MAPS_URL = "https://maps.app.goo.gl/Twibn3iCQszrQgE4A";
const HOURS = "Sáb–Lun: 9am – 7pm";
const PHONE_DISPLAY = "(786) 566-9938";
const WHATSAPP_URL = "https://wa.me/17865669938";
const INSTAGRAM_URL = "https://www.instagram.com/305hairstyle/";

const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const SERVICES = [
  {
    category: "Cabello",
    items: [
      { name: "Corte + Peinado", price: "$55", desc: "Corte personalizado y blow-out profesional", popular: true },
      { name: "Coloración Completa", price: "$180+", desc: "Tinte de alta gama, sin amoníaco disponible", popular: false },
      { name: "Balayage / Highlights", price: "$120+", desc: "Técnica francesa con degradado natural", popular: true },
      { name: "Alisado Brasileño", price: "$180+", desc: "Keratina profesional, dura hasta 4 meses", popular: false },
    ],
  },
  {
    category: "Tratamientos",
    items: [
      { name: "Hidratación Profunda", price: "$35", desc: "Máscara nutritiva + vapor para pelo dañado", popular: false },
      { name: "Botox Capilar", price: "$180+", desc: "Reparación profunda, brillo y control del frizz.", popular: true },
      { name: "Keratina", price: "$180+", desc: "Alisado profesional con efecto suave y duradero.", popular: false },
    ],
  },
];

// Fotos reales del salón (public/images). Optimizarlas (WebP/tamaños) es parte de #8/#9.
const GALLERY_PHOTOS = [
  { url: "/images/studio-1.png", alt: "Cliente recibiendo tratamiento capilar en el salón" },
  { url: "/images/studio-2.jpeg", alt: "Interior elegante del salón 305 Hair Style" },
  { url: "/images/studio-3.jpeg", alt: "Estilista profesional usando secador de pelo" },
  { url: "/images/studio-4.jpeg", alt: "Resultado de coloración rubio dorado" },
  { url: "/images/studio-5.png", alt: "Herramientas profesionales de peluquería" },
];

const TESTIMONIALS = [
  {
    name: "Valentina R.",
    rating: 5,
    text: "¡El mejor salón de Miami! Llevo 3 años viniendo para mis highlights y siempre salgo encantada. María es increíble.",
    service: "Balayage",
    avatar: "VR",
  },
  {
    name: "Camila M.",
    rating: 5,
    text: "El alisado brasileño me duró más de 4 meses. El ambiente es súper relajante y el equipo muy profesional.",
    service: "Alisado Brasileño",
    avatar: "CM",
  },
  {
    name: "Sofía L.",
    rating: 5,
    text: "Vine con el cabello muy dañado y salí con un pelo completamente diferente. El tratamiento Olaplex es mágico.",
    service: "Olaplex Treatment",
    avatar: "SL",
  },
  {
    name: "Diana P.",
    rating: 5,
    text: "Precios súper justos para la calidad del servicio. En Brickell no encuentras nada así. Mi salón favorito!",
    service: "Corte + Peinado",
    avatar: "DP",
  },
];

function SalonLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoImg}
      alt="305 Hair Style logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-[#B08D57] text-[#B08D57]" />
      ))}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [formData, setFormData] = useState({ name: "", phone: "", service: "", date: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", phone: "", service: "", date: "", message: "" });
  };

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Jost', sans-serif" }}>

      {/* ── NAV ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2.5 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <SalonLogo size={38} />
            <div className="leading-tight">
              <div className="text-base font-bold tracking-widest text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.15em" }}>
                305
              </div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#1E1A14] font-semibold -mt-1">
                Hair Style
              </div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm font-medium text-foreground/70 hover:text-[#1E1A14] transition-colors tracking-wide"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#contacto")}
              className="px-5 py-2 text-sm font-semibold rounded-none bg-[#1E1A14] text-white hover:bg-[#000000] transition-all duration-200 hover:shadow-lg hover:shadow-[#1E1A14]/20"
            >
              Reservar
            </button>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-80" : "max-h-0"}`}
        >
          <div className="bg-background/98 backdrop-blur-md border-t border-border px-5 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-left text-base font-medium py-2 text-foreground/80 hover:text-[#1E1A14] transition-colors"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#contacto")}
              className="mt-2 w-full py-3 text-sm font-semibold rounded-none bg-[#1E1A14] text-white"
            >
              Reservar turno
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "#FFFFFF" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] hidden"
          style={{ background: "radial-gradient(circle, #1E1A14 0%, transparent 70%)", transform: "translate(30%, -20%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] hidden"
          style={{ background: "radial-gradient(circle, #B08D57 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="max-w-6xl mx-auto px-5 pt-24 pb-16 w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-white/60 border border-border mb-6 backdrop-blur-sm">
              <MapPin size={12} className="text-[#1E1A14]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#1E1A14]">
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  {LOCATION_SHORT}
                </a>
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] mb-6 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Tu belleza,{" "}
              <em className="not-italic text-[#1E1A14]">nuestra</em>
              <br />
              pasión
            </h1>

            <p className="text-lg text-foreground/65 mb-8 max-w-md leading-relaxed font-light">
              Salón de belleza de lujo en el corazón de Miami. Especialistas en color, corte y tratamientos capilares de alta gama.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => scrollTo("#contacto")}
                className="px-7 py-3.5 rounded-none bg-[#1E1A14] text-white font-semibold text-base hover:bg-[#000000] transition-all duration-200 hover:shadow-xl hover:shadow-[#1E1A14]/25 active:scale-95"
              >
                Reservar turno
              </button>
              <button
                onClick={() => scrollTo("#servicios")}
                className="px-7 py-3.5 rounded-none border-2 border-[#1E1A14] text-[#1E1A14] font-semibold text-base hover:bg-secondary transition-all duration-200"
              >
                Ver servicios
              </button>
            </div>

            {/* Quick service pills */}
            <div className="flex flex-wrap gap-2">
              {["Corte + Peinado · $55", "Coloración · $180+", "Balayage · $120+"].map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-white/70 border border-border text-xs font-semibold text-foreground/70 backdrop-blur-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right logo/visual */}
          <div className="order-1 md:order-2 flex justify-center items-center">
            <div className="relative">
              <div
                className="w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center"
                style={{ background: "radial-gradient(circle at 40% 40%, #F4F1EB 0%, #FFFFFF 60%, #F4F1EB 100%)" }}
              >
                <img
                  src={logoImg}
                  alt="305 Hair Style — Miami Hair Salon logo with woman silhouette, palm tree, and city skyline"
                  className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-sm"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 bg-white rounded-sm px-4 py-3 shadow-lg border border-border">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <StarRating count={5} />
                </div>
                <div className="text-xs font-bold text-foreground">+200 clientas felices</div>
              </div>
              <div className="absolute -top-3 -left-3 bg-[#1E1A14] text-white rounded-sm px-3 py-2 shadow-lg">
                <div className="text-[10px] font-bold uppercase tracking-wider">Miami</div>
                <div className="text-xs font-semibold">Desde 2023</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/40">
          <span className="text-[10px] uppercase tracking-widest font-semibold">Explorar</span>
          <div className="w-px h-8 bg-current animate-pulse" />
        </div>
      </section>

      {/* ── QUICK STATS ── */}
      <section className="bg-[#1E1A14] text-white py-12">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "+200", label: "Clientas satisfechas" },
            { value: "6+", label: "Años de experiencia" },
            { value: "15+", label: "Servicios disponibles" },
            { value: "5★", label: "Calificación promedio" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {stat.value}
              </div>
              <div className="text-sm text-white/70 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="servicios" className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1E1A14] mb-3 block">Lo que ofrecemos</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
                className={`px-6 py-2.5 rounded-none text-sm font-semibold transition-all duration-200 ${
                  activeService === i
                    ? "bg-[#1E1A14] text-white shadow-lg shadow-[#1E1A14]/20"
                    : "bg-secondary text-foreground/70 hover:text-foreground"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICES[activeService].items.map((item) => (
              <div
                key={item.name}
                className="group relative bg-card rounded-sm p-6 border border-border hover:border-[#1E1A14]/30 hover:shadow-lg hover:shadow-[#1E1A14]/5 transition-all duration-300 cursor-pointer"
              >
                {item.popular && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold text-[#1E1A14] bg-secondary px-2 py-0.5 rounded-none">
                    Popular
                  </span>
                )}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {item.name}
                  </h3>
                  <span className="text-xl font-bold text-[#1E1A14] shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {item.price}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[#1E1A14] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Reservar este servicio</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => scrollTo("#contacto")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-none bg-[#1E1A14] text-white font-semibold hover:bg-[#000000] transition-all duration-200 hover:shadow-lg hover:shadow-[#1E1A14]/25"
            >
              Reservar un turno
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="galeria" className="py-24" style={{ background: "#FAF8F5" }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1E1A14] mb-3 block">Nuestro trabajo</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
                className={`relative overflow-hidden rounded-sm bg-secondary ${
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E1A14] hover:underline underline-offset-4"
            >
              <Instagram size={16} />
              Ver más en @305hairstyle
            </a>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="nosotros" className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-sm overflow-hidden bg-secondary aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1629397685944-7073f5589754?w=600&h=750&fit=crop&auto=format"
                alt="El equipo de 305 Hair Style en Miami"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#1E1A14] text-white rounded-sm p-5 shadow-xl max-w-[160px]">
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>3+</div>
              <div className="text-xs font-semibold opacity-90">Años transformando looks en Miami</div>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1E1A14] mb-4 block">Nuestra historia</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Más que cabello, transformamos la <em className="not-italic text-[#1E1A14]">confianza</em> de cada mujer
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
                    <Icon size={14} className="text-[#1E1A14]" />
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24" style={{ background: "#F4F1EB" }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1E1A14] mb-3 block">Reseñas</span>
            <h2 className="text-4xl md:text-5xl font-normal" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Lo que dicen nuestras clientas
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-sm p-6 shadow-sm border border-white">
                <StarRating count={t.rating} />
                <p className="mt-4 mb-5 text-foreground/75 leading-relaxed text-sm italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1E1A14] flex items-center justify-center text-white text-xs font-bold shrink-0">
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

      {/* ── BOOKING ── */}
      <section id="contacto" className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1E1A14] mb-4 block">Agenda tu visita</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-5 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Reserva tu turno hoy
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8">
              Completa el formulario y te contactaremos en menos de 24 horas para confirmar tu cita. También puedes escribirnos por WhatsApp.
            </p>

            <div className="space-y-5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-sm bg-muted border border-border hover:border-[#1E1A14]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">WhatsApp</div>
                  <div className="text-xs text-foreground/55">{PHONE_DISPLAY}</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[#1E1A14] transition-colors" />
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-sm bg-muted border border-border hover:border-[#1E1A14]/30 transition-all group"
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
                <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[#1E1A14] transition-colors" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-sm bg-muted border border-border hover:border-[#1E1A14]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center shrink-0">
                  <Facebook size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">Facebook</div>
                  <div className="text-xs text-foreground/55">305 Hair Style Miami</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-foreground/30 group-hover:text-[#1E1A14] transition-colors" />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-sm p-8 border border-border shadow-sm">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#1E1A14]/10 flex items-center justify-center mx-auto mb-4">
                  <Star size={28} className="text-[#1E1A14]" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  ¡Gracias!
                </h3>
                <p className="text-foreground/60 text-sm">
                  Recibimos tu solicitud. Te contactaremos pronto para confirmar tu turno.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[#1E1A14] focus:outline-none text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(305) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[#1E1A14] focus:outline-none text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                    Servicio deseado
                  </label>
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[#1E1A14] focus:outline-none text-sm transition-colors appearance-none"
                  >
                    <option value="">Seleccionar servicio...</option>
                    {SERVICES.flatMap((cat) => cat.items).map((s) => (
                      <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                    Fecha preferida
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[#1E1A14] focus:outline-none text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cuéntanos más sobre lo que deseas..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-[#1E1A14] focus:outline-none text-sm transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1E1A14] text-white font-semibold hover:bg-[#000000] transition-all duration-200 hover:shadow-lg hover:shadow-[#1E1A14]/25 active:scale-[0.98]"
                >
                  Solicitar turno
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1E1A14] text-white py-14">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <SalonLogo size={34} className="brightness-[10] invert opacity-80" />
                <div>
                  <div className="text-base font-bold tracking-[0.2em]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    305 HAIR STYLE
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.25em] text-[#B08D57] font-semibold">
                    {LOCATION_SHORT}
                  </div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Salón de belleza premium en Miami, FL. Tu transformación comienza aquí.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#B08D57] mb-4">Servicios</h4>
              <ul className="space-y-2">
                {["Corte + Peinado", "Coloración", "Balayage", "Alisado Brasileño", "Tratamientos"].map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => scrollTo("#servicios")}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#B08D57] mb-4">Contacto</h4>
              <ul className="space-y-3">
                {[
                  { icon: MapPin, text: ADDRESS },
                  { icon: Phone, text: PHONE_DISPLAY },
                  { icon: Clock, text: HOURS },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-white/55">
                    <Icon size={13} className="text-[#B08D57] shrink-0" />
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
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#1E1A14] transition-colors"
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
    </div>
  );
}
