import { useState } from 'react';
import { Droplets, Plus, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MonitorMap from '../components/MonitorMap';
import WarningList from '../components/WarningList';
import { AlgaeRecord, RecheckRecord } from '../types';

export default function WaterQualityPage() {
  const { state, dispatch, getWarningLevel, createWarning, getLatestDensity, canCloseWarning } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState('');
  const [density, setDensity] = useState('');
  const [remark, setRemark] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'warnings' | 'rechecks'>('records');
  const [currentWarningId, setCurrentWarningId] = useState('');
  const [recheckDensity, setRecheckDensity] = useState('');
  const [recheckRemark, setRecheckRemark] = useState('');

  const handleSubmit = () => {
    if (!selectedPoint || !density) return;

    const point = state.monitorPoints.find(p => p.id === selectedPoint);
    if (!point) return;

    const newRecord: AlgaeRecord = {
      id: `ar${Date.now()}`,
      pointId: selectedPoint,
      pointName: point.name,
      density: Number(density),
      measureTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: '张水质',
      remark: remark || undefined
    };

    dispatch({ type: 'ADD_ALGAE_RECORD', payload: newRecord });

    const level = getWarningLevel(Number(density));
    if (level !== 'normal') {
      createWarning(newRecord);
    }

    setShowAddModal(false);
    setSelectedPoint('');
    setDensity('');
    setRemark('');
  };

  const getLevelBadge = (density: number) => {
    const level = getWarningLevel(density);
    const colors = {
      normal: 'bg-green-100 text-green-700',
      attention: 'bg-yellow-100 text-yellow-700',
      warning: 'bg-orange-100 text-orange-700',
      emergency: 'bg-red-100 text-red-700'
    };
    const labels = {
      normal: '正常',
      attention: '关注',
      warning: '预警',
      emergency: '紧急'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const activeWarnings = state.warnings.filter(w => w.status !== 'closed');

  const handleRecheck = (warningId: string) => {
    const warning = state.warnings.find(w => w.id === warningId);
    if (!warning) return;
    setCurrentWarningId(warningId);
    setSelectedPoint(warning.pointId);
    setShowRecheckModal(true);
  };

  const handleSubmitRecheck = () => {
    if (!currentWarningId || !recheckDensity) return;

    const warning = state.warnings.find(w => w.id === currentWarningId);
    if (!warning) return;

    const densityNum = Number(recheckDensity);
    const passed = densityNum < state.densityThreshold;

    const recheckRecord: RecheckRecord = {
      id: `rc${Date.now()}`,
      warningId: currentWarningId,
      pointId: warning.pointId,
      pointName: warning.pointName,
      density: densityNum,
      measureTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: '张水质',
      passed,
      remark: recheckRemark || undefined
    };

    dispatch({ type: 'ADD_RECHECK_RECORD', payload: recheckRecord });

    const updatedWarning = {
      ...warning,
      recheckCount: warning.recheckCount + 1,
      latestRecheckId: recheckRecord.id,
      status: passed ? 'rechecking' as const : 'processing' as const
    };

    dispatch({ type: 'UPDATE_WARNING', payload: updatedWarning });

    setShowRecheckModal(false);
    setCurrentWarningId('');
    setRecheckDensity('');
    setRecheckRemark('');
  };

  const handleCloseWarning = (warningId: string) => {
    if (!canCloseWarning(warningId)) return;

    const warning = state.warnings.find(w => w.id === warningId);
    if (!warning) return;

    dispatch({
      type: 'UPDATE_WARNING',
      payload: {
        ...warning,
        status: 'closed',
        closeTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">水质监测台</h2>
          <p className="text-gray-500 mt-1">负责监测点藻密度数据录入与预警上报</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
        >
          <Plus size={18} />
          录入藻密度
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{state.monitorPoints.length}</div>
              <div className="text-sm text-gray-500">监测点数量</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{state.algaeRecords.length}</div>
              <div className="text-sm text-gray-500">监测记录</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{activeWarnings.length}</div>
              <div className="text-sm text-gray-500">活跃预警</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{state.recheckRecords.length}</div>
              <div className="text-sm text-gray-500">复测记录</div>
            </div>
          </div>
        </div>
      </div>

      <MonitorMap />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  监测记录
                </button>
                <button
                  onClick={() => setActiveTab('warnings')}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'warnings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  预警记录
                  {activeWarnings.length > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeWarnings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('rechecks')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'rechecks'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  复测记录
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {activeTab === 'records' ? (
                <div className="space-y-3">
                  {state.algaeRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Droplets size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{record.pointName}</div>
                          <div className="text-xs text-gray-500">
                            {record.measureTime} · {record.operator}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-800">{record.density}</div>
                          <div className="text-xs text-gray-500">万个/L</div>
                        </div>
                        {getLevelBadge(record.density)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'warnings' ? (
                <WarningList
                  warnings={activeWarnings}
                  onRecheck={handleRecheck}
                  onClose={handleCloseWarning}
                  canCloseFn={canCloseWarning}
                  showActions={true}
                />
              ) : (
                <div className="space-y-3">
                  {state.recheckRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <RefreshCw size={48} className="mx-auto mb-2 opacity-50" />
                      <p>暂无复测记录</p>
                    </div>
                  ) : (
                    state.recheckRecords.map(record => (
                      <div
                        key={record.id}
                        className={`p-3 rounded-lg border ${
                          record.passed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{record.pointName}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            record.passed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.passed ? '复测合格' : '复测不合格'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">藻密度：{record.density} 万个/L</span>
                          <span className="text-gray-500 text-xs">
                            {record.measureTime} · {record.operator}
                          </span>
                        </div>
                        {record.remark && (
                          <p className="text-xs text-gray-500 mt-1">备注：{record.remark}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">监测点状态</h3>
            <div className="space-y-2">
              {state.monitorPoints.map(point => {
                const density = getLatestDensity(point.id);
                const level = density ? getWarningLevel(density) : 'normal';
                const levelColors = {
                  normal: 'bg-green-500',
                  attention: 'bg-yellow-500',
                  warning: 'bg-orange-500',
                  emergency: 'bg-red-500'
                };

                return (
                  <div key={point.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${levelColors[level]}`}></span>
                      <span className="text-sm text-gray-700">{point.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {density ?? '--'} 万个/L
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">操作指引</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 定期录入各监测点藻密度数据</li>
              <li>• 超过阈值自动触发预警</li>
              <li>• 关注预警处理进度</li>
              <li>• 处理完成后进行复测确认</li>
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">录入藻密度</h3>
              <p className="text-blue-100 text-sm">填写监测点藻密度数据</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">监测点</label>
                <select
                  value={selectedPoint}
                  onChange={e => setSelectedPoint(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择监测点</option>
                  {state.monitorPoints.map(point => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  藻密度（万个/L）
                </label>
                <input
                  type="number"
                  value={density}
                  onChange={e => setDensity(e.target.value)}
                  placeholder="请输入藻密度数值"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {density && (
                  <div className="mt-1 text-xs">
                    {getLevelBadge(Number(density))}
                    <span className="text-gray-500 ml-2">
                      阈值：{state.densityThreshold} 万个/L
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="可选：填写备注信息"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPoint || !density}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPoint && density
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecheckModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">预警复测</h3>
              <p className="text-cyan-100 text-sm">对预警监测点进行复检</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">监测点</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                  {state.warnings.find(w => w.id === currentWarningId)?.pointName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  复测藻密度（万个/L）
                </label>
                <input
                  type="number"
                  value={recheckDensity}
                  onChange={e => setRecheckDensity(e.target.value)}
                  placeholder="请输入复测藻密度数值"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {recheckDensity && (
                  <div className="mt-1 text-xs">
                    {getLevelBadge(Number(recheckDensity))}
                    <span className="text-gray-500 ml-2">
                      阈值：{state.densityThreshold} 万个/L
                    </span>
                    {Number(recheckDensity) < state.densityThreshold && (
                      <span className="text-green-600 ml-2 font-medium">合格</span>
                    )}
                    {Number(recheckDensity) >= state.densityThreshold && (
                      <span className="text-red-600 ml-2 font-medium">不合格</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">复测备注</label>
                <textarea
                  value={recheckRemark}
                  onChange={e => setRecheckRemark(e.target.value)}
                  placeholder="可选：填写复测情况说明"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">注意：</span>
                  复测合格后，调度员方可关闭该预警。
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRecheckModal(false);
                  setCurrentWarningId('');
                  setRecheckDensity('');
                  setRecheckRemark('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRecheck}
                disabled={!recheckDensity}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  recheckDensity
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                提交复测
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
