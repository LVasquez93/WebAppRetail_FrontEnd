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
│   ├── rbacApi.ts                     # Matriz de roles y permisos dinámicos (/matriz, /reset, /mis-permisos)
│   ├── sucursalesApi.ts               # Listado, creación, actualización y eliminación de sucursales
│   ├── catalogosApi.ts                # Clientes, Equipos y Usuarios (CRUD + lotes)
│   └── cotizacionesApi.ts             # Crear, listar, descargar y previsualizar PDF
│
├── context/                           # Estado global de la aplicación
│   ├── AuthContext.tsx                # Usuario activo, token JWT, login, logout, roles 4-tier y permisos dinámicos (hasPermission)
│   └── SucursalContext.tsx            # Sucursal activa seleccionada y aislamiento multi-empresa
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx         # Guardián de rutas por rol (requireAdmin, requireAdminOrGerente)
│   └── layout/
│       ├── AppLayout.tsx              # Shell principal ERP: integra Sidebar, Header y ProfileModal
│       ├── Sidebar.tsx                # Barra lateral vertical ERP (colapsable, drawer en móviles, categorizada)
│       ├── Header.tsx                 # Barra superior limpia con selectores de contexto (Empresa y Sucursal)
│       └── ProfileModal.tsx           # Modal de autogestión de perfil y credenciales del usuario en sesión
│
└── features/                          # Módulos de negocio desacoplados
    ├── dashboard/
    │   └── DashboardView.tsx          # Panel principal interactivo con tarjetas de acceso adaptadas por RBAC
    │
    ├── auth/
    │   └── LoginView.tsx              # Vista de autenticación y login con credenciales
    │
    ├── rbac/                          # Módulo Roles y Permisos Dinámicos (RBAC)
    │   ├── RolesManagerView.tsx       # Doble vista: Permisos Especiales por Usuario y Matriz de Roles Base
    │   ├── components/
    │   │   └── UserPermissionsModal.tsx # Modal interactivo para otorgar/revocar permisos individuales por colaborador
    │   └── types/rbac.types.ts        # Interfaces RbacMatriz, RolPermisos, UsuarioPermisos, etc.
    │
    ├── empresas/                      # Módulo Multi-Empresa (Exclusivo SuperAdmin)
    │   ├── EmpresasManagerView.tsx    # Listado, creación, edición, alternancia de estado y gestión de Gerentes
    │   └── types/empresas.types.ts
    │
    ├── sucursales/
    │   └── SucursalesView.tsx         # Gestión de sucursales con permisos segregados (Gerente General vs Gerente Sede)
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
- **Responsabilidad**: Gestiona la autenticación con tokens JWT y las capacidades semánticas de alcance (Scope Policy).
- **Almacenamiento**: `localStorage` bajo las claves `cotizador_token` y `cotizador_user`.
- **Datos expuestos**: `user` (`id`, `username`, `rol`, `sucursalId`, `empresaId`, `empresaNombre`, `nombreCompleto`), `token`, `isAdmin`, `isGerenteGeneral`, `isGerenteSucursal`, `isVentas`, `canSelectEmpresa`, `canSelectSucursal`, `isBranchLocked`, `login()`, `logout()`.
- **Capacidades Semánticas de Alcance**:
  - `canSelectEmpresa = isAdmin`: Solo el SuperAdmin puede conmutar entre diferentes tenants/organizaciones.
  - `canSelectSucursal = isAdmin || isGerenteGeneral`: Solo el SuperAdmin o el Dueño/Gerente General de la empresa pueden alternar entre sedes o seleccionar "Todas".
  - `isBranchLocked = !canSelectSucursal && !!user?.sucursalId`: Activo para Gerentes de Sucursal y Vendedores; bloquea estrictamente la sede asignada impidiendo cualquier cambio de sucursal.
- **Integración con Axios**: [axiosClient.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/api/axiosClient.ts) inyecta automáticamente el token en la cabecera `Authorization: Bearer <token>` de cada petición y redirige a `/login` en caso de respuesta `401 Unauthorized`.

