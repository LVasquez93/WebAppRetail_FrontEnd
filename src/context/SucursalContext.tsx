import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Sucursal } from '../features/catalogos/types/catalogos.types';
import { sucursalesApi } from '../api/sucursalesApi';
import { useAuth } from './AuthContext';

interface SucursalContextType {
  sucursales: Sucursal[];
  sucursalActiva: Sucursal | null;
  setSucursalActiva: (sucursal: Sucursal) => void;
  recargarSucursales: () => Promise<void>;
  cargandoSucursales: boolean;
}

const SucursalContext = createContext<SucursalContextType | undefined>(undefined);

export const SucursalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAdminOrGerente } = useAuth();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalActiva, setSucursalActivaState] = useState<Sucursal | null>(null);
  const [cargandoSucursales, setCargandoSucursales] = useState<boolean>(true);

  const cargarSucursales = async () => {
    try {
      setCargandoSucursales(true);
      const data = await sucursalesApi.listar();
      setSucursales(data);

      if (data && data.length > 0) {
        // Si el usuario es de ventas (no admin ni gerente), fijar obligatoriamente su sucursal asignada
        if (!isAdminOrGerente && user?.sucursalId) {
          const asignada = data.find(s => s.id === user.sucursalId) || data[0];
          setSucursalActivaState(asignada);
          localStorage.setItem('cotizador_sucursal_id', String(asignada.id));
        } else {
          // Si es admin o gerente, respetar la guardada o la asignada al usuario
          const guardadoId = localStorage.getItem('cotizador_sucursal_id');
          let seleccionada: Sucursal | undefined;

          if (guardadoId) {
            seleccionada = data.find(s => s.id === Number(guardadoId));
          }
          if (!seleccionada && user?.sucursalId) {
            seleccionada = data.find(s => s.id === user.sucursalId);
          }
          if (!seleccionada) {
            seleccionada = data[0];
          }

          setSucursalActivaState(seleccionada);
          localStorage.setItem('cotizador_sucursal_id', String(seleccionada.id));
        }
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setCargandoSucursales(false);
    }
  };

  // Re-evaluar sucursal cuando cambie el usuario o sus roles
  useEffect(() => {
    cargarSucursales();
  }, [user?.id, user?.rol, user?.sucursalId]);

  const setSucursalActiva = (sucursal: Sucursal) => {
    // Si no es admin ni gerente, no tiene permiso de cambiar de sucursal
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
        sucursales,
        sucursalActiva,
        setSucursalActiva,
        recargarSucursales: cargarSucursales,
        cargandoSucursales
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
