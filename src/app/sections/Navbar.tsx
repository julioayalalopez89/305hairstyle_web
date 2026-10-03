import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import SalonLogo from "../components/SalonLogo";
import { NAV_LINKS } from "@/data/business";

type Props = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onNavigate: (href: string) => void;
};

export default function Navbar({ menuOpen, setMenuOpen, onNavigate }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
            <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--brand)] font-semibold -mt-1">
              Hair Style
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => onNavigate(l.href)}
              className="text-sm font-medium text-foreground/70 hover:text-[var(--brand)] transition-colors tracking-wide"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate("#contacto")}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-[var(--brand)] text-[var(--on-brand)] hover:bg-[var(--brand-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--brand)]/20"
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
              onClick={() => onNavigate(l.href)}
              className="text-left text-base font-medium py-2 text-foreground/80 hover:text-[var(--brand)] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate("#contacto")}
            className="mt-2 w-full py-3 text-sm font-semibold rounded-full bg-[var(--brand)] text-[var(--on-brand)]"
          >
            Reservar turno
          </button>
        </div>
      </div>
    </header>
  );
}
