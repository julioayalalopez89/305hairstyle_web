import { useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import QuickStats from "./sections/QuickStats";
import Services from "./sections/Services";
import Gallery from "./sections/Gallery";
import About from "./sections/About";
import Testimonials from "./sections/Testimonials";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

// Página única del salón. Cada sección vive en ./sections y los datos en src/data.
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Servicio elegido con "Reservar este servicio"; n cambia en cada clic para reaccionar aunque sea el mismo.
  const [bookingPreselect, setBookingPreselect] = useState<{ name: string; n: number } | null>(null);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bookService = (name: string) => {
    setBookingPreselect((p) => ({ name, n: (p?.n ?? 0) + 1 }));
    scrollTo("#contacto");
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Jost', sans-serif" }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={scrollTo} />
      <Hero onNavigate={scrollTo} />
      <QuickStats />
      <Services onBook={bookService} onNavigate={scrollTo} />
      <Gallery />
      <About />
      <Testimonials />
      <Contact preselect={bookingPreselect} />
      <Footer onNavigate={scrollTo} />
    </div>
  );
}
