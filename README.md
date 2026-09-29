
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
- Duración de cada servicio: `durationMinutes` en `SERVICES` (`src/app/App.tsx`).

### Variable de entorno

| Variable | Qué es |
|---|---|
| `VITE_API_URL` | URL base de la API, sin `/` final |

Está en `.env.production` y `.env.development` (no es secreta). Para usar otra API en tu
máquina, copia `.env.example` a `.env.local` y cámbiala.

> ⚠️ `npm run dev` usa la API real: las reservas de prueba quedan en la base de datos.
