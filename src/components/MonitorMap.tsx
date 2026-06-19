import { useApp } from '../context/AppContext';
import { WarningLevel } from '../types';

export default function MonitorMap() {
  const { state, getWarningLevel, getLatestDensity } = useApp();

  const getLevelColor = (level: WarningLevel) => {
    switch (level) {
      case 'emergency': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'attention': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getLevelText = (level: WarningLevel) => {
    switch (level) {
      case 'emergency': return '紧急';
      case 'warning': return '预警';
      case 'attention': return '关注';
      default: return '正常';
    }
  };

  const pointsWithStatus = state.monitorPoints.map(point => {
    const density = getLatestDensity(point.id);
    const level = density ? getWarningLevel(density) : 'normal';
    const downstreamIntakes = state.waterIntakes.filter(wi =>
      point.downstreamIntakeIds.includes(wi.id)
    );
    return { ...point, density, level, downstreamIntakes };
  });

  const pointPositions = [
    { left: '50%', top: '45%' },
    { left: '75%', top: '35%' },
    { left: '25%', top: '55%' },
    { left: '60%', top: '20%' },
    { left: '65%', top: '70%' }
  ];

  const intakePositions = [
    { left: '38%', top: '25%' },
    { left: '55%', top: '62%' },
    { left: '82%', top: '50%' }
  ];

  const pointPosMap = new Map<string, { left: string; top: string }>();
  pointsWithStatus.forEach((point, index) => {
    pointPosMap.set(point.id, pointPositions[index % pointPositions.length]);
  });

  const intakePosMap = new Map<string, { left: string; top: string }>();
  state.waterIntakes.forEach((intake, index) => {
    intakePosMap.set(intake.id, intakePositions[index % intakePositions.length]);
  });

  const hasAffectedIntake = state.waterIntakes.some(wi => wi.status === 'affected');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">监测点与取水口分布</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            正常
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            预警
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            紧急
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
            取水口
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-0.5 bg-red-300 border-t border-dashed border-red-400"></span>
            下游联动
          </span>
        </div>
      </div>

      <div className="relative h-80 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M0 20 Q10 15 20 20 T40 20" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
            </marker>
          </defs>
          <path d="M50 50 Q100 30 200 40 Q300 50 350 80 Q380 120 360 180 Q340 250 280 280 Q200 300 120 280 Q60 260 40 200 Q20 140 50 50Z"
                fill="url(#waterPattern)" stroke="#3b82f6" strokeWidth="2" opacity="0.6"/>

          {pointsWithStatus.map(point => {
            const pos = pointPosMap.get(point.id);
            if (!pos) return null;
            const px = parseFloat(pos.left) / 100 * 400;
            const py = parseFloat(pos.top) / 100 * 320;

            return point.downstreamIntakeIds.map(intakeId => {
              const intakePos = intakePosMap.get(intakeId);
              if (!intakePos) return null;
              const ix = parseFloat(intakePos.left) / 100 * 400;
              const iy = parseFloat(intakePos.top) / 100 * 320;

              const isAffected = state.waterIntakes.find(wi => wi.id === intakeId)?.status === 'affected';

              return (
                <line
                  key={`${point.id}-${intakeId}`}
                  x1={px}
                  y1={py}
                  x2={ix}
                  y2={iy}
                  stroke={isAffected ? '#ef4444' : '#93c5fd'}
                  strokeWidth={isAffected ? 2 : 1}
                  strokeDasharray={isAffected ? '6 3' : '4 4'}
                  opacity={isAffected ? 0.8 : 0.5}
                  markerEnd={isAffected ? 'url(#arrowRed)' : undefined}
                />
              );
            });
          })}
        </svg>

        {pointsWithStatus.map((point, index) => {
          const pos = pointPositions[index % pointPositions.length];
          return (
            <div
              key={point.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: pos.left, top: pos.top, zIndex: 2 }}
            >
              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${getLevelColor(point.level)} shadow-lg animate-pulse`}></div>
                <div className={`absolute inset-0 w-4 h-4 rounded-full ${getLevelColor(point.level)} opacity-50 animate-ping`}></div>
              </div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm">
                  {point.name}
                </span>
                {point.density && (
                  <div className={`text-xs text-center mt-1 px-2 py-0.5 rounded ${getLevelColor(point.level)} text-white font-medium`}>
                    {point.density} 万个/L
                  </div>
                )}
              </div>

              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-44">
                  <div className="font-medium mb-1">{point.name}</div>
                  <div className="text-gray-300 text-xs mb-2">{point.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">状态：</span>
                    <span className={`font-medium ${
                      point.level === 'normal' ? 'text-green-400' :
                      point.level === 'attention' ? 'text-yellow-400' :
                      point.level === 'warning' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {getLevelText(point.level)}
                    </span>
                  </div>
                  {point.density && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400">藻密度：</span>
                      <span className="font-medium">{point.density} 万个/L</span>
                    </div>
                  )}
                  {point.downstreamIntakes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-gray-400">下游取水口：</span>
                      <div className="mt-1 space-y-0.5">
                        {point.downstreamIntakes.map(wi => (
                          <div key={wi.id} className="flex items-center justify-between">
                            <span>{wi.name}</span>
                            <span className={wi.status === 'affected' ? 'text-red-400' : 'text-green-400'}>
                              {wi.status === 'affected' ? '受影响' : '正常'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {state.waterIntakes.map((intake, index) => {
          const pos = intakePositions[index % intakePositions.length];
          return (
            <div
              key={intake.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: pos.left, top: pos.top, zIndex: 2 }}
            >
              <div className={`w-5 h-5 rounded-sm shadow-md flex items-center justify-center ${
                intake.status === 'affected'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-blue-500'
              }`}>
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white">
                  <path d="M6 1 L6 8 M4 6 L6 8 L8 6 M3 9 L9 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className={`text-xs font-medium px-2 py-1 rounded shadow-sm ${
                  intake.status === 'affected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {intake.name}
                </span>
                <div className={`text-xs text-center mt-1 px-2 py-0.5 rounded font-medium ${
                  intake.status === 'affected'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {intake.status === 'affected' ? '受影响' : '正常'}
                </div>
              </div>

              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-40">
                  <div className="font-medium mb-1">{intake.name}</div>
                  <div className="text-gray-300 text-xs mb-2">{intake.orgName}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">状态：</span>
                    <span className={intake.status === 'affected' ? 'text-red-400 font-medium' : 'text-green-400'}>
                      {intake.status === 'affected' ? '受影响' : '正常'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow" style={{ zIndex: 3 }}>
          <div>监测点 {state.monitorPoints.length} 个 | 取水口 {state.waterIntakes.length} 个</div>
          <div className="text-red-500 font-medium">
            预警：{state.warnings.filter(w => w.status !== 'closed').length} 个
            {hasAffectedIntake && ' | 受影响取水口'}
          </div>
        </div>
      </div>
    </div>
  );
}
