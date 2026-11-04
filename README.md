
  # Beauty Salon Website and App

  This is a code bundle for Beauty Salon Website and App. The original project is available at https://www.figma.com/design/YUlpaadij8DkGGoDBxEgMv/Beauty-Salon-Website-and-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Reservas (API de citas)

El formulario de reserva (`src/app/components/booking/BookingFlow.tsx`) usa la API de
[appointments-service](https://github.com/julioayalalopez89/appointments-service):

1. Servicio → 2. Día → 3. Hora libre (`GET /api/availability`) → 4. Datos → `POST /api/appointments`.

- Cliente de la API: `src/lib/api.ts` (tipos alineados con los DTOs y errores con mensajes en español:
  400 validación, 409 horario ocupado, 429, red).
- Horario y zona del salón: `src/lib/businessTime.ts` (`OPEN_WEEKDAYS` debe coincidir con
  `Business:OpeningHours` de la API).
- Servicios, precios, duraciones y horario: se editan en **/admin/ → Servicios / Horario** y la web
  los lee de `GET /api/catalog` (`src/lib/catalog.ts`). `src/data/services.ts` y `DEFAULT_SCHEDULE`
  (`src/lib/businessTime.ts`) solo son el respaldo mientras carga o si la API no responde.
- El horario del JSON-LD (SEO) sigue saliendo de `src/data/business.ts` porque se genera al compilar.

## Panel del salón (/admin/)

Pide la clave de administración de la API (`Security__AdminApiKey` en Azure). Tres secciones:

- **Agenda**: citas próximas, pasadas y canceladas; cancelar una cita.
- **Servicios**: nombre, categoría, precio, duración en la agenda, descripción, "Popular" y si se ve
  en la web. Orden con las flechas. La primera vez, "Importar los servicios de la web" copia la lista
  del código para no empezar de cero.
- **Horario**: días abiertos y horas de cada día, y días cerrados (festivos, vacaciones; con rango
  desde/hasta). Avisa si alguna cita próxima queda fuera del nuevo horario (no se cancela sola).

### Variable de entorno

| Variable | Qué es |
|---|---|
| `VITE_API_URL` | URL base de la API, sin `/` final |

Está en `.env.production` y `.env.development` (no es secreta). Para usar otra API en tu
máquina, copia `.env.example` a `.env.local` y cámbiala.

> ⚠️ `npm run dev` usa la API real: las reservas de prueba quedan en la base de datos.
