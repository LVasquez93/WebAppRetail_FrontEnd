import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi } from '../../api/catalogosApi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, recargarSesion } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombreCompleto || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [cargo, setCargo] = useState(user?.cargo || '');
  const [password, setPassword] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Sincronizar datos al abrir
  React.useEffect(() => {
    if (user && isOpen) {
      setNombreCompleto(user.nombreCompleto || '');
      setCorreo(user.correo || '');
      setCargo(user.cargo || '');
      setPassword('');
      setMensajeExito(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setGuardando(true);
      const payload: any = {
        username: user.username,
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim() || null,
        cargo: cargo.trim() || null,
        rol: user.rol,
        empresaId: user.empresaId,
        sucursalId: user.sucursalId,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      await usuariosApi.actualizar(user.id, payload);
      await recargarSesion();
      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      alert('Error al actualizar perfil: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
    } finally {
      setGuardando(false);
    }
  };

  const getRoleBadge = (rol?: string) => {
    if (rol === 'ROLE_ADMIN' || rol === 'ADMIN') {
      return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] px-2 py-0.5 rounded-full font-bold">🛡️ Administrador Global SaaS</span>;
    }
    if (rol === 'ROLE_GERENTE' || rol === 'GERENTE') {
      return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-[11px] px-2 py-0.5 rounded-full font-bold">👔 Gerente de Organización</span>;
    }
    return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-bold">💼 Ejecutivo de Ventas</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn text-gray-800">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="bg-[#1F3D3D] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-base sm:text-lg">Mi Perfil y Credenciales</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {mensajeExito && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="text-base">✅</span>
              <span>¡Perfil y credenciales actualizados exitosamente!</span>
            </div>
          )}

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[11px] text-gray-500 font-bold block uppercase tracking-wider">Identificador / Usuario</span>
                <span className="font-mono font-bold text-sm text-[#1F3D3D]">{user?.username}</span>
              </div>
              <div>{getRoleBadge(user?.rol)}</div>
            </div>
            {user?.empresaNombre && (
              <div className="text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-200/60">
                🏢 Empresa: <strong className="text-gray-700">{user.empresaNombre}</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej: Lic. Mauricio Morales"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cargo / Puesto</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej: Gerente Comercial"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nueva Contraseña (dejar en blanco para conservar actual)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Opcional)"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Solo llena este campo si deseas cambiar tu clave de acceso.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
