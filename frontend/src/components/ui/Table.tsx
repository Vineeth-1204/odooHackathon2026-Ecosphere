import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className = "", ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-[#E4E6DF] bg-white shadow-sm">
    <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => (
  <thead className={`bg-[#F3F5EF] text-xs font-bold text-[#90998C] uppercase tracking-wider border-b border-[#E4E6DF] ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => (
  <tbody className={`divide-y divide-[#E4E6DF] ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = "", ...props }) => (
  <tr className={`hover:bg-[#F3F5EF]/30 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => (
  <td className={`px-6 py-4 font-medium text-[#24333E] align-middle ${className}`} {...props}>
    {children}
  </td>
);

export const TableHeadCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => (
  <th className={`px-6 py-3.5 font-bold text-[#90998C] align-middle ${className}`} {...props}>
    {children}
  </th>
);
