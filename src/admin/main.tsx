import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import "../styles/index.css";
import { applyAccent, loadHairColor } from "../app/components/hero/hairColors";

// Misma paleta que eligió esta persona en la web (o el oro por defecto).
applyAccent(loadHairColor());

createRoot(document.getElementById("root")!).render(<AdminApp />);
