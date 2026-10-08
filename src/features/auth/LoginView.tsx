import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    try {
      setCargando(true);
      setError(null);
      await login({ username: username.trim().toUpperCase(), password: password.trim() });
      const destino = (location.state as any)?.from?.pathname || '/';
      navigate(destino, { replace: true });
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      const msg = err.response?.data?.message || 'Usuario o contraseña incorrectos. Verifica tus credenciales.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Encabezado con marca */}
        <div className="bg-gradient-to-r from-[#1F3D3D] to-[#2a5252] text-white p-8 text-center relative">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3 border border-white/20 shadow-inner">
            🔐
          </div>
          <h1 className="text-2xl font-black tracking-wide">Retail El Salvador</h1>
          <p className="text-xs text-[#C88D4B] font-semibold uppercase tracking-wider mt-1">
            Sistema de Cotizaciones
          </p>
          <h6 className="font-black tracking-wide">V 1.0 </h6>

        </div>

        {/* Formulario */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  👤
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  placeholder="Digita tu usuario o correo electrónico"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1F3D3D] focus:border-transparent uppercase tracking-wider font-semibold text-gray-800 transition-all placeholder:normal-case placeholder:font-normal"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  🔑
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1F3D3D] focus:border-transparent text-gray-800 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 bg-[#1F3D3D] hover:bg-[#2a5252] text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Iniciando Sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Accesos Rápidos para Prueba / Demostración */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
              Cuentas de Acceso Rápido para Pruebas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('LVASQUEZ', 'gerente123')}
                className="p-2 text-left bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-indigo-900">👔 Jefe Operaciones</div>
                <div className="text-[10px] text-indigo-700">LVASQUEZ / gerente123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('VENTASSV001', 'ventas123')}
                className="p-2 text-left bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-900">💼 Ventas01</div>
                <div className="text-[10px] text-emerald-700">VENTASSV001 / ventas123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
