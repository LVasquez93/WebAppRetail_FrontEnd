import React from 'react';
import { Sucursal } from '../types/catalogos.types';

interface CatalogoFormModalProps {
  isOpen: boolean;
  tabActiva: 'clientes' | 'equipos' | 'usuarios';
  registroEdicion: any | null;
  formData: any;
  setFormData: (data: any) => void;
  sucursales: Sucursal[];
  guardando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CatalogoFormModal: React.FC<CatalogoFormModalProps> = ({
  isOpen,
  tabActiva,
  registroEdicion,
  formData,
  setFormData,
  sucursales,
  guardando,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="bg-[#1F3D3D] text-white p-4 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold">
            {registroEdicion ? '✏️ Editar' : '➕ Nuevo'}{' '}
            {tabActiva === 'clientes' ? 'Cliente' : tabActiva === 'equipos' ? 'Equipo' : 'Usuario Emisor'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {tabActiva === 'clientes' && (
            <>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial || ''}
                  onChange={e => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Ej: DISTRIBUIDORA DE ALIMENTOS S.A. DE C.V."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={formData.nombreComercial || ''}
                  onChange={e => setFormData({ ...formData, nombreComercial: e.target.value })}
                  placeholder="Ej: ALIMENTOS PREMIUM"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contacto Principal</label>
                  <input
                    type="text"
                    value={formData.contactoPrincipal || ''}
                    onChange={e => setFormData({ ...formData, contactoPrincipal: e.target.value })}
                    placeholder="Ej: Lic. Tania Argueta"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono || ''}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: 2263-0000"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo || ''}
                    onChange={e => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="compras@cliente.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sucursal Asignada *</label>
                  <select
                    value={formData.sucursalId || ''}
                    onChange={e => setFormData({ ...formData, sucursalId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="San Salvador, El Salvador"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
            </>
          )}

          {tabActiva === 'equipos' && (
            <>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descripción del Equipo / Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.descripcion || ''}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ej: IMPRESORA DE ETIQUETAS ZEBRA ZD220T"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Part Number (P/N)</label>
                  <input
                    type="text"
                    value={formData.partNumber || ''}
                    onChange={e => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="Ej: ZCD-800300-250LA"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Referencial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioReferencial ?? 0}
                    onChange={e => setFormData({ ...formData, precioReferencial: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tiempo de Entrega</label>
                  <input
                    type="text"
                    value={formData.tiempoEntregaPredeterminado || 'De 5 a 6 semanas'}
                    onChange={e => setFormData({ ...formData, tiempoEntregaPredeterminado: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.categoria || 'General'}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Características Técnicas</label>
                <textarea
                  rows={3}
                  value={formData.caracteristicas || ''}
                  onChange={e => setFormData({ ...formData, caracteristicas: e.target.value })}
                  placeholder="• Especificación 1&#10;• Especificación 2"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sucursal Asignada *</label>
                <select
                  value={formData.sucursalId || ''}
                  onChange={e => setFormData({ ...formData, sucursalId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                >
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tabActiva === 'usuarios' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Código / Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    placeholder="Ej: VENTAS02"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contraseña {registroEdicion ? '(opcional)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!registroEdicion}
                    value={formData.password || ''}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={registroEdicion ? 'Conservar actual' : 'Mínimo 6 caracteres'}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nombreCompleto || ''}
                  onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  placeholder="Ej: Lic. Mauricio Morales"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={formData.cargo || ''}
                    onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ej: Ejecutivo de Cuentas Clave"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo || ''}
                    onChange={e => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="mauricio.morales@retail.com.sv"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rol de Acceso *</label>
                  <select
                    value={formData.rol || 'ROLE_VENTAS'}
                    onChange={e => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  >
                    <option value="ROLE_VENTAS">ROLE_VENTAS (Vendedor/Emisor)</option>
                    <option value="ROLE_GERENTE">ROLE_GERENTE (Gerente de Sucursal)</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN (Administrador)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sucursal Asignada *</label>
                  <select
                    value={formData.sucursalId || (sucursales[0]?.id || 1)}
                    onChange={e => setFormData({ ...formData, sucursalId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F3D3D]"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-[#1F3D3D] hover:bg-[#2a5252] text-white rounded-lg font-semibold cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {guardando ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
