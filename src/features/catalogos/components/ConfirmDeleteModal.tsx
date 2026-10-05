import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  eliminando: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  itemName,
  eliminando,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          ⚠️
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Confirmar Eliminación?</h3>
        <p className="text-xs text-gray-600 mb-4">
          ¿Estás seguro de que deseas desactivar el registro{' '}
          <strong className="text-gray-900">"{itemName}"</strong>?
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={eliminando}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={eliminando}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
          >
            {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
