# 305 Hair Style — web

Sitio web del salón **305 Hair Style** (https://305hairstyle.com). React 18 + Vite 6 + Tailwind CSS 4.

## Requisitos

- Node.js 20 o superior (el CI usa Node 22)
- npm

## Cómo correrlo

```bash
npm ci            # instalar dependencias (usa package-lock.json)
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ localmente
```

Chequeos (los mismos que corre el CI):

```bash
npm run typecheck # TypeScript sin emitir archivos
npm run lint      # ESLint
```

## Estructura

- `src/main.tsx` — punto de entrada.
- `src/app/App.tsx` — la página (secciones del sitio).
- `src/app/components/ui/` — componentes de [shadcn/ui](https://ui.shadcn.com/) disponibles para usar.
- `src/styles/` — Tailwind, tema y fuentes.
- `public/images/` — fotos del salón.
- `@/` es un alias de `src/`.

## Variables de entorno

Por ahora el sitio no necesita ninguna. Cuando se conecte la API de citas
(appointments-service) se documentarán aquí (`VITE_*`, ver issue #3).
No subir archivos `.env` al repo.

## CI y deploy

- **CI** (`.github/workflows/ci.yml`): `npm ci` + `typecheck` + `lint` + `build` en cada PR y en cada push a `main`.
- **Deploy** (`.github/workflows/deploy.yml`): build y subida por FTP a Hostinger.
  - En cada PR publica una vista previa en `https://305hairstyle.com/preview/`.
  - En push a `main` despliega solo si la variable del repo `AUTO_DEPLOY` vale `true`; si no, hace un dry run.
  - También se puede lanzar a mano desde Actions → *Deploy to Hostinger* → *Run workflow*.
  - Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. Variable opcional: `FTP_SERVER_DIR`.

## Créditos

Ver [ATTRIBUTIONS.md](ATTRIBUTIONS.md) (shadcn/ui, Unsplash). El diseño inicial salió de Figma Make.
