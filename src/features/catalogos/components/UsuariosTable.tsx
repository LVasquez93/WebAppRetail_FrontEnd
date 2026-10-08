import React from 'react';
import { Usuario } from '../types/catalogos.types';

interface UsuariosTableProps {
  usuarios: Usuario[];
  obtenerNombreSucursal: (id?: number) => string;
  onEditar: (usuario: Usuario) => void;
  onEliminar: (id: number, nombre: string) => void;
  onGestionarPermisos?: (usuario: Usuario) => void;
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  obtenerNombreSucursal,
  onEditar,
  onEliminar,
  onGestionarPermisos,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b">
            <th className="p-3 w-12 text-center">#</th>
            <th className="p-3">Usuario (Código)</th>
            <th className="p-3">Nombre Completo</th>
            <th className="p-3">Cargo</th>
            <th className="p-3">Correo Electrónico</th>
            <th className="p-3">Rol</th>
            <th className="p-3">Sucursal Asignada</th>
            <th className="p-3 w-28 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                No se encontraron usuarios emisores registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((u, i) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center text-gray-400 font-mono">{i + 1}</td>
                <td className="p-3 font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-blue-800">{u.username}</span>
                    {u.tienePermisosPersonalizados && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                        title="Posee permisos especiales personalizados"
                      >
                        ✨ Especial
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-semibold text-gray-800">
                  {u.nombreCompleto}
                </td>
                <td className="p-3 text-gray-600">
                  {u.cargo || '—'}
                </td>
                <td className="p-3 text-gray-600">
                  {u.correo || '—'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    u.rol === 'ROLE_ADMIN'
                      ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                      : u.rol === 'ROLE_GERENTE_GENERAL'
                      ? 'bg-teal-100 text-[#1F3D3D] border-teal-300 font-bold'
                      : u.rol === 'ROLE_GERENTE_SUCURSAL' || u.rol === 'ROLE_GERENTE'
                      ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {u.rol === 'ROLE_ADMIN'
                      ? '🛡️ ADMIN (SaaS)'
                      : u.rol === 'ROLE_GERENTE_GENERAL'
                      ? '👑 GTE. GENERAL'
                      : u.rol === 'ROLE_GERENTE_SUCURSAL' || u.rol === 'ROLE_GERENTE'
                      ? '🏬 GTE. SUCURSAL'
                      : '💼 VENTAS'}
                  </span>
                </td>
                <td className="p-3">
                  {u.rol === 'ROLE_ADMIN' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                      🛡️ Global (SaaS)
                    </span>
                  ) : u.rol === 'ROLE_GERENTE_GENERAL' || !u.sucursalId ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#1F3D3D] border border-teal-200">
                      🏢 Toda la Empresa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {obtenerNombreSucursal(u.sucursalId)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {onGestionarPermisos && (
                      <button
                        type="button"
                        onClick={() => onGestionarPermisos(u)}
                        className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                        title="Gestionar permisos específicos del usuario"
                      >
                        🛡️
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditar(u)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminar(u.id, u.nombreCompleto || u.username)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar usuario"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
