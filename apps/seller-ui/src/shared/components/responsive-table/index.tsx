"use client";

import React from 'react';
import { flexRender, Table } from '@tanstack/react-table';

interface ResponsiveTableProps {
  table: Table<any>;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ table, className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 border-b border-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 font-semibold text-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-700 hover:bg-gray-750 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="border-b border-gray-700 p-4 hover:bg-gray-900 transition">
            <div className="space-y-3">
              {row.getVisibleCells().map((cell) => {
                const column = cell.column.columnDef;
                const header = typeof column.header === 'string' ? column.header : 'Field';
                
                return (
                  <div key={cell.id} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-400 min-w-0 flex-1">
                      {header}:
                    </span>
                    <div className="text-sm text-white min-w-0 flex-1 text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;