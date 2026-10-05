import React from 'react';
import { ItemCotizacionInput } from '../types/cotizacion.types';

interface GuardarEquiposModalProps {
  isOpen: boolean;
  equiposNuevos: ItemCotizacionInput[];
  onCancelar: () => void;
  onSoloCotizar: () => void;
  onGuardarEnBdYCotizar: () => void;
}

export const GuardarEquiposModal: React.FC<GuardarEquiposModalProps> = ({
  isOpen,
  equiposNuevos,
  onCancelar,
  onSoloCotizar,
  onGuardarEnBdYCotizar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-lg shrink-0">
            ★
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Equipos Nuevos Detectados
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Se detectaron equipos en la cotización que aún no existen en el catálogo maestro de la base de datos:
            </p>
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          {equiposNuevos.map((it, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded border border-gray-200 text-xs">
              <p className="font-semibold text-gray-900">{it.descripcionEquipo}</p>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                {it.partNumber && (
                  <span className="font-mono bg-gray-100 px-1 rounded text-[11px] border border-gray-200">
                    PN: {it.partNumber}
                  </span>
                )}
                <span>Precio: ${Number(it.precioUnitario || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-700 font-medium">
          ¿Desea agregarlos al catálogo maestro de la base de datos para utilizarlos en futuras cotizaciones?
        </p>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onCancelar}
            className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSoloCotizar}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
          >
            Solo Crear Cotización
          </button>
          <button
            type="button"
            onClick={onGuardarEnBdYCotizar}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1F3D3D] hover:bg-[#152a2a] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
          >
            ✓ Guardar en BD y Crear Cotización
          </button>
        </div>
      </div>
    </div>
  );
};
