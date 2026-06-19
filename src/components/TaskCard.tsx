import { Clock, Play, CheckCircle, XCircle, Wind, Ship, Fence, Camera } from 'lucide-react';
import { Task, TaskStatus, TaskType } from '../types';

interface TaskCardProps {
  task: Task;
  onStart?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
  showActions?: boolean;
}

export default function TaskCard({ task, onStart, onComplete, onCancel, showActions = true }: TaskCardProps) {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return { label: '待分配', color: 'bg-gray-100 text-gray-600', icon: <Clock size={14} /> };
      case 'in_progress':
        return { label: '进行中', color: 'bg-blue-100 text-blue-700', icon: <Play size={14} /> };
      case 'completed':
        return { label: '已完成', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> };
      case 'cancelled':
        return { label: '已取消', color: 'bg-red-100 text-red-600', icon: <XCircle size={14} /> };
    }
  };

  const getTypeConfig = (type: TaskType) => {
    switch (type) {
      case 'aeration':
        return { label: '曝气作业', color: 'bg-cyan-100 text-cyan-700', icon: <Wind size={14} /> };
      case 'salvage':
        return { label: '打捞作业', color: 'bg-amber-100 text-amber-700', icon: <Ship size={14} /> };
      case 'enclosure':
        return { label: '围隔作业', color: 'bg-purple-100 text-purple-700', icon: <Fence size={14} /> };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const typeConfig = getTypeConfig(task.type);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${getPriorityColor(task.priority)} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.icon}
            {typeConfig.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>
        <span className="text-xs text-gray-400">{task.createTime}</span>
      </div>

      <h4 className="font-medium text-gray-800 mb-1">{task.pointName}</h4>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {task.assignee && (
            <span>负责人：{task.assignee}</span>
          )}
          {task.startTime && (
            <span>开始：{task.startTime.slice(11)}</span>
          )}
          {task.finishTime && (
            <span>完成：{task.finishTime.slice(11)}</span>
          )}
        </div>
        {task.photos && task.photos.length > 0 && (
          <div className="flex items-center gap-1">
            <Camera size={12} className="text-gray-400" />
            <span>{task.photos.length} 张</span>
          </div>
        )}
      </div>

      {task.result && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
          <span className="font-medium">处理结果：</span>
          {task.result}
        </div>
      )}

      {showActions && (
        <div className="mt-3 flex gap-2">
          {task.status === 'pending' && onStart && (
            <button
              onClick={() => onStart(task.id)}
              className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              开始处理
            </button>
          )}
          {task.status === 'in_progress' && onComplete && (
            <button
              onClick={() => onComplete(task.id)}
              className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
            >
              完成
            </button>
          )}
          {task.status === 'pending' && onCancel && (
            <button
              onClick={() => onCancel(task.id)}
              className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      )}
    </div>
  );
}
