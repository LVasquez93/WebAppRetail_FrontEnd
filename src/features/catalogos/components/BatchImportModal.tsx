import React from 'react';
import { Sucursal } from '../types/catalogos.types';

interface BatchImportModalProps {
  isOpen: boolean;
  tabActiva: 'clientes' | 'equipos' | 'usuarios';
  textoLote: string;
  previsualizacionLote: any[];
  sucursalLote: number;
  setSucursalLote: (id: number) => void;
  sucursales: Sucursal[];
  importandoLote: boolean;
  obtenerNombreSucursal: (id?: number) => string;
  onActualizarTextoLote: (texto: string) => void;
  onSubirArchivoCsv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescargarPlantilla: (tab: 'clientes' | 'equipos' | 'usuarios') => void;
  onEjecutarImportacion: () => void;
  onClose: () => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  tabActiva,
  textoLote,
  previsualizacionLote,
  sucursalLote,
  setSucursalLote,
  sucursales,
  importandoLote,
  obtenerNombreSucursal,
  onActualizarTextoLote,
  onSubirArchivoCsv,
  onDescargarPlantilla,
  onEjecutarImportacion,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="bg-emerald-800 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>📥</span> Carga por Lote:{' '}
              {tabActiva === 'clientes' ? 'Clientes' : tabActiva === 'equipos' ? 'Equipos' : 'Usuarios'}
            </h2>
            <p className="text-xs text-emerald-100">
              Importa múltiples registros simultáneamente pegando datos o subiendo un archivo CSV/Excel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Barra de opciones de plantilla y sucursal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => onDescargarPlantilla(tabActiva)}
              className="text-xs bg-white hover:bg-gray-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>📄</span> Descargar Plantilla CSV de Ejemplo
            </button>

            {tabActiva !== 'usuarios' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Sucursal de destino:</span>
                <select
                  value={sucursalLote}
                  onChange={(e) => {
                    const nuevaS = Number(e.target.value);
                    setSucursalLote(nuevaS);
                    if (textoLote) onActualizarTextoLote(textoLote);
                  }}
                  className="px-2.5 py-1 text-xs border rounded-lg bg-white font-medium"
                >
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selector de Archivo CSV */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer text-center shadow-xs">
              Subir Archivo .CSV
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                className="hidden"
                onChange={onSubirArchivoCsv}
              />
            </label>
            <span className="text-xs text-gray-500">O copia y pega el contenido directamente en el cuadro de abajo:</span>
          </div>

          {/* Área de Texto para pegar CSV o Tabulado */}
          <div>
            <textarea
              rows={4}
              value={textoLote}
              onChange={(e) => onActualizarTextoLote(e.target.value)}
              placeholder={
                tabActiva === 'clientes'
                  ? 'RazonSocial;NombreComercial;ContactoPrincipal;Telefono;Correo;Direccion\nDISTRIBUIDORA SAN MIGUEL SA DE CV;DISTRIBUIDORA SM;Ing. Mario Lopez;2660-1234;ventas@dsm.sv;San Miguel'
                  : tabActiva === 'equipos'
                  ? 'Descripcion;PartNumber;Caracteristicas;PrecioReferencial;TiempoEntrega;Categoria\nIMPRESORA TERMICA ZEBRA ZD220;ZD220-01;Termica directa;280.00;Stock Inmediato;Impresoras'
                  : 'Username;NombreCompleto;Correo;Cargo;Rol\nJPEREZ;Lic. Juan Perez;juan.perez@retail.com.sv;Ejecutivo Ventas;ROLE_VENTAS'
              }
              className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-gray-50"
            />
          </div>

          {/* Previsualización de Registros Detectados */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wide text-gray-700 flex items-center gap-1.5">
                <span>👁️</span> Previsualización:{' '}
                <span className="text-emerald-700 font-bold">{previsualizacionLote.length} registros válidos detectados</span>
              </h3>
            </div>

            {previsualizacionLote.length > 0 ? (
              <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0">
                    <tr>
                      <th className="p-2 w-8">#</th>
                      {tabActiva === 'clientes' && (
                        <>
                          <th className="p-2">Razón Social</th>
                          <th className="p-2">Contacto</th>
                          <th className="p-2">Teléfono</th>
                          <th className="p-2">Sucursal</th>
                        </>
                      )}
                      {tabActiva === 'equipos' && (
                        <>
                          <th className="p-2">Descripción</th>
                          <th className="p-2">Part Number</th>
                          <th className="p-2">Precio Ref.</th>
                          <th className="p-2">Sucursal</th>
                        </>
                      )}
                      {tabActiva === 'usuarios' && (
                        <>
                          <th className="p-2">Username</th>
                          <th className="p-2">Nombre Completo</th>
                          <th className="p-2">Cargo</th>
                          <th className="p-2">Rol</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previsualizacionLote.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 text-gray-400 font-mono">{idx + 1}</td>
                        {tabActiva === 'clientes' && (
                          <>
                            <td className="p-2 font-semibold text-gray-800">{item.razonSocial}</td>
                            <td className="p-2 text-gray-600">{item.contactoPrincipal || '—'}</td>
                            <td className="p-2 text-gray-600">{item.telefono || '—'}</td>
                            <td className="p-2 text-teal-800 font-medium">{obtenerNombreSucursal(item.sucursalId)}</td>
                          </>
                        )}
                        {tabActiva === 'equipos' && (
                          <>
                            <td className="p-2 font-semibold text-gray-800">{item.descripcion}</td>
                            <td className="p-2 font-mono text-gray-600">{item.partNumber || '—'}</td>
                            <td className="p-2 text-emerald-700 font-bold">
                              {item.precioReferencial !== undefined ? `$${item.precioReferencial}` : '—'}
                            </td>
                            <td className="p-2 text-teal-800 font-medium">{obtenerNombreSucursal(item.sucursalId)}</td>
                          </>
                        )}
                        {tabActiva === 'usuarios' && (
                          <>
                            <td className="p-2 font-mono font-bold text-blue-700">{item.username}</td>
                            <td className="p-2 font-semibold text-gray-800">{item.nombreCompleto}</td>
                            <td className="p-2 text-gray-600">{item.cargo || '—'}</td>
                            <td className="p-2 text-gray-600">{item.rol}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed rounded-lg">
                Pega texto en formato CSV o sube un archivo para previsualizar los registros antes de guardar.
              </div>
            )}
          </div>

          {/* Botones del Modal de Lote */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={importandoLote || previsualizacionLote.length === 0}
              onClick={onEjecutarImportacion}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {importandoLote ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Importando registros...
                </>
              ) : (
                <>
                  <span>✓</span> Guardar {previsualizacionLote.length} Registros en BD
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
