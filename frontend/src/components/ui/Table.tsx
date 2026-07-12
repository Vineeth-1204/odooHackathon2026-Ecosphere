import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className = "", ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/20">
    <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => (
  <thead className={`bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => (
  <tbody className={`divide-y divide-slate-900/80 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = "", ...props }) => (
  <tr className={`hover:bg-slate-900/30 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => (
  <td className={`px-6 py-4 font-normal text-slate-300 align-middle ${className}`} {...props}>
    {children}
  </td>
);

export const TableHeadCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => (
  <th className={`px-6 py-3.5 font-semibold text-slate-400 align-middle ${className}`} {...props}>
    {children}
  </th>
);
