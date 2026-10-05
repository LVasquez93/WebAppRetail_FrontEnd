import React from 'react';
import { Cliente } from '../types/catalogos.types';

interface ClientesTableProps {
  clientes: Cliente[];
  obtenerNombreSucursal: (id?: number) => string;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: number, nombre: string) => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
  obtenerNombreSucursal,
  onEditar,
  onEliminar,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[750px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b">
            <th className="p-3 w-12 text-center">#</th>
            <th className="p-3">Razón Social y Nombre Comercial</th>
            <th className="p-3">Contacto Principal</th>
            <th className="p-3">Teléfono / Correo</th>
            <th className="p-3">Sucursal Asignada</th>
            <th className="p-3 w-28 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                No se encontraron clientes registrados con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            clientes.map((c, i) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center text-gray-400 font-mono">{i + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-gray-800">{c.razonSocial}</div>
                  {c.nombreComercial && (
                    <div className="text-xs text-gray-500">{c.nombreComercial}</div>
                  )}
                  {c.direccion && (
                    <div className="text-[11px] text-gray-400 truncate max-w-xs">{c.direccion}</div>
                  )}
                </td>
                <td className="p-3 text-gray-700 font-medium">
                  {c.contactoPrincipal || '—'}
                </td>
                <td className="p-3">
                  <div className="text-gray-800">{c.telefono || '—'}</div>
                  <div className="text-xs text-gray-500">{c.correo || ''}</div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {obtenerNombreSucursal(c.sucursalId)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditar(c)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar cliente"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminar(c.id, c.razonSocial)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar cliente"
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
