import React from 'react';
import { Equipo } from '../types/catalogos.types';

interface EquiposTableProps {
  equipos: Equipo[];
  obtenerNombreSucursal: (id?: number) => string;
  onEditar: (equipo: Equipo) => void;
  onEliminar: (id: number, nombre: string) => void;
}

export const EquiposTable: React.FC<EquiposTableProps> = ({
  equipos,
  obtenerNombreSucursal,
  onEditar,
  onEliminar,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[850px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b">
            <th className="p-3 w-12 text-center">#</th>
            <th className="p-3">Descripción y Part Number</th>
            <th className="p-3">Características</th>
            <th className="p-3">Precio Ref.</th>
            <th className="p-3">Entrega</th>
            <th className="p-3">Sucursal Asignada</th>
            <th className="p-3 w-28 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
          {equipos.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                No se encontraron equipos o productos registrados con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            equipos.map((e, i) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center text-gray-400 font-mono">{i + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-gray-800">{e.descripcion}</div>
                  {e.partNumber && (
                    <div className="font-mono text-xs text-blue-700 font-semibold mt-0.5">
                      PN: {e.partNumber}
                    </div>
                  )}
                  {e.categoria && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                      {e.categoria}
                    </span>
                  )}
                </td>
                <td className="p-3 max-w-xs">
                  <div className="text-gray-600 whitespace-pre-line text-xs line-clamp-3">
                    {e.caracteristicas || '—'}
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-emerald-800">
                  ${(e.precioReferencial || 0).toFixed(2)}
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {e.tiempoEntregaPredeterminado || '—'}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {obtenerNombreSucursal(e.sucursalId)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditar(e)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar equipo"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminar(e.id, e.descripcion)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar equipo"
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
