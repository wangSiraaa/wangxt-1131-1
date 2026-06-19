import { useMemo } from 'react';
import { TrendingUp, Droplets } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DensityTrendChartProps {
  pointId: string;
  pointName: string;
}

export default function DensityTrendChart({ pointId, pointName }: DensityTrendChartProps) {
  const { state, getPointRecords, getTreatmentTimePoints } = useApp();

  const records = useMemo(() => getPointRecords(pointId), [pointId, state.algaeRecords]);
  const treatments = useMemo(() => getTreatmentTimePoints(pointId), [pointId, state.tasks]);

  const chartData = useMemo(() => {
    if (records.length === 0) return null;

    const maxDensity = Math.max(...records.map(r => r.density), state.densityThreshold, state.emergencyThreshold);
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const yMax = Math.ceil(maxDensity / 500) * 500 + 500;

    const points = records.map((r, i) => {
      const x = padding.left + (records.length > 1 ? (i / (records.length - 1)) * plotWidth : plotWidth / 2);
      const y = padding.top + plotHeight - (r.density / yMax) * plotHeight;
      return { ...r, x, y };
    });

    const thresholdY = padding.top + plotHeight - (state.densityThreshold / yMax) * plotHeight;
    const emergencyY = padding.top + plotHeight - (state.emergencyThreshold / yMax) * plotHeight;

    const treatmentLines = treatments.map(t => {
      const tIdx = records.findIndex(r => new Date(r.measureTime) >= new Date(t.time));
      if (tIdx === -1) return null;
      const x = tIdx > 0
        ? padding.left + (tIdx / (records.length - 1)) * plotWidth
        : padding.left;
      return { x, label: t.label, time: t.time };
    }).filter(Boolean) as { x: number; label: string; time: string }[];

    const yTicks = [];
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const val = (yMax / tickCount) * i;
      const y = padding.top + plotHeight - (val / yMax) * plotHeight;
      yTicks.push({ val: Math.round(val), y });
    }

    return {
      points,
      thresholdY,
      emergencyY,
      treatmentLines,
      yTicks,
      padding,
      plotWidth,
      plotHeight,
      chartWidth,
      chartHeight,
      yMax
    };
  }, [records, treatments, state.densityThreshold, state.emergencyThreshold]);

  if (!chartData || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <TrendingUp size={48} className="mb-2 opacity-50" />
        <p>暂无趋势数据</p>
      </div>
    );
  }

  const { points, thresholdY, emergencyY, treatmentLines, yTicks, padding, plotWidth, plotHeight, chartWidth, chartHeight, yMax } = chartData;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          {pointName} - 藻密度历史趋势
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-orange-400 inline-block"></span>
            预警阈值
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-400 inline-block"></span>
            紧急阈值
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-green-500 inline-block border-dashed"></span>
            处置标记
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: 500 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {yTicks.map(tick => (
            <g key={tick.val}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={padding.left + plotWidth}
                y2={tick.y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-400"
              >
                {tick.val}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            y1={thresholdY}
            x2={padding.left + plotWidth}
            y2={thresholdY}
            stroke="#fb923c"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text
            x={padding.left + plotWidth + 4}
            y={thresholdY + 4}
            className="text-[10px] fill-orange-400"
          >
            {state.densityThreshold}
          </text>

          <line
            x1={padding.left}
            y1={emergencyY}
            x2={padding.left + plotWidth}
            y2={emergencyY}
            stroke="#f87171"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text
            x={padding.left + plotWidth + 4}
            y={emergencyY + 4}
            className="text-[10px] fill-red-400"
          >
            {state.emergencyThreshold}
          </text>

          {treatmentLines.map((tl, idx) => (
            <g key={idx}>
              <line
                x1={tl.x}
                y1={padding.top}
                x2={tl.x}
                y2={padding.top + plotHeight}
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <rect
                x={tl.x - 28}
                y={padding.top + plotHeight + 4}
                width={56}
                height={16}
                rx={3}
                fill="#dcfce7"
                stroke="#bbf7d0"
              />
              <text
                x={tl.x}
                y={padding.top + plotHeight + 15}
                textAnchor="middle"
                className="text-[8px] fill-green-700 font-medium"
              >
                {tl.label}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => {
            const isAboveThreshold = p.density >= state.densityThreshold;
            const isEmergency = p.density >= state.emergencyThreshold;
            return (
              <g key={i}>
                {isAboveThreshold && (
                  <circle cx={p.x} cy={p.y} r={6} fill={isEmergency ? '#fca5a5' : '#fdba74'} opacity={0.3} />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={isEmergency ? '#ef4444' : isAboveThreshold ? '#f97316' : '#3b82f6'}
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-[9px] fill-gray-600 font-medium"
                >
                  {p.density}
                </text>
                <text
                  x={p.x}
                  y={padding.top + plotHeight + 15}
                  textAnchor="middle"
                  className="text-[9px] fill-gray-400"
                >
                  {p.measureTime.slice(5, 10)}
                </text>
              </g>
            );
          })}

          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Droplets size={14} className="text-blue-400" />
        <span>单位：万个/L | 共 {records.length} 条记录</span>
        {treatments.length > 0 && (
          <span className="text-green-600">| 已完成 {treatments.length} 次处置</span>
        )}
      </div>
    </div>
  );
}
