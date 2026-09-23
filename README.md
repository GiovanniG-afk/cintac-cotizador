# Cotizador de Importaciones — Cintac

Prototipo funcional del cotizador interno de importación de productos
metalúrgicos descrito en el informe "Proyecto Integrado". Backend en
Node/Express + MongoDB, frontend en React/Vite, tipo de cambio real
desde la API oficial chilena [mindicador.cl](https://mindicador.cl) (Banco Central,
sin necesidad de API key).

## Qué implementa cada parte del informe

| Historia de usuario | Dónde está |
|---|---|
| HDU-01 Registrar cotización | `POST /api/cotizaciones` — página "Nueva cotización" |
| HDU-02 Cálculo automático | `POST /api/cotizaciones/:id/calcular` (usa `utils/calculoCosto.js` + `utils/tipoCambio.js`) |
| HDU-03 Comparar cotizaciones | `GET /api/cotizaciones/comparar` — página "Comparar" |
| HDU-04 Historial | `GET /api/cotizaciones` — página "Historial" |
| HDU-05 Exportar PDF | `utils/exportPdf.js` (jsPDF, en el frontend) |
| HDU-06 Perfiles y accesos | JWT + roles (`analista`, `jefe_abastecimiento`, `administrador`) — página "Usuarios" |

## 1. Requisitos previos

- Node.js 18 o superior
- Una cuenta gratuita de [MongoDB Atlas](https://www.mongodb.com/atlas) (igual que en pelu-xing)
- Una cuenta de [Vercel](https://vercel.com) para el despliegue

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` y completa `MONGODB_URI` con tu cadena de conexión de Atlas,
y `JWT_SECRET` con cualquier texto largo aleatorio.

```bash
npm run dev
```

El servidor queda en `http://localhost:4000`.

### Crear el primer usuario administrador

No hay una cuenta por defecto. Crea el primer usuario administrador con:

```bash
curl -X POST http://localhost:4000/api/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Tu Nombre","email":"tu@cintac.cl","password":"unaClaveSegura","rol":"administrador"}'
```

**Importante (seguridad):** el endpoint de registro deja elegir el rol libremente,
lo cual sirve para crear este primer administrador rápido, pero antes de usar el
sistema con datos reales conviene restringir `rol: "administrador"` para que solo
el propio administrador pueda asignarlo (por ejemplo, quitando el campo `rol` del
registro público y dejando que solo se asigne desde la pantalla de Usuarios).
Las contraseñas ya se guardan cifradas con bcrypt — a diferencia de lo que quedó
pendiente en pelu-xing.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con el usuario que creaste.

## 4. Desplegar en Vercel

**Backend:**
1. Sube la carpeta `backend/` como un proyecto nuevo en Vercel (puede ser un repo
   separado o un monorepo con "Root Directory" apuntando a `backend`).
2. En Vercel, agrega las variables de entorno `MONGODB_URI`, `JWT_SECRET` y
   `CORS_ORIGIN` (esta última con la URL final del frontend).

**Frontend:**
1. Sube la carpeta `frontend/` como otro proyecto en Vercel.
2. Agrega la variable de entorno `VITE_API_URL` apuntando a la URL del backend
   ya desplegado, seguida de `/api` (ej: `https://tu-backend.vercel.app/api`).

## 5. Sobre los datos de aranceles

Los porcentajes de arancel en `backend/utils/aranceles.js` son valores de
ejemplo para que el cálculo funcione en el prototipo. Para producción deben
actualizarse con el Arancel Aduanero vigente del Servicio Nacional de Aduanas,
considerando acuerdos comerciales por país de origen — esto quedó identificado
como pendiente de "actualización manual" en la priorización del informe (sección 2.4).
