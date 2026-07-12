import React from "react";

interface DataPoint {
  name: string;
  value: number;
}

interface EmissionChartProps {
  data: DataPoint[];
}

export const EmissionChart: React.FC<EmissionChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
        No emissions logged yet.
      </div>
    );
  }

  // Calculate percentages and angles for donut chart
  let accumulatedPercent = 0;
  const sectors = data.map((item, idx) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;
    
    // Curated high-aesthetic color scheme
    const colors = [
      "stroke-emerald-500",
      "stroke-teal-500",
      "stroke-green-500",
      "stroke-cyan-500",
      "stroke-indigo-500",
      "stroke-blue-500"
    ];
    const fillColors = [
      "bg-emerald-500",
      "bg-teal-500",
      "bg-green-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-blue-500"
    ];
    
    const colorIdx = idx % colors.length;
    return {
      ...item,
      percent,
      startPercent,
      color: colors[colorIdx],
      bgColor: fillColors[colorIdx]
    };
  });

  // SVG parameters
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 select-none">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            className="stroke-slate-900"
            strokeWidth={strokeWidth}
          />
          {sectors.map((sector, idx) => {
            const strokeDashoffset = circumference - (sector.percent / 100) * circumference;
            const rotation = (sector.startPercent / 100) * 360;
            return (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                className={`transition-all duration-1000 ease-out hover:stroke-white ${sector.color}`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} 70 70)`}
                style={{
                  filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.15))"
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-100 tracking-tight">
            {total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            kg CO2e
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 w-full max-w-xs flex flex-col gap-3.5">
        {sectors.map((sector, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${sector.bgColor}`} />
                <span className="text-slate-300 truncate max-w-[120px]">{sector.name}</span>
              </div>
              <div className="text-right text-slate-400">
                <span className="text-slate-200">{sector.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
                <span className="text-[10px] ml-1.5 text-slate-500">({sector.percent.toFixed(1)}%)</span>
              </div>
            </div>
            {/* Miniature progress bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${sector.bgColor}`}
                style={{ width: `${sector.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
