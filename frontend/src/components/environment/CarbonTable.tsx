import React from "react";
import { Edit, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  date: string | Date;
  description: string;
  activityValue: number;
  emissions: number;
  emissionFactor: {
    name: string;
    unit: string;
  };
  department: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

interface CarbonTableProps {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  isAdminOrManager?: boolean;
}

export const CarbonTable: React.FC<CarbonTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  isAdminOrManager = false
}) => {
  // Helper to color code emissions impact
  const getEmissionsBadge = (emissions: number) => {
    if (emissions < 100) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (emissions < 1000) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-900 bg-slate-950/20 scrollbar-thin">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-900/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Description</th>
            <th className="px-5 py-4">Category/Factor</th>
            <th className="px-5 py-4 text-right">Quantity</th>
            <th className="px-5 py-4 text-right">Emissions (kg CO2e)</th>
            <th className="px-5 py-4">Department</th>
            <th className="px-5 py-4">Logged By</th>
            {isAdminOrManager && (onEdit || onDelete) && <th className="px-5 py-4 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={isAdminOrManager ? 8 : 7} className="px-5 py-12 text-center text-slate-500">
                No transaction records found.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const formattedDate = new Date(tx.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap">{formattedDate}</td>
                  <td className="px-5 py-3.5 max-w-xs truncate" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                    {tx.emissionFactor?.name || "Unknown Factor"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium whitespace-nowrap">
                    {tx.activityValue} <span className="text-[10px] text-slate-500">{tx.emissionFactor?.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getEmissionsBadge(tx.emissions)}`}>
                      {tx.emissions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-slate-400 font-semibold">{tx.department?.name || "Company"}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                    {tx.user ? `${tx.user.firstName} ${tx.user.lastName.charAt(0)}.` : "System"}
                  </td>
                  {isAdminOrManager && (onEdit || onDelete) && (
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default CarbonTable;
