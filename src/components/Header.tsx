import { useState } from 'react';
import { Droplets, Wind, Ship, Bell, RefreshCw, Settings, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

const roles: { key: Role; label: string; icon: React.ReactNode }[] = [
  { key: 'water', label: '水质员', icon: <Droplets size={18} /> },
  { key: 'dispatch', label: '调度员', icon: <Wind size={18} /> },
  { key: 'salvage', label: '打捞队', icon: <Ship size={18} /> }
];

const WIND_DIRECTIONS = ['东风', '南风', '西风', '北风', '东南风', '东北风', '西南风', '西北风'];

export default function Header() {
  const { state, dispatch, toggleWindSuitability, updateWindInfo } = useApp();
  const [showWindPanel, setShowWindPanel] = useState(false);
  const [editDirection, setEditDirection] = useState(state.windInfo.direction);
  const [editSpeed, setEditSpeed] = useState(String(state.windInfo.speed));
  const [editSuitable, setEditSuitable] = useState(state.windInfo.suitableForSalvage);
  const activeWarnings = state.warnings.filter(w => w.status !== 'closed').length;

  const openWindPanel = () => {
    setEditDirection(state.windInfo.direction);
    setEditSpeed(String(state.windInfo.speed));
    setEditSuitable(state.windInfo.suitableForSalvage);
    setShowWindPanel(true);
  };

  const handleSaveWind = () => {
    updateWindInfo({
      direction: editDirection,
      speed: Number(editSpeed),
      suitableForSalvage: editSuitable
    });
    setShowWindPanel(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Droplets size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">水库蓝藻监测处置系统</h1>
            <p className="text-xs text-blue-100">Reservoir Cyanobacteria Monitoring & Disposal</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={openWindPanel}
            className="group flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            title="点击设置风向条件"
          >
            <Wind size={16} className="text-blue-200" />
            <div className="text-sm text-left">
              <span className="text-blue-100">风向：</span>
              <span className="font-medium">{state.windInfo.direction}</span>
              <span className="text-blue-200 ml-2">{state.windInfo.speed} m/s</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              state.windInfo.suitableForSalvage
                ? 'bg-green-400/30 text-green-100'
                : 'bg-red-400/30 text-red-100'
            }`}>
              {state.windInfo.suitableForSalvage ? '适宜打捞' : '不宜打捞'}
            </span>
            <Settings size={14} className="text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
          </button>

          <div className="relative">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            {activeWarnings > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {activeWarnings}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {roles.map(role => (
              <button
                key={role.key}
                onClick={() => dispatch({ type: 'SET_ROLE', payload: role.key })}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  state.currentRole === role.key
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                {role.icon}
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showWindPanel && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50" onClick={() => setShowWindPanel(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in slide-in-from-top-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wind size={20} />
                  风向条件设置
                </h3>
                <p className="text-blue-100 text-sm mt-0.5">设置当前风向、风速及打捞作业适宜性</p>
              </div>
              <button
                onClick={() => setShowWindPanel(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">风向</label>
                <select
                  value={editDirection}
                  onChange={e => setEditDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {WIND_DIRECTIONS.map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">风速（m/s）</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editSpeed}
                  onChange={e => setEditSpeed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">打捞作业适宜性</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditSuitable(true)}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors font-medium ${
                      editSuitable
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    ✅ 适宜打捞
                  </button>
                  <button
                    onClick={() => setEditSuitable(false)}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors font-medium ${
                      !editSuitable
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    ⛔ 不宜打捞
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={toggleWindSuitability}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                  随机切换风向条件（模拟气象变化）
                </button>
              </div>

              {!editSuitable && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">提示：</span>
                    设置为"不宜打捞"后，调度指挥中心将无法派发打捞任务，直至风向条件改善。
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowWindPanel(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveWind}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
