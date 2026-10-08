import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSucursal } from '../../context/SucursalContext';

export interface TenantScope {
  empresaId?: number;
  sucursalId?: number;
}

interface TenantScopeFilterProps {
  value: TenantScope;
  onChange: (newScope: TenantScope) => void;
  permitirTodas?: boolean;
  className?: string;
}

/**
 * Componente Senior Centralizado para Filtrado por Empresa y Sucursal (Multi-Tenant Scope Filter).
 * 
 * Reglas de Gobernanza Automática:
 * 1. SuperAdmin (SaaS Root): Selector interactivo en cascada de Empresa y Sucursal (con opción "Todas").
 * 2. Gerente General: Empresa fija a su organización (badge informativo), selector interactivo de Sucursales de su empresa.
 * 3. Gerente de Sucursal y Vendedor: Empresa y Sucursal estrictamente BLOQUEADAS a su sede asignada (badge con candado 🔒, sin dropdowns).
 * 
 * Ningún módulo consumidor necesita validar roles manualmente ni renderizar selects con if/else.
 */
export const TenantScopeFilter: React.FC<TenantScopeFilterProps> = ({
  value,
  onChange,
  permitirTodas = true,
  className = '',
}) => {
  const { user, canSelectEmpresa, canSelectSucursal, isBranchLocked } = useAuth();
  const { empresas, sucursales } = useSucursal();

  // 1. Resolver Empresa Efectiva
  const effectiveEmpresaId = useMemo(() => {
    if (!canSelectEmpresa) {
      return user?.empresaId;
    }
    return value.empresaId;
  }, [canSelectEmpresa, user?.empresaId, value.empresaId]);

  // 2. Sucursales disponibles según la empresa seleccionada o asignada
  const sucursalesDisponibles = useMemo(() => {
    if (effectiveEmpresaId) {
      return sucursales.filter(s => s.empresaId === effectiveEmpresaId);
    }
    return sucursales;
  }, [sucursales, effectiveEmpresaId]);

  // 3. Forzar saneamiento del scope si el usuario tiene sede bloqueada o no puede elegir empresa
  useEffect(() => {
    let sanitizedEmpresaId = value.empresaId;
    let sanitizedSucursalId = value.sucursalId;
    let huboCambio = false;

    // A. Bloqueo de empresa si no es admin
    if (!canSelectEmpresa && user?.empresaId && sanitizedEmpresaId !== user.empresaId) {
      sanitizedEmpresaId = user.empresaId;
      huboCambio = true;
    }

    // B. Bloqueo estricto de sucursal si es Gerente de Sucursal o Ventas
    if (isBranchLocked && user?.sucursalId && sanitizedSucursalId !== user.sucursalId) {
      sanitizedSucursalId = user.sucursalId;
      huboCambio = true;
    }

    if (huboCambio) {
      onChange({
        empresaId: sanitizedEmpresaId,
        sucursalId: sanitizedSucursalId,
      });
    }
  }, [canSelectEmpresa, isBranchLocked, user?.empresaId, user?.sucursalId, value.empresaId, value.sucursalId, onChange]);

  // Nombre de la sucursal asignada para el badge de bloqueo
  const nombreSucursalAsignada = useMemo(() => {
    if (user?.sucursalId) {
      const encontrada = sucursales.find(s => s.id === user.sucursalId);
      if (encontrada) return encontrada.nombre;
    }
    return 'Mi Sede Asignada';
  }, [sucursales, user?.sucursalId]);

  const nombreEmpresaAsignada = user?.empresaNombre || 'Mi Empresa';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. SECCIÓN EMPRESA */}
      {canSelectEmpresa ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500">Empresa:</span>
          <select
            value={value.empresaId || 'TODAS'}
            onChange={(e) => {
              const nuevaEmpresaId = e.target.value === 'TODAS' ? undefined : Number(e.target.value);
              // Al cambiar empresa, resetear sucursal a TODAS (undefined)
              onChange({
                empresaId: nuevaEmpresaId,
                sucursalId: undefined,
              });
            }}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#1F3D3D] focus:border-[#1F3D3D]"
          >
            {permitirTodas && <option value="TODAS">🏛️ Todas las Empresas</option>}
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                🏛️ {emp.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div
          className="bg-teal-50 border border-teal-200 text-teal-900 text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1"
          title={`Organización: ${nombreEmpresaAsignada}`}
        >
          <span>🏢</span>
          <span className="max-w-[130px] sm:max-w-[180px] truncate">{nombreEmpresaAsignada}</span>
        </div>
      )}

      {/* 2. SECCIÓN SUCURSAL */}
      {canSelectSucursal ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500">Sucursal:</span>
          <select
            value={value.sucursalId || 'TODAS'}
            onChange={(e) => {
              const nuevaSucursalId = e.target.value === 'TODAS' ? undefined : Number(e.target.value);
              onChange({
                ...value,
                sucursalId: nuevaSucursalId,
              });
            }}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#1F3D3D] focus:border-[#1F3D3D]"
          >
            {permitirTodas && <option value="TODAS">🏢 Todas las Sucursales</option>}
            {sucursalesDisponibles.map((s) => (
              <option key={s.id} value={s.id}>
                🏢 {s.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* SUCURSAL BLOQUEADA ESTRICTAMENTE (Gerente de Sucursal y Vendedor) */
        <div
          className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
          title="Tu usuario está asignado a esta sede. Por políticas de seguridad, no puedes ver ni operar en otras sucursales."
        >
          <span>🔒</span>
          <span className="max-w-[130px] sm:max-w-[180px] truncate">{nombreSucursalAsignada}</span>
        </div>
      )}
    </div>
  );
};
