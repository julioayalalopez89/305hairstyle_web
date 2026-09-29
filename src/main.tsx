
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { applyAccent, loadHairColor } from "./app/components/hero/hairColors";

  // Color elegido por la visitante en otra visita (o el oro por defecto), antes de pintar.
  applyAccent(loadHairColor());

  createRoot(document.getElementById("root")!).render(<App />);
  