import { Droplets, Wind, Ship, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

const roles: { key: Role; label: string; icon: React.ReactNode }[] = [
  { key: 'water', label: '水质员', icon: <Droplets size={18} /> },
  { key: 'dispatch', label: '调度员', icon: <Wind size={18} /> },
  { key: 'salvage', label: '打捞队', icon: <Ship size={18} /> }
];

export default function Header() {
  const { state, dispatch } = useApp();
  const activeWarnings = state.warnings.filter(w => w.status !== 'closed').length;

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
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Wind size={16} className="text-blue-200" />
            <div className="text-sm">
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
          </div>

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
    </header>
  );
}
