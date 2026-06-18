import { AlertTriangle, AlertCircle, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Warning, WarningLevel, WarningStatus } from '../types';

interface WarningListProps {
  warnings: Warning[];
  onClose?: (warningId: string) => void;
  onRecheck?: (warningId: string) => void;
  showActions?: boolean;
  canCloseFn?: (warningId: string) => boolean;
}

export default function WarningList({ warnings, onClose, onRecheck, showActions = true, canCloseFn }: WarningListProps) {
  const getLevelConfig = (level: WarningLevel) => {
    switch (level) {
      case 'emergency':
        return { label: '紧急', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
      case 'warning':
        return { label: '预警', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
      case 'attention':
        return { label: '关注', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      default:
        return { label: '正常', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
    }
  };

  const getStatusConfig = (status: WarningStatus) => {
    switch (status) {
      case 'active':
        return { label: '待处理', icon: <AlertTriangle size={14} />, color: 'text-red-600' };
      case 'processing':
        return { label: '处理中', icon: <Bell size={14} />, color: 'text-blue-600' };
      case 'rechecking':
        return { label: '待复测', icon: <AlertCircle size={14} />, color: 'text-yellow-600' };
      case 'closed':
        return { label: '已关闭', icon: <CheckCircle size={14} />, color: 'text-green-600' };
    }
  };

  if (warnings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
        <p>暂无预警信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map(warning => {
        const levelConfig = getLevelConfig(warning.level);
        const statusConfig = getStatusConfig(warning.status);
        const canClose = canCloseFn ? canCloseFn(warning.id) : false;

        return (
          <div
            key={warning.id}
            className={`p-4 rounded-lg border ${levelConfig.borderColor} ${levelConfig.bgColor} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${levelConfig.color} animate-pulse`}></span>
                <span className={`text-sm font-medium ${levelConfig.textColor}`}>
                  {levelConfig.label}级预警
                </span>
                <span className={`inline-flex items-center gap-1 text-xs ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">{warning.createTime}</span>
            </div>

            <h4 className="font-medium text-gray-800 mb-1">{warning.pointName}</h4>
            <p className="text-sm text-gray-600 mb-2">{warning.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>触发密度：<span className="font-medium text-gray-700">{warning.triggerDensity} 万个/L</span></span>
              <span>阈值：<span className="font-medium text-gray-700">{warning.threshold} 万个/L</span></span>
              <span>复测：<span className="font-medium text-gray-700">{warning.recheckCount} 次</span></span>
              <span>关联任务：<span className="font-medium text-gray-700">{warning.taskIds.length} 个</span></span>
            </div>

            {showActions && warning.status !== 'closed' && (
              <div className="mt-3 flex gap-2">
                {onRecheck && (
                  <button
                    onClick={() => onRecheck(warning.id)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                  >
                    安排复测
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={() => onClose(warning.id)}
                    disabled={!canClose}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      canClose
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    关闭预警
                  </button>
                )}
              </div>
            )}

            {warning.status !== 'closed' && !canClose && showActions && onClose && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <XCircle size={12} />
                需完成复测且复测合格后方可关闭
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
