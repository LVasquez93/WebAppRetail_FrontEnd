# AGENT GUIDE & ARCHITECTURAL BLUEPRINT (FRONTEND)
> **Documento maestro para Agentes IA y Desarrolladores Senior**  
> Repositorio: `WebAppRetail_FrontEnd`  
> Este documento contiene la arquitectura completa, estado global, componentes desacoplados, control de acceso (RBAC), reglas financieras y directrices para extender la aplicación sin pérdida de contexto ni consumo excesivo de tokens.

---

## 1. Visión General del Dominio
El frontend de **WebAppRetail** es una Single Page Application (SPA) moderna, responsiva y de alta velocidad diseñada para la gestión comercial y cotizaciones de equipos en **El Salvador**. Proporciona:
1. **Emisión Reactiva de Cotizaciones**: Autocompletado inteligente de clientes y productos, cálculo instantáneo de impuestos (13% IVA), conversión legal de montos a letras y previsualización de PDF en tiempo real.
2. **Aislamiento Multi-Sucursal**: Cambio dinámico entre sucursales para perfiles autorizados (`ADMIN`, `GERENTE`) y bloqueo estricto de sucursal asignada para vendedores (`VENTAS`).
3. **Gestión de Catálogos e Importación por Lotes**: Tablas interactivas y asistentes para subir listas de clientes y equipos desde archivos CSV o copiando/pegando directamente desde Excel.
4. **Seguridad y Control de Acceso (RBAC)**: Enrutamiento protegido, persistencia de sesión por token JWT y adaptación dinámica de la interfaz según los roles del usuario.

---

## 2. Pila Tecnológica y Dependencias

| Tecnología | Versión | Propósito / Justificación |
| :--- | :--- | :--- |
| **React** | 18.3+ | Biblioteca de interfaz de usuario con hooks estándar. |
| **Vite** | 5.4+ | Bundler ultra-rápido configurado para desarrollo local y compilación estática para Cloudflare Pages. |
| **TypeScript** | 5.5+ (`strict`) | Tipado estático riguroso en toda la aplicación (sin uso de `any`). |
| **Tailwind CSS** | v4 (`@tailwindcss/vite`)| Motor de utilidades CSS moderno configurado en `src/index.css`. |
| **React Router DOM** | 6.x | Enrutamiento SPA con rutas protegidas (`ProtectedRoute.tsx`). |
| **React Hook Form** | 7.x | Manejo eficiente de formularios reactivos y listas dinámicas de ítems (`useFieldArray`). |
| **Axios** | 1.7+ | Cliente HTTP centralizado con interceptores automáticos de Bearer Token y auto-logout en 401. |
| **Lucide React** | 0.400+ | Biblioteca de iconografía vectorial limpia y consistente. |

---

## 3. Topología de Archivos (Feature-First Architecture)

El código sigue una estricta separación de responsabilidades (SOLID). Los componentes grandes fueron descompuestos en submódulos especializados menores a 350 líneas:

