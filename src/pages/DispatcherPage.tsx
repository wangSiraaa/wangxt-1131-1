import { useState } from 'react';
import { Wind, Ship, AlertTriangle, ClipboardList, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MonitorMap from '../components/MonitorMap';
import WarningList from '../components/WarningList';
import TaskCard from '../components/TaskCard';
import { TaskType } from '../types';

export default function DispatcherPage() {
  const { state, dispatch, createTask, canDispatchSalvage, canCloseWarning } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('aeration');
  const [selectedPoint, setSelectedPoint] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedWarningId, setSelectedWarningId] = useState<string | undefined>();

  const pendingTasks = state.tasks.filter(t => t.status === 'pending');
  const inProgressTasks = state.tasks.filter(t => t.status === 'in_progress');
  const completedTasks = state.tasks.filter(t => t.status === 'completed');
  const activeWarnings = state.warnings.filter(w => w.status !== 'closed');

  const handleCreateTask = () => {
    if (!selectedPoint || !taskDescription) return;

    if (taskType === 'salvage' && !state.windInfo.suitableForSalvage) {
      alert('当前风向条件不宜开展打捞作业，无法创建打捞任务');
      return;
    }

    const point = state.monitorPoints.find(p => p.id === selectedPoint);
    if (!point) return;

    const newTask = createTask({
      type: taskType,
      pointId: selectedPoint,
      pointName: point.name,
      priority: taskPriority,
      description: taskDescription,
      warningId: selectedWarningId
    });

    if (!newTask) {
      alert('任务创建失败，请检查风向条件');
      return;
    }

    if (selectedWarningId) {
      const warning = state.warnings.find(w => w.id === selectedWarningId);
      if (warning) {
        dispatch({
          type: 'UPDATE_WARNING',
          payload: {
            ...warning,
            status: 'processing',
            taskIds: [...warning.taskIds, newTask.id]
          }
        });
      }
    }

    setShowTaskModal(false);
    setSelectedPoint('');
    setTaskDescription('');
    setSelectedWarningId(undefined);
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

  const openTaskModal = (warningId?: string, type?: TaskType) => {
    if (type === 'salvage' && !state.windInfo.suitableForSalvage) {
      return;
    }
    if (type) {
      setTaskType(type);
    }
    if (warningId) {
      const warning = state.warnings.find(w => w.id === warningId);
      if (warning) {
        setSelectedPoint(warning.pointId);
        setSelectedWarningId(warningId);
      }
    }
    setShowTaskModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">调度指挥中心</h2>
          <p className="text-gray-500 mt-1">任务派发与预警处置调度</p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
        >
          <Plus size={18} />
          派发任务
        </button>
      </div>

      {!state.windInfo.suitableForSalvage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <div className="font-medium text-amber-800">当前风向条件不宜开展打捞作业</div>
            <div className="text-sm text-amber-600">
              风向：{state.windInfo.direction}，风速：{state.windInfo.speed} m/s。
              为确保作业安全，暂不支持派发打捞任务。可点击顶部风向信息进行设置。
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{pendingTasks.length}</div>
              <div className="text-sm text-gray-500">待处理任务</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wind size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{inProgressTasks.length}</div>
              <div className="text-sm text-gray-500">进行中任务</div>
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{completedTasks.length}</div>
              <div className="text-sm text-gray-500">已完成任务</div>
            </div>
          </div>
        </div>
      </div>

      <MonitorMap />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList size={18} />
                任务队列
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  待处理 {pendingTasks.length}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  进行中 {inProgressTasks.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">待分配</h4>
                  <div className="space-y-3">
                    {pendingTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {inProgressTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">进行中</h4>
                  <div className="space-y-3">
                    {inProgressTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingTasks.length === 0 && inProgressTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList size={48} className="mx-auto mb-2 opacity-50" />
                  <p>暂无待处理任务</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              活跃预警
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-3">
              <WarningList
                warnings={activeWarnings}
                onClose={handleCloseWarning}
                onRecheck={(id) => alert(`安排复测功能：${id}`)}
                canCloseFn={canCloseWarning}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">调度规则</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 藻密度 ≥ {state.densityThreshold} 万个/L 触发预警</li>
              <li>• 风向不适宜时不可派发打捞任务</li>
              <li>• 处理后需复测合格方可关闭预警</li>
              <li>• 紧急预警优先安排处理</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">快捷操作</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openTaskModal(undefined, 'aeration')}
                className="flex flex-col items-center gap-1 p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
              >
                <Wind size={24} className="text-cyan-600" />
                <span className="text-sm text-cyan-700">派发曝气</span>
              </button>
              <button
                onClick={() => {
                  if (state.windInfo.suitableForSalvage) {
                    openTaskModal(undefined, 'salvage');
                  }
                }}
                disabled={!state.windInfo.suitableForSalvage}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  state.windInfo.suitableForSalvage
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-gray-100 cursor-not-allowed opacity-60'
                }`}
              >
                <Ship size={24} className={state.windInfo.suitableForSalvage ? 'text-amber-600' : 'text-gray-400'} />
                <span className={`text-sm ${state.windInfo.suitableForSalvage ? 'text-amber-700' : 'text-gray-400'}`}>
                  派发打捞
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                派发{taskType === 'aeration' ? '曝气' : '打捞'}任务
              </h3>
              <p className="text-blue-100 text-sm">填写任务详情后下发执行</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTaskType('aeration')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                      taskType === 'aeration'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Wind size={18} />
                    曝气作业
                  </button>
                  <button
                    onClick={() => {
                      if (state.windInfo.suitableForSalvage) {
                        setTaskType('salvage');
                      }
                    }}
                    disabled={!state.windInfo.suitableForSalvage}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                      taskType === 'salvage'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : state.windInfo.suitableForSalvage
                        ? 'border-gray-200 text-gray-600 hover:border-gray-300'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Ship size={18} />
                    打捞作业
                    {!state.windInfo.suitableForSalvage && <AlertCircle size={14} />}
                  </button>
                </div>
                {!state.windInfo.suitableForSalvage && taskType === 'salvage' && (
                  <p className="mt-1 text-xs text-amber-600">
                    当前风向条件不宜开展打捞作业，请切换至曝气或调整风向条件
                  </p>
                )}
                {!state.windInfo.suitableForSalvage && taskType !== 'salvage' && (
                  <p className="mt-1 text-xs text-gray-500">
                    当前风向不宜打捞，如需请点击顶部风向信息进行调整
                  </p>
                )}
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setTaskPriority(p)}
                      className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                        taskPriority === p
                          ? p === 'high'
                            ? 'bg-red-100 text-red-700'
                            : p === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                <textarea
                  value={taskDescription}
                  onChange={e => setTaskDescription(e.target.value)}
                  placeholder="请输入任务描述和具体要求"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {selectedWarningId && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700">
                    关联预警：{state.warnings.find(w => w.id === selectedWarningId)?.pointName}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedPoint('');
                  setTaskDescription('');
                  setSelectedWarningId(undefined);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!selectedPoint || !taskDescription || (taskType === 'salvage' && !state.windInfo.suitableForSalvage)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPoint && taskDescription && (taskType !== 'salvage' || state.windInfo.suitableForSalvage)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {taskType === 'salvage' && !state.windInfo.suitableForSalvage ? '风向不宜' : '派发任务'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
