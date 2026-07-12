import React from "react";

interface TrendPoint {
  month: string;
  emissions: number;
}

interface CarbonTrendChartProps {
  data: TrendPoint[];
}

export const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.emissions), 100);
  
  // Height configurations
  const graphHeight = 160;
  const paddingBottom = 25;
  const paddingTop = 15;
  const height = graphHeight + paddingBottom + paddingTop;
  
  return (
    <div className="w-full flex flex-col justify-end h-64">
      {/* SVG Chart Container */}
      <div className="relative flex-1 select-none">
        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={paddingTop} x2="500" y2={paddingTop} className="stroke-slate-900" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={paddingTop + graphHeight / 2} x2="500" y2={paddingTop + graphHeight / 2} className="stroke-slate-900" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={paddingTop + graphHeight} x2="500" y2={paddingTop + graphHeight} className="stroke-slate-800" strokeWidth="1.5" />

          {/* Render Bars */}
          {data.map((d, idx) => {
            const barCount = data.length;
            const widthPercent = 500 / barCount;
            const barWidth = widthPercent * 0.55;
            const x = idx * widthPercent + (widthPercent - barWidth) / 2;
            
            const pct = d.emissions / maxVal;
            const barHeight = Math.max(pct * graphHeight, 2); // At least 2px height
            const y = paddingTop + graphHeight - barHeight;

            return (
              <g key={idx} className="group cursor-pointer">
                {/* Visual glowing bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill="url(#barGradient)"
                  className="transition-all duration-300 group-hover:fill-emerald-400"
                />
                
                {/* Invisible hover helper for bigger target */}
                <rect
                  x={idx * widthPercent}
                  y={0}
                  width={widthPercent}
                  height={height}
                  fill="transparent"
                />

                {/* Value tooltip displayed on group hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={x + barWidth / 2 - 40}
                    y={Math.max(y - 30, 2)}
                    width="80"
                    height="22"
                    rx="4"
                    className="fill-slate-950 stroke-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(y - 15, 17)}
                    textAnchor="middle"
                    className="fill-emerald-400 text-[10px] font-bold"
                  >
                    {d.emissions.toFixed(0)} kg
                  </text>
                </g>

                {/* X axis labels */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + graphHeight + 18}
                  textAnchor="middle"
                  className="fill-slate-500 font-semibold text-[10px] uppercase tracking-wider group-hover:fill-slate-300 transition-colors"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