### 2. `SucursalContext.tsx`
- **Responsabilidad**: Gestiona el contexto activo multi-tenant tanto a nivel de Empresa como de Sucursal.
- **Estado expuesto**: `empresas`, `empresaSeleccionada`, `setEmpresaSeleccionada`, `sucursales`, `sucursalActiva`, `setSucursalActiva`, `cargandoEmpresas`, `cargandoSucursales`, `canSelectEmpresa`, `canSelectSucursal`, `isBranchLocked`.
- **Comportamiento por Rol**:
  - `ROLE_ADMIN`: **Super Administrador de la Plataforma SaaS (Global)**. Dispone de selector de Empresa y selector de Sucursal en tiempo real.
  - `ROLE_GERENTE_GENERAL`: Fijo a su empresa (`user.empresaId`), pero puede cambiar libremente entre cualquier sucursal de su empresa en el Header o en filtros.
  - `ROLE_GERENTE_SUCURSAL` y `ROLE_VENTAS`: **Bloqueo Estricto de Sede**. Su `sucursalActiva` se fuerza a `user.sucursalId`. Cualquier llamada a `setSucursalActiva` con otra sede es rechazada, y en el Header y filtros se despliega un badge 🔒 con su sede fija, sin menú desplegable.

---

## 5. Matriz de Control de Acceso en la Interfaz (RBAC) & Multi-Tenancy

| Módulo / Elemento UI | Ruta | `ROLE_ADMIN` (SaaS Root) | `ROLE_GERENTE_GENERAL` (Empresa) | `ROLE_GERENTE_SUCURSAL` (Sede) | `ROLE_VENTAS` (Operativo) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Dashboard Principal** | `/` | **Acceso Total** (Selector Tenant + Sede) | Acceso Total (Su Empresa) | Acceso Total (Su Sede) | Acceso Total (Su Sede) |
| **Selector de Empresa (Header)** | N/A | **Interactivo** (Todas las Empresas) | Oculto (Badge Empresa) | Oculto (Badge Empresa) | Oculto (Badge Empresa) |
| **Selector de Sucursal (Header)**| N/A | Interactivo (De la Empresa elegida) | Interactivo (De su Empresa) | **Bloqueado 🔒** (Su Sede fija) | **Bloqueado 🔒** (Su Sede fija) |
| **Perfil / Editar Cuenta** | Modal | Interactivo | Interactivo | Interactivo | Interactivo |
| **Módulo Empresas (SaaS)** | `/empresas` | **Acceso Total** (CRUD + Gerentes) | Bloqueado (403) | Bloqueado (403) | Bloqueado (403) |
| **Módulo Roles & Permisos (RBAC)**| `/roles` | **Matriz Interactiva** (Edición y Reset) | Vista / Bloqueado | Vista / Bloqueado | Bloqueado (403) |
| **Nueva Cotización** | `/cotizaciones/nueva` | Cotiza en Empresa/Sucursal activa | Cotiza en su Empresa/Sucursal | Cotiza en su Sede | Cotiza en su Sede |
| **Historial de Cotizaciones** | `/cotizaciones` | Filtros Cascada (Empresa -> Sede) | Filtro por sedes de su empresa | **Bloqueado 🔒** a su Sede | **Bloqueado 🔒** a su Sede |
| **Módulo Catálogos** | `/catalogos` | Segregado por Empresa + Admins SaaS | Segregado por su Empresa | Segregado por su Sede | Bloqueado (Redirige a `/`) |
| **Módulo Sucursales** | `/sucursales` | Crear, editar y eliminar sedes | Crear, editar y eliminar sedes | Solo editar su propia sede | Bloqueado (Redirige a `/`) |

---

