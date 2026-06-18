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
    return { ...point, density, level };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">监测点分布</h3>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          正常
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          关注
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          预警
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          紧急
        </span>
      </div>
    </div>

      <div className="relative h-80 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 400 320">
            <defs>
              <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M0 20 Q10 15 20 20 T40 20" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.5"/>
              </pattern>
            </defs>
            <path d="M50 50 Q100 30 200 40 Q300 50 350 80 Q380 120 360 180 Q340 250 280 280 Q200 300 120 280 Q60 260 40 200 Q20 140 50 50Z"
                  fill="url(#waterPattern)" stroke="#3b82f6" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>

        {pointsWithStatus.map((point, index) => {
          const positions = [
            { left: '50%', top: '45%' },
            { left: '75%', top: '35%' },
            { left: '25%', top: '55%' },
            { left: '60%', top: '20%' },
            { left: '65%', top: '70%' }
          ];
          const pos = positions[index % positions.length];

          return (
            <div
              key={point.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className={`relative`}>
                <div className={`w-4 h-4 rounded-full ${getLevelColor(point.level)} shadow-lg shadow-current animate-pulse`}></div>
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
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-40">
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
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow">
          <div>共 {state.monitorPoints.length} 个监测点</div>
          <div className="text-red-500 font-medium">
            预警：{state.warnings.filter(w => w.status !== 'closed').length} 个</div>
        </div>
      </div>
    </div>
  );
}
