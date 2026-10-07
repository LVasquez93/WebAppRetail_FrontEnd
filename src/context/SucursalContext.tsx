import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Sucursal } from '../features/catalogos/types/catalogos.types';
import { Empresa } from '../features/empresas/types/empresas.types';
import { sucursalesApi } from '../api/sucursalesApi';
import { empresasApi } from '../api/empresasApi';
import { useAuth } from './AuthContext';

interface SucursalContextType {
  empresas: Empresa[];
  empresaSeleccionada: Empresa | null;
  setEmpresaSeleccionada: (empresa: Empresa | null) => void;
  sucursales: Sucursal[];
  sucursalActiva: Sucursal | null;
  setSucursalActiva: (sucursal: Sucursal) => void;
  recargarSucursales: () => Promise<void>;
  recargarEmpresas: () => Promise<void>;
  cargandoSucursales: boolean;
  cargandoEmpresas: boolean;
}

const SucursalContext = createContext<SucursalContextType | undefined>(undefined);

export const SucursalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAdminOrGerente, isAdmin } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionadaState] = useState<Empresa | null>(null);
  const [cargandoEmpresas, setCargandoEmpresas] = useState<boolean>(true);

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalActiva, setSucursalActivaState] = useState<Sucursal | null>(null);
  const [cargandoSucursales, setCargandoSucursales] = useState<boolean>(true);

  // 1. Cargar Empresas
  const cargarEmpresas = async () => {
    if (!isAdmin) {
      if (user?.empresaId) {
        const empPropia: Empresa = {
          id: user.empresaId,
          nombre: user.empresaNombre || 'Mi Empresa',
          razonSocial: user.empresaNombre || 'Mi Empresa',
          activo: true,
        };
        setEmpresas([empPropia]);
        setEmpresaSeleccionadaState(empPropia);
      }
      setCargandoEmpresas(false);
      return;
    }

    try {
      setCargandoEmpresas(true);
      const data = await empresasApi.listar(true);
      setEmpresas(data);

      const guardadoEmpresaId = localStorage.getItem('cotizador_selected_empresa_id');
      let seleccionada: Empresa | null = null;

      if (guardadoEmpresaId && guardadoEmpresaId !== 'TODAS') {
        seleccionada = data.find(e => e.id === Number(guardadoEmpresaId)) || null;
      }
      if (!seleccionada && data.length > 0) {
        seleccionada = data[0];
        localStorage.setItem('cotizador_selected_empresa_id', String(seleccionada.id));
      }
      setEmpresaSeleccionadaState(seleccionada);
    } catch (error) {
      console.error('Error al cargar empresas para admin:', error);
    } finally {
      setCargandoEmpresas(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, [user?.id, user?.rol, user?.empresaId, isAdmin]);

  // 2. Cargar Sucursales según Empresa Activa
  const cargarSucursales = async (empIdTarget?: number | null) => {
    try {
      setCargandoSucursales(true);
      const empId = empIdTarget !== undefined
        ? (empIdTarget === null ? undefined : empIdTarget)
        : (isAdmin ? empresaSeleccionada?.id : user?.empresaId);

      const data = await sucursalesApi.listar(empId);
      const filtered = !isAdmin && user?.empresaId
        ? data.filter(s => s.empresaId === user.empresaId)
        : data;
      setSucursales(filtered);

      if (filtered && filtered.length > 0) {
        if (!isAdminOrGerente && user?.sucursalId) {
          const asignada = filtered.find(s => s.id === user.sucursalId) || filtered[0];
          setSucursalActivaState(asignada);
          localStorage.setItem('cotizador_sucursal_id', String(asignada.id));
        } else {
          const guardadoId = localStorage.getItem('cotizador_sucursal_id');
          let seleccionada: Sucursal | undefined;

          if (guardadoId) {
            seleccionada = filtered.find(s => s.id === Number(guardadoId));
          }
          if (!seleccionada && user?.sucursalId) {
            seleccionada = filtered.find(s => s.id === user.sucursalId);
          }
          if (!seleccionada) {
            seleccionada = filtered[0];
          }

          setSucursalActivaState(seleccionada);
          localStorage.setItem('cotizador_sucursal_id', String(seleccionada.id));
        }
      } else {
        setSucursalActivaState(null);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setCargandoSucursales(false);
    }
  };

  useEffect(() => {
    if (!cargandoEmpresas) {
      const targetId = isAdmin
        ? (empresaSeleccionada ? empresaSeleccionada.id : null)
        : (user?.empresaId || null);
      cargarSucursales(targetId);
    }
  }, [empresaSeleccionada?.id, cargandoEmpresas, user?.sucursalId, user?.empresaId, isAdmin]);

  const setEmpresaSeleccionada = (empresa: Empresa | null) => {
    if (!isAdmin) {
      console.warn('Cambio de empresa restringido por políticas de seguridad.');
      return;
    }
    setEmpresaSeleccionadaState(empresa);
    if (empresa) {
      localStorage.setItem('cotizador_selected_empresa_id', String(empresa.id));
    } else {
      localStorage.setItem('cotizador_selected_empresa_id', 'TODAS');
    }
    cargarSucursales(empresa ? empresa.id : null);
  };

  const setSucursalActiva = (sucursal: Sucursal) => {
    if (!isAdminOrGerente && user?.sucursalId && sucursal.id !== user.sucursalId) {
      console.warn('Cambio de sucursal restringido por políticas de seguridad RBAC.');
      return;
    }
    setSucursalActivaState(sucursal);
    localStorage.setItem('cotizador_sucursal_id', String(sucursal.id));
  };

  return (
    <SucursalContext.Provider
      value={{
        empresas,
        empresaSeleccionada,
        setEmpresaSeleccionada,
        sucursales,
        sucursalActiva,
        setSucursalActiva,
        recargarSucursales: () => cargarSucursales(empresaSeleccionada ? empresaSeleccionada.id : null),
        recargarEmpresas: cargarEmpresas,
        cargandoSucursales,
        cargandoEmpresas,
      }}
    >
      {children}
    </SucursalContext.Provider>
  );
};

export const useSucursal = (): SucursalContextType => {
  const context = useContext(SucursalContext);
  if (!context) {
    throw new Error('useSucursal debe usarse dentro de un SucursalProvider');
  }
  return context;
};
