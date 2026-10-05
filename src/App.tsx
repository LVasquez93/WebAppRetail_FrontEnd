import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CotizacionForm } from './features/cotizaciones/components/CotizacionForm';
import { CotizacionesList } from './features/cotizaciones/components/CotizacionesList';
import { SucursalesView } from './features/sucursales/SucursalesView';
import { CatalogosManagerView } from './features/catalogos/CatalogosManagerView';
import { LoginView } from './features/auth/LoginView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SucursalProvider } from './context/SucursalContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SucursalProvider>
          <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <main className="flex-1 py-6 px-2 sm:py-8 sm:px-4">
              <Routes>
                <Route path="/login" element={<LoginView />} />
                <Route
                  path="/"
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
            </main>
          </div>
        </SucursalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