### Aislamiento de Sucursales y Edición de Administradores:
1. **Gobernanza de Alcance por Rol (`AuthContext.tsx` & `TenantScopeFilter.tsx`)**:
   - **`ROLE_ADMIN` (SuperAdmin SaaS)**: `canSelectEmpresa = true`, `canSelectSucursal = true`, `isBranchLocked = false`. Dispone de selectores interactivos globales tanto para empresa como para sucursal.
   - **`ROLE_GERENTE_GENERAL` (Dueño de Empresa)**: `canSelectEmpresa = false` (empresa fijada a su organización con badge informativo), `canSelectSucursal = true`, `isBranchLocked = false`. Dispone de selector interactivo de sucursales acotado a todas las sedes de su empresa, permitiéndole cotizar, filtrar historiales y supervisar catálogos de cualquier sede.
   - **`ROLE_GERENTE_SUCURSAL` (Gerente de Sede)**: `canSelectEmpresa = false`, `canSelectSucursal = false`, `isBranchLocked = true`. Su contexto y filtros quedan estrictamente bloqueados con candado 🔒 a su sucursal asignada.
   - **`ROLE_VENTAS` (Vendedor)**: `canSelectEmpresa = false`, `canSelectSucursal = false`, `isBranchLocked = true`. Bloqueado estrictamente a su sucursal asignada.
2. **Aislamiento en Configuración de Sedes ([SucursalesView.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/sucursales/SucursalesView.tsx))**:
   - Para `ROLE_ADMIN` y `ROLE_GERENTE_GENERAL`: Visualizan pestañas con todas las sucursales de la empresa, pueden crear nuevas sedes (`➕ Nueva Sucursal`) y eliminar sedes existentes.
   - Para `ROLE_GERENTE_SUCURSAL`: Se ocultan las pestañas de otras sucursales (no tiene visibilidad de sedes ajenas), se ocultan los botones de crear y eliminar sucursales, y se despliega un panel exclusivo con su sede asignada.
3. **Edición y Gestión de Administradores Globales (SaaS)**:
   - **Desde Catálogos (`CatalogosManagerView.tsx`)**: Los administradores disponen de un selector de alcance en la pestaña *Usuarios* para alternar entre "Usuarios Empresa", "🛡️ Administradores Globales SaaS" (`soloAdmins=true`) y "Todos los Usuarios". Los administradores creados o editados mantienen alcance global (`empresaId = null`, `sucursalId = null`).
   - **Desde el Menú de Usuario / Perfil**: Cualquier usuario autenticado puede presionar el botón de perfil para actualizar su información personal y credenciales de forma segura.
4. **Permisos Granulares por Colaborador (Sobrescritura RBAC)**:
   - Permite a administradores otorgar facultades adicionales (ej. permitir que un vendedor o supervisor cree clientes, importe productos o registre usuarios ventas) o revocar permisos específicos a un usuario en particular, sin alterar la plantilla global del rol.
   - Accesible directamente desde:
     - La tabla de usuarios en Catálogos ([UsuariosTable.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/catalogos/components/UsuariosTable.tsx)) mediante el botón `🛡️`.
     - El módulo de RBAC ([RolesManagerView.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/rbac/RolesManagerView.tsx)) en la pestaña **👤 Permisos por Usuario**.
   - Gestionado mediante el componente [UserPermissionsModal.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/rbac/components/UserPermissionsModal.tsx) que discrimina visualmente: `[✨ Especial Otorgado]`, `[En rol base]` y `[🚫 Revocado]`, con opción de restablecer en un clic a los valores de fábrica del rol.
5. **Gobernanza y Filtrado Centralizado de Alcance (`TenantScopeFilter` & `useTenantScopeFilter`)**:
   - Resuelve de raíz el problema de duplicación de validaciones en cada vista u objeto.
   - Cualquier módulo nuevo (ej. Historial, Facturación, Inventario) simplemente importa:
     ```tsx
     const { scope, setScope } = useTenantScopeFilter();
     <TenantScopeFilter value={scope} onChange={setScope} />
     ```
   - El componente encapsula automáticamente todas las reglas de negocio: nunca muestra dropdowns a usuarios con sede fija (`isBranchLocked`), maneja la cascada de empresa a sucursal y sanitiza los IDs antes de enviarlos a las APIs.

---

## 6. Lógica de Negocio y Flujos Críticos

