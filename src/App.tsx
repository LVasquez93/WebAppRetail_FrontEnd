import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CotizacionForm } from './features/cotizaciones/components/CotizacionForm';
import { CotizacionesList } from './features/cotizaciones/components/CotizacionesList';
import { DashboardView } from './features/dashboard/DashboardView';
import { SucursalesView } from './features/sucursales/SucursalesView';
import { CatalogosManagerView } from './features/catalogos/CatalogosManagerView';
import { EmpresasManagerView } from './features/empresas/EmpresasManagerView';
import { RolesManagerView } from './features/rbac/RolesManagerView';
import { LoginView } from './features/auth/LoginView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SucursalProvider } from './context/SucursalContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SucursalProvider>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<LoginView />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cotizaciones/nueva"
                  element={
                    <ProtectedRoute>
                      <CotizacionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cotizaciones"
                  element={
                    <ProtectedRoute>
                      <CotizacionesList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/empresas"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <EmpresasManagerView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <RolesManagerView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/catalogos"
                  element={
                    <ProtectedRoute requireAdminOrGerente={true}>
                      <CatalogosManagerView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sucursales"
                  element={
                    <ProtectedRoute requireAdminOrGerente={true}>
                      <SucursalesView />
                    </ProtectedRoute>
                  }
                />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </SucursalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