```text
src/
├── main.tsx                           # Bootstrap de React y montaje en DOM
├── App.tsx                            # Árbol de rutas y proveedores de contexto
├── index.css                          # Configuración de Tailwind CSS v4 (@import "tailwindcss";)
├── vite-env.d.ts                      # Tipado de variables de entorno de Vite (VITE_API_BASE_URL)
│
├── api/                               # Capa de comunicación HTTP
│   ├── axiosClient.ts                 # Instancia de Axios (modo dual: proxy local vs VITE_API_BASE_URL)
│   ├── authApi.ts                     # Login y datos del usuario actual (/me)
│   ├── empresasApi.ts                 # Gestión multi-empresa centralizada (SuperAdmin)
│   ├── sucursalesApi.ts               # Listado, creación, actualización y eliminación de sucursales
│   ├── catalogosApi.ts                # Clientes, Equipos y Usuarios (CRUD + lotes)
│   └── cotizacionesApi.ts             # Crear, listar, descargar y previsualizar PDF
│
├── context/                           # Estado global de la aplicación
│   ├── AuthContext.tsx                # Usuario activo (con empresaId y empresaNombre), token JWT, login, logout y RBAC
│   └── SucursalContext.tsx            # Sucursal activa seleccionada y aislamiento multi-empresa
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx         # Guardián de rutas por rol (requireAdmin, requireAdminOrGerente)
│   └── layout/
│       └── Navbar.tsx                 # Barra superior con enlaces dinámicos según rol
│
└── features/                          # Módulos de negocio desacoplados
    ├── dashboard/
    │   └── DashboardView.tsx          # Panel principal interactivo con tarjetas de acceso adaptadas por RBAC
    │
    ├── auth/
    │   └── LoginView.tsx              # Vista de autenticación y login con credenciales
    │
    ├── empresas/                      # Módulo Multi-Empresa (Exclusivo SuperAdmin)
    │   ├── EmpresasManagerView.tsx    # Listado, creación, edición, alternancia de estado y gestión de Gerentes
    │   └── types/empresas.types.ts
    │
    ├── sucursales/
    │   └── SucursalesView.tsx         # Gestión de sucursales, creación (+ Nueva), eliminación y membretes gráficos
    │
    ├── catalogos/
    │   ├── types/catalogos.types.ts
    │   ├── CatalogosManagerView.tsx   # Orquestador del módulo de catálogos (aislado por empresa para Gerentes)
    │   └── components/
    │       ├── ClientesTable.tsx      # Tabla especializada de clientes
    │       ├── EquiposTable.tsx       # Tabla especializada de equipos y precios
    │       ├── UsuariosTable.tsx      # Tabla de usuarios con roles y sucursal
    │       ├── CatalogoFormModal.tsx  # Modal reutilizable para altas/ediciones
    │       ├── BatchImportModal.tsx   # Modal de carga masiva CSV/Excel
    │       └── ConfirmDeleteModal.tsx # Diálogo de confirmación segura
    │
    └── cotizaciones/
        ├── types/cotizacion.types.ts
        ├── utils/
        │   ├── calculosFinancieros.ts # Fórmulas de línea, IVA 13% y total inversión
        │   └── numeroALetras.ts       # Algoritmo de conversión a letras (Dólares salvadoreños)
        └── components/
            ├── CotizacionForm.tsx     # Orquestador principal del formulario
            ├── ClienteCard.tsx        # Datos del cliente y dropdown con autocompletado
            ├── CotizacionMetadataCard.tsx # Fecha, emisor, condiciones y notas
            ├── ItemsTable.tsx         # Grilla dinámica editable y tarjeta de totales (#FFE3E7)
            ├── GuardarEquiposModal.tsx# Detección y guardado opcional de nuevos ítems a BD
            └── CotizacionesList.tsx   # Historial y descarga de PDFs emitidos
```

---

## 4. Gestión del Estado Global y Contextos

### 1. `AuthContext.tsx`
- **Responsabilidad**: Gestiona la autenticación con tokens JWT.
- **Almacenamiento**: `localStorage` bajo las claves `cotizador_token` y `cotizador_user`.
- **Datos expuestos**: `user` (`id`, `username`, `rol`, `sucursalId`, `empresaId`, `empresaNombre`, `nombreCompleto`), `token`, `isAdmin`, `isGerente`, `isAdminOrGerente`, `login()`, `logout()`.
- **Integración con Axios**: [axiosClient.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/api/axiosClient.ts) inyecta automáticamente el token en la cabecera `Authorization: Bearer <token>` de cada petición y redirige a `/login` en caso de respuesta `401 Unauthorized`.

