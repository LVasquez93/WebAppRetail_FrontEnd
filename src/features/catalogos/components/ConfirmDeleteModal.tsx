import React, { useEffect } from 'react';

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !eliminando) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, eliminando, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !eliminando) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
      >
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3" aria-hidden="true">
          ⚠️
        </div>
        <h3 id="confirm-delete-title" className="text-base font-bold text-gray-800 mb-1">
          ¿Confirmar Eliminación?
        </h3>
        <p id="confirm-delete-desc" className="text-xs text-gray-600 mb-4">
          ¿Estás seguro de que deseas desactivar el registro{' '}
          <strong className="text-gray-900">"{itemName}"</strong>?
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={eliminando}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={eliminando}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
          >
            {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
