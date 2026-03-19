/**
 * DataTable Component
 * Tabla de datos con ordenamiento, filtros y paginación
 */
import React, { useState, useMemo } from 'react';
import Badge from './Badge';

const DataTable = ({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortable = true,
  onSort,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {selectable && (
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/20"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${
                  column.sortable !== false && sortable ? 'cursor-pointer hover:text-white' : ''
                } ${column.className || ''}`}
                onClick={() => handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-1">
                  {column.title}
                  {sortable && column.sortable !== false && sortConfig.key === column.key && (
                    <span className="text-violet-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={keyExtractor ? keyExtractor(row) : index}
                className={`hover:bg-white/5 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(keyExtractor ? keyExtractor(row) : index)}
                      onChange={() => onSelectRow?.(keyExtractor ? keyExtractor(row) : index)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/20"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className={`py-3 px-4 ${column.cellClassName || ''}`}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