### 2. `SucursalContext.tsx`
- **Responsabilidad**: Gestiona el contexto activo multi-tenant tanto a nivel de Empresa como de Sucursal.
- **Estado expuesto**: `empresas`, `empresaSeleccionada`, `setEmpresaSeleccionada`, `sucursales`, `sucursalActiva`, `setSucursalActiva`, `cargandoEmpresas`, `cargandoSucursales`.
- **Comportamiento por Rol**:
  - `ROLE_ADMIN`: **Super Administrador de la Plataforma SaaS (Global)**.
    - No pertenece a ninguna empresa fija.
    - Dispone de un selector interactivo de **Empresa** en el Navbar y en el Dashboard para alternar entre tenants en tiempo real.
    - Al cambiar de empresa, las sucursales se recargan dinámicamente y los catálogos/formularios se sincronizan con la organización activa.
  - `ROLE_GERENTE`: Dueño/Gerente de empresa. Su contexto queda fijado a `user.empresaId`. Puede ver y administrar todas las sucursales de su empresa y sus propios catálogos.
  - `ROLE_VENTAS`: **Bloqueado automáticamente**. Fija la `sucursalId` y `empresaId` asignadas a su cuenta.

---

## 5. Matriz de Control de Acceso en la Interfaz (RBAC) & Multi-Tenancy

| Módulo / Elemento UI | Ruta | `ROLE_ADMIN` (SaaS SuperAdmin) | `ROLE_GERENTE` | `ROLE_VENTAS` |
| :--- | :--- | :---: | :---: | :---: |
| **Dashboard Principal** | `/` | **Acceso Total** (Selector Tenant + Sucursal) | Acceso Total (Su Empresa) | Acceso Total (Su Sucursal) |
| **Selector de Empresa (Navbar)** | N/A | **Interactivo** (Todas las Empresas) | Oculto (Muestra Badge Empresa) | Oculto (Muestra Badge Empresa) |
| **Selector de Sucursal (Navbar)** | N/A | Interactivo (De la Empresa elegida) | Interactivo (De su Empresa) | **Bloqueado** (🔒 Sucursal Fija) |
| **Perfil / Editar Cuenta (Navbar)**| N/A | **Interactivo** (Modal Mi Perfil) | **Interactivo** (Modal Mi Perfil) | **Interactivo** (Modal Mi Perfil) |
| **Módulo Empresas** | `/empresas` | **Acceso Total** (CRUD + Gerentes) | **Bloqueado** (403) | **Bloqueado** (403) |
| **Nueva Cotización** | `/cotizaciones/nueva` | Cotiza en Empresa/Sucursal activa | Cotiza en su Empresa/Sucursal | Cotiza en su Sucursal fija |
| **Historial de Cotizaciones** | `/cotizaciones` | Filtros Cascada (Empresa -> Sucursal) + Columna Empresa | Filtrado en cascada restringido a su Empresa | Filtrado por su Empresa y Sucursal |
| **Módulo Catálogos** | `/catalogos` | Segregado por Empresa + Vista especial de Administradores SaaS | Segregado por su Empresa | **Bloqueado** (Redirige a `/`) |
| **Módulo Sucursales** | `/sucursales` | Gestiona sucursales de Empresa activa | Gestiona sus Sucursales | **Bloqueado** (Redirige a `/`) |

---

### Aislamiento de Sucursales y Edición de Administradores:
1. **Filtro en Cascada para Gerentes**: En `CotizacionesList.tsx` y `SucursalContext.tsx`, los usuarios con rol `ROLE_GERENTE` resuelven como empresa objetivo `user.empresaId`. Las sucursales disponibles en el filtro quedan estrictamente acotadas a las que pertenecen a su empresa (`s.empresaId === user.empresaId`), evitando mezcla con otras organizaciones.
2. **Edición y Gestión de Administradores Globales (SaaS)**:
   - **Desde Catálogos (`CatalogosManagerView.tsx`)**: Los administradores disponen de un selector de alcance en la pestaña *Usuarios* para alternar entre "Usuarios Empresa", "🛡️ Administradores Globales SaaS" (`soloAdmins=true`) y "Todos los Usuarios". Los administradores creados o editados mantienen alcance global (`empresaId = null`, `sucursalId = null`).
   - **Desde la Barra Superior (`Navbar.tsx`)**: Cualquier usuario autenticado (incluyendo el SuperAdmin) puede presionar el botón **"⚙️ Mi Perfil"** para actualizar su nombre completo, correo, cargo o cambiar su contraseña directamente.

