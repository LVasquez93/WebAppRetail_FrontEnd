import React from 'react';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  ariaLabel?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 5,
  rows = 6,
  ariaLabel = 'Cargando registros...'
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className="w-full animate-pulse p-4 space-y-4"
    >
      <div className="sr-only">{ariaLabel}</div>

      {/* Encabezado simulado */}
      <div className="h-10 bg-gray-100 rounded-lg flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 rounded ${
              i === 0 ? 'w-10' : i === 1 ? 'w-1/3' : 'flex-1'
            }`}
          />
        ))}
      </div>

      {/* Filas simuladas */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="h-12 bg-gray-50 rounded-lg flex items-center px-4 gap-4 border border-gray-100"
          >
            <div className="h-4 w-8 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded" />
            <div className="h-7 w-20 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
