import { useState } from 'react';
import { Ship, CheckCircle, Clock, AlertTriangle, FileText, Camera, X, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MonitorMap from '../components/MonitorMap';
import TaskCard from '../components/TaskCard';

export default function SalvageTeamPage() {
  const { state, dispatch, canDispatchSalvage } = useApp();
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState('');
  const [resultText, setResultText] = useState('');
  const [resultPhotos, setResultPhotos] = useState<string[]>([]);

  const pendingTasks = state.tasks.filter(t => t.status === 'pending');
  const inProgressTasks = state.tasks.filter(t => t.status === 'in_progress');
  const completedTasks = state.tasks.filter(t => t.status === 'completed');

  const myTasks = state.tasks.filter(t => t.assignee === '王队员');

  const handleStartTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'pending') return;

    if (task.type === 'salvage' && !state.windInfo.suitableForSalvage) {
      alert('当前风向条件不适合打捞作业');
      return;
    }

    const updatedTask = {
      ...task,
      status: 'in_progress' as const,
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignee: '王队员'
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

    if (task.warningId) {
      const warning = state.warnings.find(w => w.id === task.warningId);
      if (warning && warning.status === 'active') {
        dispatch({
          type: 'UPDATE_WARNING',
          payload: { ...warning, status: 'processing' }
        });
      }
    }
  };

  const openResultModal = (taskId: string) => {
    setCurrentTaskId(taskId);
    setResultPhotos([]);
    setResultText('');
    setShowResultModal(true);
  };

  const handleAddPhoto = () => {
    const newPhoto = `photo_${Date.now()}.jpg`;
    setResultPhotos(prev => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setResultPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteTask = () => {
    if (!currentTaskId || !resultText.trim() || resultPhotos.length === 0) return;

    const task = state.tasks.find(t => t.id === currentTaskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: 'completed' as const,
      finishTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      result: resultText,
      photos: resultPhotos
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

    if (task.warningId) {
      const warning = state.warnings.find(w => w.id === task.warningId);
      if (warning) {
        dispatch({
          type: 'UPDATE_WARNING',
          payload: { ...warning, status: 'rechecking' }
        });
      }
    }

    setShowResultModal(false);
    setCurrentTaskId('');
    setResultText('');
    setResultPhotos([]);
  };

  const canSalvage = canDispatchSalvage();

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'aeration': return '曝气';
      case 'salvage': return '打捞';
      case 'enclosure': return '围隔';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">处置作业平台</h2>
          <p className="text-gray-500 mt-1">接收并执行蓝藻处置任务</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            canSalvage
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {canSalvage ? '✓ 作业条件适宜' : '⚠ 打捞条件受限'}
          </span>
        </div>
      </div>

      {!canSalvage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <div className="font-medium text-amber-800">当前风向条件不适合打捞作业</div>
            <div className="text-sm text-amber-600">
              风向：{state.windInfo.direction}，风速：{state.windInfo.speed} m/s。
              打捞任务暂不可执行，曝气和围隔任务仍可正常进行。
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
              <div className="text-sm text-gray-500">待接任务</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ship size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{inProgressTasks.length}</div>
              <div className="text-sm text-gray-500">进行中</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{myTasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-sm text-gray-500">今日完成</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{state.warnings.filter(w => w.status !== 'closed').length}</div>
              <div className="text-sm text-gray-500">活跃预警</div>
            </div>
          </div>
        </div>
      </div>

      <MonitorMap />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {pendingTasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  待接任务
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {pendingTasks.length} 个
                </span>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStart={handleStartTask}
                    showActions={task.type !== 'salvage' || canSalvage}
                  />
                ))}
              </div>
            </div>
          )}

          {inProgressTasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Ship size={18} className="text-blue-500" />
                  进行中任务
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {inProgressTasks.length} 个
                </span>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {inProgressTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={openResultModal}
                  />
                ))}
              </div>
            </div>
          )}

          {pendingTasks.length === 0 && inProgressTasks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Ship size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">暂无待处理任务</p>
              <p className="text-sm text-gray-400 mt-1">新任务将显示在这里</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">今日完成记录</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {completedTasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {task.pointName}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.type === 'aeration' ? 'bg-cyan-100 text-cyan-700' :
                      task.type === 'salvage' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {getTaskTypeLabel(task.type)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    完成时间：{task.finishTime}
                  </div>
                  {task.result && (
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {task.result}
                    </div>
                  )}
                  {task.photos && task.photos.length > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <Camera size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{task.photos.length} 张照片</span>
                    </div>
                  )}
                </div>
              ))}
              {completedTasks.length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">暂无完成记录</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <h3 className="font-semibold text-amber-800 mb-2">作业须知</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 作业前检查设备状态</li>
              <li>• 关注天气和水流情况</li>
              <li>• 按规范穿戴救生设备</li>
              <li>• 完成后须上传处理照片</li>
              <li>• 处理后需水质员复测</li>
              <li>• 未复测+照片不能关闭预警</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">天气信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">风向</span>
                <span className="font-medium text-gray-700">{state.windInfo.direction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">风速</span>
                <span className="font-medium text-gray-700">{state.windInfo.speed} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">适宜打捞</span>
                <span className={`font-medium ${canSalvage ? 'text-green-600' : 'text-red-600'}`}>
                  {canSalvage ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">完成任务</h3>
              <p className="text-green-100 text-sm">填写处理结果并上传照片后提交</p>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  处理结果 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resultText}
                  onChange={e => setResultText(e.target.value)}
                  placeholder="请详细描述处理过程和结果"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  处理照片 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {resultPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={24} className="text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-0.5 px-1 text-center truncate">
                        {photo}
                      </div>
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddPhoto}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400">添加照片</span>
                  </button>
                </div>
                {resultPhotos.length === 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    请至少上传1张处理照片，否则无法完成提交
                  </p>
                )}
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">提示：</span>
                  任务完成后将通知水质员进行复测，复测合格且照片齐全后方可关闭预警。
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setCurrentTaskId('');
                  setResultText('');
                  setResultPhotos([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCompleteTask}
                disabled={!resultText.trim() || resultPhotos.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  resultText.trim() && resultPhotos.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                提交完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
