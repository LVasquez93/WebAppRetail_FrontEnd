import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TenantScope } from './TenantScopeFilter';

/**
 * Hook reutilizable para inicializar y mantener sincronizado el estado del filtro de alcance (Empresa / Sucursal).
 * Asegura que ningún componente consumidor tenga estado de sucursal desincronizado con las políticas del usuario.
 */
export const useTenantScopeFilter = (initialScope?: Partial<TenantScope>) => {
  const { user, canSelectEmpresa, canSelectSucursal, isBranchLocked } = useAuth();

  const [scope, setScope] = useState<TenantScope>(() => ({
    empresaId: canSelectEmpresa ? initialScope?.empresaId : user?.empresaId,
    sucursalId: canSelectSucursal ? initialScope?.sucursalId : user?.sucursalId,
  }));

  useEffect(() => {
    setScope(prev => ({
      empresaId: canSelectEmpresa ? prev.empresaId : user?.empresaId,
      sucursalId: canSelectSucursal ? prev.sucursalId : user?.sucursalId,
    }));
  }, [canSelectEmpresa, canSelectSucursal, isBranchLocked, user?.empresaId, user?.sucursalId]);

  return { scope, setScope };
};
