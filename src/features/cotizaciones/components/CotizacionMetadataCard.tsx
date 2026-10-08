import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { CotizacionFormData } from '../types/cotizacion.types';
import { Usuario } from '../../catalogos/types/catalogos.types';

interface CotizacionMetadataCardProps {
  register: UseFormRegister<CotizacionFormData>;
  errors: FieldErrors<CotizacionFormData>;
  setValue: UseFormSetValue<CotizacionFormData>;
  usuarioEmisorValor: string;
  usuarios: Usuario[];
  isAdminOrGerente: boolean;
  inputClasses: string;
}

export const CotizacionMetadataCard: React.FC<CotizacionMetadataCardProps> = ({
  register,
  errors,
  setValue,
  usuarioEmisorValor,
  usuarios,
  isAdminOrGerente,
  inputClasses,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Datos de Cotización</h2>
      <div className="space-y-4">
        {/* Fecha de Emisión */}
        <div>
          <label htmlFor="cot-fechaEmision" className="block text-sm font-medium text-gray-700">Fecha de Emisión *</label>
          <input
            id="cot-fechaEmision"
            type="date"
            {...register('fechaEmision', { required: true })}
            autoComplete="off"
            className={inputClasses}
          />
          {errors.fechaEmision && <span className="text-red-500 text-xs">Requerido</span>}
        </div>

        {/* Emisor con RBAC */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="cot-usuarioEmisor" className="block text-sm font-medium text-gray-700">Emisor *</label>
            {isAdminOrGerente && usuarios.length > 0 ? (
              <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Emisores en BD ({usuarios.length})
              </span>
            ) : (
              <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                🔒 Asignado a tu cuenta
              </span>
            )}
          </div>

          {isAdminOrGerente && usuarios.length > 0 ? (
            <div className="mt-1">
              <select
                id="cot-usuarioEmisor"
                value={usuarioEmisorValor}
                onChange={(e) => setValue('usuarioEmisor', e.target.value)}
                className={inputClasses}
              >
                {usuarios.map(u => (
                  <option key={u.id} value={u.username}>
                    {u.username} — {u.nombreCompleto} ({u.cargo || u.rol})
                  </option>
                ))}
                {!usuarios.some(u => u.username === usuarioEmisorValor) && (
                  <option value={usuarioEmisorValor}>{usuarioEmisorValor} (Personalizado)</option>
                )}
              </select>
            </div>
          ) : (
            <div className="mt-1">
              <input
                id="cot-usuarioEmisor"
                {...register('usuarioEmisor', { required: true })}
                autoComplete="off"
                className={`${inputClasses} bg-gray-50 font-medium text-gray-800`}
                placeholder="Nombre de quien cotiza"
                readOnly={!isAdminOrGerente}
              />
            </div>
          )}
          {errors.usuarioEmisor && <span className="text-red-500 text-xs">Requerido</span>}
        </div>

        {/* Forma de Pago */}
        <div>
          <label htmlFor="cot-formaPago" className="block text-sm font-medium text-gray-700">Forma de Pago *</label>
          <input
            id="cot-formaPago"
            {...register('formaPago', { required: true })}
            autoComplete="off"
            className={inputClasses}
          />
          {errors.formaPago && <span className="text-red-500 text-xs">Requerido</span>}
        </div>
      </div>
    </div>
  );
};
