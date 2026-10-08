import React from 'react';
import { UseFormRegister, FieldArrayWithId, UseFormSetValue } from 'react-hook-form';
import { CotizacionFormData } from '../types/cotizacion.types';
import { Equipo } from '../../catalogos/types/catalogos.types';

interface ItemsTableProps {
  fields: FieldArrayWithId<CotizacionFormData, "items", "id">[];
  register: UseFormRegister<CotizacionFormData>;
  setValue: UseFormSetValue<CotizacionFormData>;
  append: (value: any) => void;
  remove: (index: number) => void;
  watchItems: any[];
  equiposCatalogo: Equipo[];
  equiposFiltrados: { [itemIndex: number]: Equipo[] };
  busquedaActivaItem: number | null;
  setBusquedaActivaItem: (index: number | null) => void;
  handleBuscarEquipoEnCatalogo: (index: number, texto: string) => void;
  handleSeleccionarEquipoDeCatalogo: (index: number, equipo: Equipo) => void;
  subtotalSinIva: number;
  montoIva: number;
  totalInversion: number;
  totalEnLetras: string;
  inputClasses: string;
  simboloMoneda?: string;
  porcentajeIva?: number;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  fields,
  register,
  append,
  remove,
  watchItems,
  equiposCatalogo,
  equiposFiltrados,
  busquedaActivaItem,
  setBusquedaActivaItem,
  handleBuscarEquipoEnCatalogo,
  handleSeleccionarEquipoDeCatalogo,
  subtotalSinIva,
  montoIva,
  totalInversion,
  totalEnLetras,
  inputClasses,
  simboloMoneda = '$',
  porcentajeIva = 13,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Items Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">Equipos y Servicios Cotizados</h2>
            {equiposCatalogo.length > 0 && (
              <span className="text-xs text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {equiposCatalogo.length} equipos en BD
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => append({
              itemNumero: fields.length + 1,
              descripcionEquipo: '',
              partNumber: '',
              caracteristicas: '',
              tiempoEntrega: 'De 5 a 6 semanas',
              cantidad: 1,
              precioUnitario: 0,
              totalLinea: 0
            })}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
          >
            + Agregar Item
          </button>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse" aria-label="Tabla de Equipos e Ítems de Cotización">
              <thead>
                <tr className="bg-quote-header text-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  <th scope="col" className="p-2 sm:p-3 text-center w-12 sm:w-16">Item</th>
                  <th scope="col" className="p-2 sm:p-3 text-left min-w-[280px]">Descripción / Part Number / Características</th>
                  <th scope="col" className="p-2 sm:p-3 text-left w-28 sm:w-36">Entrega</th>
                  <th scope="col" className="p-2 sm:p-3 text-center w-20 sm:w-24">Cant.</th>
                  <th scope="col" className="p-2 sm:p-3 text-right w-24 sm:w-32">Precio ($)</th>
                  <th scope="col" className="p-2 sm:p-3 text-right w-24 sm:w-32">Total ($)</th>
                  <th scope="col" className="p-2 sm:p-3 text-center w-12 sm:w-16"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                {fields.map((field, index) => {
                  const item = watchItems?.[index] || {};
                  const totalLinea = Math.round((Number(item.cantidad || 0) * Number(item.precioUnitario || 0)) * 100) / 100;
                  const sugerenciasItem = equiposFiltrados[index] || [];
                  const mostrarSugerencias = busquedaActivaItem === index && sugerenciasItem.length > 0;

                  return (
                    <tr key={field.id} className="hover:bg-gray-50 flex flex-col md:table-row border-b md:border-b-0 mb-4 md:mb-0 bg-white">
                      <td className="p-2 sm:p-3 text-center font-bold text-gray-500 align-top">
                        <span className="md:hidden text-xs font-semibold text-gray-400 mr-1">Item #</span>
                        {index + 1}
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <div className="space-y-2">
                          {/* Descripción con Autocompletado */}
                          <div className="relative">
                            <input
                              {...register(`items.${index}.descripcionEquipo`, { required: true })}
                              autoComplete="off"
                              className={`${inputClasses} font-semibold text-gray-800 ${mostrarSugerencias ? 'ring-2 ring-blue-500' : ''}`}
                              placeholder="Escribe el equipo o busca en el catálogo..."
                              onChange={(e) => handleBuscarEquipoEnCatalogo(index, e.target.value)}
                              onFocus={() => {
                                if (sugerenciasItem.length > 0) setBusquedaActivaItem(index);
                              }}
                            />

                            {/* Dropdown flotante de sugerencias */}
                            {mostrarSugerencias && (
                              <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-blue-200 rounded-lg shadow-xl divide-y divide-gray-100">
                                <div className="p-1.5 bg-blue-50 text-[11px] font-semibold text-blue-700 flex justify-between items-center">
                                  <span>Catálogo de Equipos ({sugerenciasItem.length})</span>
                                  <button
                                    type="button"
                                    onClick={() => setBusquedaActivaItem(null)}
                                    className="text-gray-400 hover:text-gray-600 font-bold px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                                {sugerenciasItem.map(eq => (
                                  <button
                                    key={eq.id}
                                    type="button"
                                    onClick={() => handleSeleccionarEquipoDeCatalogo(index, eq)}
                                    className="w-full text-left p-2 hover:bg-blue-50 transition-colors flex flex-col group cursor-pointer"
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="font-semibold text-xs text-gray-900 group-hover:text-blue-900">
                                        {eq.descripcion}
                                      </span>
                                      {eq.precioReferencial !== undefined && (
                                        <span className="font-mono text-emerald-700 font-bold text-xs shrink-0">
                                          ${Number(eq.precioReferencial).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                      {eq.partNumber && (
                                        <span className="font-mono bg-gray-100 px-1 rounded text-[10px] text-blue-700 font-medium">
                                          P/N: {eq.partNumber}
                                        </span>
                                      )}
                                      {eq.categoria && <span>Cat: {eq.categoria}</span>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* P/N y Características */}
                          <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-200/70 space-y-2">
                            <div>
                              <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                                Part Number (P/N)
                              </label>
                              <input
                                {...register(`items.${index}.partNumber`)}
                                autoComplete="off"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1F3D3D] focus:ring-[#1F3D3D] text-xs p-1.5 border bg-white font-mono"
                                placeholder="Ej: ZD22042-D01G00EZ"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                                Características Técnicas (se imprimirán como viñetas en el PDF)
                              </label>
                              <textarea
                                {...register(`items.${index}.caracteristicas`)}
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#1F3D3D] focus:ring-[#1F3D3D] text-xs p-1.5 border bg-white"
                                placeholder="• Especificación 1&#10;• Especificación 2"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <label className="text-xs font-semibold text-gray-500 block mb-1 md:hidden">Entrega</label>
                        <input
                          {...register(`items.${index}.tiempoEntrega`)}
                          autoComplete="off"
                          className={inputClasses}
                          placeholder="Ej: De 5 a 6 semanas"
                        />
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <label className="text-xs font-semibold text-gray-500 block mb-1 md:hidden">Cant.</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          {...register(`items.${index}.cantidad`, { required: true, valueAsNumber: true })}
                          className={`${inputClasses} text-center font-bold`}
                        />
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <label className="text-xs font-semibold text-gray-500 block mb-1 md:hidden">Precio</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.precioUnitario`, { required: true, valueAsNumber: true })}
                          className={`${inputClasses} text-right font-mono font-semibold`}
                        />
                      </td>
                      <td className="p-2 sm:p-3 align-top">
                        <label className="text-xs font-semibold text-gray-500 block mb-1 md:hidden">Total</label>
                        <div className="p-2 bg-gray-100 rounded-md font-bold text-gray-800 text-right font-mono mt-1">
                          {simboloMoneda}{totalLinea.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 align-top text-center">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 p-2 font-bold mt-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 rounded outline-none"
                            title={`Eliminar ítem ${index + 1}`}
                            aria-label={`Eliminar ítem ${index + 1}`}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Notes & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <label htmlFor="cot-notaImportante" className="text-lg font-bold text-gray-800 mb-2 block">
            Nota Importante
          </label>
          <textarea
            id="cot-notaImportante"
            {...register('notaImportante')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
          />
        </div>

        <div className="bg-rose-50 rounded-xl shadow-lg p-4 sm:p-6 border border-rose-200 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Subtotal sin IVA:</span>
              <span className="font-semibold font-mono">{simboloMoneda}{subtotalSinIva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">{porcentajeIva}% IVA:</span>
              <span className="font-semibold font-mono">{simboloMoneda}{montoIva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-rose-900 text-xl font-bold pt-2 border-t border-rose-200 font-mono">
              <span>Total Inversión:</span>
              <span>{simboloMoneda}{totalInversion.toFixed(2)}</span>
            </div>
            <div className="text-xs text-rose-700 text-right font-medium italic">
              Son: {totalEnLetras}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
