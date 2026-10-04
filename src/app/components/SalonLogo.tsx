import logoLinesImg from "@/imports/logo-lines.png";

export default function SalonLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  // logo-lines.png es el mismo logo con el fondo blanco transparente. Se usa como
  // máscara y se pinta con el color de acento, así cambia con la paleta de pelo.
  return (
    <span
      role="img"
      aria-label="305 Hair Style logo"
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: Math.round(size * 0.645),
        backgroundColor: "var(--brand)",
        WebkitMaskImage: `url(${logoLinesImg})`,
        maskImage: `url(${logoLinesImg})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
