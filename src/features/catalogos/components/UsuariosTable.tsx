import React from 'react';
import { Usuario } from '../types/catalogos.types';

interface UsuariosTableProps {
  usuarios: Usuario[];
  obtenerNombreSucursal: (id?: number) => string;
  onEditar: (usuario: Usuario) => void;
  onEliminar: (id: number, nombre: string) => void;
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  obtenerNombreSucursal,
  onEditar,
  onEliminar,
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
                <td className="p-3 font-mono font-bold text-blue-800">
                  {u.username}
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
                      : u.rol === 'ROLE_GERENTE'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.rol === 'ROLE_ADMIN' ? '🛡️ ADMIN (SaaS)' : u.rol === 'ROLE_GERENTE' ? '👔 GERENTE' : '💼 VENTAS'}
                  </span>
                </td>
                <td className="p-3">
                  {u.rol === 'ROLE_ADMIN' || !u.sucursalId ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                      🛡️ Global (SaaS)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      {obtenerNombreSucursal(u.sucursalId)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
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