---

## 6. Lógica de Negocio y Flujos Críticos

### 1. Cálculos Financieros Reactivos ([calculosFinancieros.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/cotizaciones/utils/calculosFinancieros.ts))
En cada pulsación de tecla sobre cantidad o precio unitario:
- `totalLinea = ROUND(cantidad * precioUnitario, 2)`.
- `subtotalSinIva = ROUND(SUM(totalLinea), 2)`.
- `montoIva = ROUND(subtotalSinIva * 0.13, 2)` *(Tasa IVA 13% El Salvador)*.
- `totalInversion = ROUND(subtotalSinIva + montoIva, 2)`.
- `totalEnLetras = numeroALetras(totalInversion)` *(ejemplo: `DOSCIENTOS DOLARES CON 08/100`)*.

### 2. Previsualización y Descarga de PDF sin Fugas de Memoria
- El botón **"Vista Previa PDF"** llama a `cotizacionesApi.previsualizarPdf(data)` obteniendo un `Blob`.
- Se genera un Object URL temporal (`URL.createObjectURL(blob)`) y se muestra en un modal interactivo con `<iframe>`.
- **Buenas prácticas senior**: Se aplica `setTimeout(() => window.URL.revokeObjectURL(url), 60000)` para liberar la memoria del navegador.

### 3. Asistente de Carga Masiva (CSV / Copiar-Pegar de Excel)
En [BatchImportModal.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/catalogos/components/BatchImportModal.tsx):
- Permite arrastrar un archivo `.csv` o pegar filas directamente desde una hoja de cálculo.
- Parsea y valida los registros en tiempo real en el navegador antes de enviar la petición.
- Realiza el envío en un único payload a `/api/v1/{clientes|equipos}/lote` asignando automáticamente la `sucursalId` activa.

---

## 7. Configuración de Entornos (Localhost vs. Cloudflare Pages)

El cliente HTTP ([axiosClient.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/api/axiosClient.ts)) opera en **modo dual inteligente**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```
- **En Desarrollo Local**: `VITE_API_BASE_URL` no está definido, por lo que `baseURL` es `/api/v1`. El proxy de [vite.config.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/vite.config.ts) reenvía las peticiones a `http://localhost:8080`.
- **En Producción (Cloudflare Pages)**: Se define `VITE_API_BASE_URL=https://webappretail-backend.onrender.com`. Axios llama directamente al backend por HTTPS con CORS.

### Enrutamiento SPA en Cloudflare Pages
El archivo [`public/_redirects`](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/public/_redirects) contiene:
```text
/*    /index.html   200
```
Esto asegura que cuando un usuario recargue en rutas anidadas como `/cotizaciones` o `/catalogos`, Cloudflare Pages responda con `index.html` en lugar de un error 404.

---

## 8. Directrices para Nuevos Módulos (Ej. Facturación / Inventario)

Para añadir un nuevo módulo al frontend:
1. **Crear carpeta en `src/features/{nuevo_modulo}/`**:
   - `types/{modulo}.types.ts`
   - `components/` (subcomponentes pequeños y especializados)
   - `views/{Modulo}View.tsx` (vista principal)
2. **Crear API correspondiente en `src/api/{modulo}Api.ts`**: Utilizar siempre la instancia `axiosClient`.
3. **Consumir Contextos Existentes**:
   - `const { sucursalActiva } = useSucursal();` para vincular automáticamente los registros a la sucursal actual.
   - `const { user } = useAuth();` para validar permisos.
4. **Registrar Rutas y Navegación**:
   - Agregar la ruta en `App.tsx` envuelta en `<ProtectedRoute allowedRoles={['ROLE_ADMIN', ...]}>`.
   - Agregar el enlace en `Navbar.tsx` con visibilidad condicional según el rol.
5. **Verificación de Calidad**: Ejecutar siempre `npm run build` antes de realizar commit para asegurar **cero errores de TypeScript**.
