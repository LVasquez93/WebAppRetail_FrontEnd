# Cotizador Frontend (React + Vite + TypeScript)

Aplicación Web empresarial para la gestión, emisión y visualización de cotizaciones comerciales multi-sucursal. Desarrollada con React 18, Vite 5.4, TypeScript, Tailwind CSS v4, React Hook Form, Axios y React Router DOM 6.

---

## 🚀 Requisitos
- **Node.js 18+** o **Node.js 20+**
- **npm** (o yarn / pnpm)

---

## 🛠️ Ejecución en Desarrollo Local
Por defecto, la aplicación utiliza el proxy de Vite (`/api/v1`) hacia `http://localhost:8080`. No necesitas configurar ningún archivo `.env` para trabajar en local.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# (O ejecutar iniciar.bat en Windows)
```
La aplicación web se ejecutará en: **http://localhost:5173**

### Compilación para Producción
```bash
npm run build
```
Genera la carpeta `dist/` optimizada para despliegue estático, incluyendo la regla de reescritura SPA `_redirects` para Cloudflare Pages.

---

## 🌐 Variables de Entorno para Producción (Cloudflare Pages)

En Cloudflare Pages, configura en **Settings > Environment variables**:

| Variable | Descripción | Ejemplo en Producción |
| :--- | :--- | :--- |
| `NODE_VERSION` | Versión de Node.js utilizada para el build | `20` |
| `VITE_API_BASE_URL` | URL pública del Backend desplegado en Render (sin barra final) | `https://cotizador-backend.onrender.com` |

---

## 📂 Enrutamiento SPA en Cloudflare Pages
El proyecto incluye el archivo `public/_redirects` con la regla:
```text
/*    /index.html   200
```
Esto garantiza que al recargar la página en rutas dinámicas como `/cotizaciones` o `/catalogos`, Cloudflare Pages no devuelva error 404 y sirva la aplicación React correctamente.
