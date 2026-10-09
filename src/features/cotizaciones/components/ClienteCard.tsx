import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CotizacionFormData } from '../types/cotizacion.types';
import { Cliente } from '../../catalogos/types/catalogos.types';

interface ClienteCardProps {
  register: UseFormRegister<CotizacionFormData>;
  errors: FieldErrors<CotizacionFormData>;
  clientes: Cliente[];
  clientesSugeridos: Cliente[];
  mostrarDropdownClientes: boolean;
  setMostrarDropdownClientes: (mostrar: boolean) => void;
  handleBuscarCliente: (texto: string) => void;
  handleSelectCliente: (cliente: Cliente) => void;
  inputClasses: string;
  totalClientesEnBd?: number;
  buscandoCliente?: boolean;
}

export const ClienteCard: React.FC<ClienteCardProps> = ({
  register,
  errors,
  clientes,
  clientesSugeridos,
  mostrarDropdownClientes,
  setMostrarDropdownClientes,
  handleBuscarCliente,
  handleSelectCliente,
  inputClasses,
  totalClientesEnBd,
  buscandoCliente = false,
}) => {
  const totalMostrar = totalClientesEnBd !== undefined ? totalClientesEnBd : clientes.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">Datos del Cliente</h2>
        {totalMostrar > 0 && (
          <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {totalMostrar} clientes en BD
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Contacto Principal */}
        <div>
          <label htmlFor="cot-contactoCliente" className="block text-sm font-medium text-gray-700">Contacto Principal *</label>
          <input
            id="cot-contactoCliente"
            {...register('contactoCliente', { required: true })}
            autoComplete="off"
            className={inputClasses}
            placeholder="Nombre del contacto"
          />
          {errors.contactoCliente && <span className="text-red-500 text-xs">Requerido</span>}
        </div>

        {/* Razón Social con Autocompletado Interactivo */}
        <div className="relative">
          <div className="flex justify-between items-center">
            <label htmlFor="cot-razonSocialCliente" className="block text-sm font-medium text-gray-700">Razón Social *</label>
            <span className="text-[11px] text-gray-400">Escribe o selecciona de la lista</span>
          </div>

          <input
            id="cot-razonSocialCliente"
            {...register('razonSocialCliente', { required: true })}
            autoComplete="off"
            className={`${inputClasses} ${mostrarDropdownClientes ? 'ring-2 ring-emerald-600' : ''}`}
            placeholder="Escribe la empresa o busca en la BD..."
            onChange={(e) => handleBuscarCliente(e.target.value)}
            onFocus={() => {
              if (clientesSugeridos.length > 0) setMostrarDropdownClientes(true);
            }}
          />
          {errors.razonSocialCliente && <span className="text-red-500 text-xs">Requerido</span>}

          {/* Menú Flotante de Sugerencias de Clientes */}
          {mostrarDropdownClientes && (
            <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100">
              <div className="p-1.5 bg-gray-50 text-[11px] font-semibold text-gray-500 flex justify-between items-center">
                <span>
                  {buscandoCliente ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="inline-block animate-spin">⌛</span> Buscando en base de datos...
                    </span>
                  ) : (
                    `Coincidencias encontradas (${clientesSugeridos.length})`
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarDropdownClientes(false)}
                  aria-label="Cerrar sugerencias"
                  className="text-gray-400 hover:text-gray-600 font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {clientesSugeridos.length > 0 ? (
                clientesSugeridos.map(cli => (
                  <button
                    key={cli.id}
                    type="button"
                    onClick={() => handleSelectCliente(cli)}
                    className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors flex flex-col group cursor-pointer"
                  >
                    <span className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
                      {cli.razonSocial}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600">
                      {cli.nombreComercial && (
                        <span className="text-brand-accent-text font-semibold font-sans">★ {cli.nombreComercial}</span>
                      )}
                      {cli.contactoPrincipal && (
                        <span className="text-gray-500">Contacto: {cli.contactoPrincipal}</span>
                      )}
                    </div>
                  </button>
                ))
              ) : !buscandoCliente ? (
                <div className="p-3 text-center text-xs text-gray-500">
                  No se encontraron coincidencias en la base de datos
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Nombre Comercial */}
        <div>
          <label htmlFor="cot-nombreComercial" className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
          <input
            id="cot-nombreComercial"
            {...register('nombreComercial')}
            autoComplete="off"
            className={inputClasses}
            placeholder="Nombre comercial (opcional)"
          />
        </div>
      </div>
    </div>
  );
};
