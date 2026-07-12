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
      return "bg-[#EAF0EC] text-[#1F4032] border-[#1F4032]/10";
    }
    if (emissions < 1000) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-red-50 text-[#C1503A] border-red-100";
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E4E6DF] bg-white shadow-sm scrollbar-thin">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E4E6DF] bg-[#F3F5EF] text-[10px] font-bold text-[#90998C] uppercase tracking-widest select-none">
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
        <tbody className="divide-y divide-[#E4E6DF] text-xs text-[#24333E]">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={isAdminOrManager ? 8 : 7} className="px-5 py-12 text-center text-[#90998C]">
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
                <tr key={tx.id} className="hover:bg-[#F3F5EF]/30 transition-colors">
                  <td className="px-5 py-3.5 font-bold whitespace-nowrap">{formattedDate}</td>
                  <td className="px-5 py-3.5 max-w-xs truncate" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#90998C]">
                    {tx.emissionFactor?.name || "Unknown Factor"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold whitespace-nowrap">
                    {tx.activityValue} <span className="text-[10px] text-[#90998C]">{tx.emissionFactor?.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getEmissionsBadge(tx.emissions)}`}>
                      {tx.emissions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[#24333E] font-bold">{tx.department?.name || "Company"}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#90998C]">
                    {tx.user ? `${tx.user.firstName} ${tx.user.lastName.charAt(0)}.` : "System"}
                  </td>
                  {isAdminOrManager && (onEdit || onDelete) && (
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1 rounded bg-white hover:bg-[#F3F5EF] border border-[#E4E6DF] text-[#90998C] hover:text-[#24333E] transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="p-1 rounded bg-white hover:bg-red-50 border border-[#E4E6DF] text-[#90998C] hover:text-[#C1503A] transition-colors cursor-pointer"
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