### 1. Cálculos Financieros Reactivos y Multi-Moneda ([calculosFinancieros.ts](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/cotizaciones/utils/calculosFinancieros.ts))
En cada pulsación de tecla sobre cantidad o precio unitario:
- `totalLinea = ROUND(cantidad * precioUnitario, 2)`.
- `subtotalSinIva = ROUND(SUM(totalLinea), 2)`.
- `tasaIva = (sucursalActiva?.porcentajeIva ?? 13) / 100`.
- `montoIva = ROUND(subtotalSinIva * tasaIva, 2)` *(Tasa IVA dinámica según sucursal: 13%, 12%, 15%, 0%)*.
- `totalInversion = ROUND(subtotalSinIva + montoIva, 2)`.
- Símbolo de moneda dinámico en tablas e inputs según `sucursalActiva?.monedaSimbolo` (default `$`).
- `totalEnLetras = numeroALetras(totalInversion, sucursalActiva?.monedaNombre || 'DOLARES')` *(ejemplo: `DOSCIENTOS DOLARES CON 08/100` o `DOSCIENTOS QUETZALES CON 08/100`)*.

### 2. Configuración Fiscal y Parámetros Comerciales por Sucursal ([SucursalesView.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/sucursales/SucursalesView.tsx))
Cada sede permite configurar de forma independiente:
- **Tasa de IVA**: Presets de un clic para El Salvador (13%), Guatemala (12%), Honduras/Nicaragua (15%) o Exento (0%).
- **Moneda y Símbolo**: Presets de un clic para Dólares (`$ USD`), Quetzales (`Q GTQ`), Lempiras (`L HNL`), Córdobas (`C$ NIO`), Colones (`₡ CRC`), Euros (`€ EUR`) y Pesos (`MX$ MXN`).
- **Parámetros Comerciales**: Días de validez de cotizaciones (default 15), tiempo de entrega predeterminado y cláusula de garantía para el documento emitido.
- **Toggle de IVA**: Opción para desglosar o consolidar el renglón de impuesto.

### 3. Previsualización y Descarga de PDF sin Fugas de Memoria
- El botón **"Vista Previa PDF"** llama a `cotizacionesApi.previsualizarPdf(data)` obteniendo un `Blob`.
- Se genera un Object URL temporal (`URL.createObjectURL(blob)`) y se muestra en un modal interactivo con `<iframe>`.
- **Buenas prácticas senior**: Se aplica `setTimeout(() => window.URL.revokeObjectURL(url), 60000)` para liberar la memoria del navegador.

### 4. Asistente de Carga Masiva (CSV / Copiar-Pegar de Excel)
En [BatchImportModal.tsx](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/catalogos/components/BatchImportModal.tsx):
- Permite arrastrar un archivo `.csv` o pegar filas directamente desde una hoja de cálculo.
- Parsea y valida los registros en tiempo real en el navegador antes de enviar la petición.
- Realiza el envío en un único payload a `/api/v1/{clientes|equipos}/lote` asignando automáticamente la `sucursalId` activa.

### 5. Paginación de Alto Rendimiento en Catálogos
Para garantizar un renderizado fluido y evitar cargar miles de filas en memoria:
- **API Client**: [`catalogosApi.ts`](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/api/catalogosApi.ts) implementa la interfaz genérica `PageResponse<T>` (`content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `first`, `last`).
- **Vista de Catálogos**: [`CatalogosManagerView.tsx`](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/catalogos/CatalogosManagerView.tsx) gestiona `page` y `pageSize` dinámicamente con selectores de tamaño (10, 15, 25, 50 registros por página), botones Anterior/Siguiente y etiquetas descriptivas *"Mostrando X a Y de Z registros"*.
- **Emisión de Cotizaciones**: [`CotizacionForm.tsx`](file:///c:/Users/luizi/OneDrive/Escritorio/WebAppRetail_FrontEnd/src/features/cotizaciones/components/CotizacionForm.tsx) precarga de forma acotada (`size = 100`) los registros más recientes evitando sobrecargar el DOM.

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
