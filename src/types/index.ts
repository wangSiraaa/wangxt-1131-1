export type Role = 'water' | 'dispatch' | 'salvage';

export type TaskType = 'aeration' | 'salvage';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type WarningLevel = 'normal' | 'attention' | 'warning' | 'emergency';

export type WarningStatus = 'active' | 'processing' | 'rechecking' | 'closed';

export interface MonitorPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface AlgaeRecord {
  id: string;
  pointId: string;
  pointName: string;
  density: number;
  measureTime: string;
  operator: string;
  remark?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  pointId: string;
  pointName: string;
  status: TaskStatus;
  priority: 'high' | 'medium' | 'low';
  createTime: string;
  assignTime?: string;
  startTime?: string;
  finishTime?: string;
  assignee?: string;
  description: string;
  result?: string;
  warningId?: string;
}

export interface Warning {
  id: string;
  pointId: string;
  pointName: string;
  level: WarningLevel;
  status: WarningStatus;
  triggerDensity: number;
  threshold: number;
  createTime: string;
  closeTime?: string;
  taskIds: string[];
  recheckCount: number;
  latestRecheckId?: string;
  description: string;
}

export interface RecheckRecord {
  id: string;
  warningId: string;
  pointId: string;
  pointName: string;
  density: number;
  measureTime: string;
  operator: string;
  passed: boolean;
  remark?: string;
}

export interface WindInfo {
  direction: string;
  speed: number;
  updateTime: string;
  suitableForSalvage: boolean;
}

export interface AppState {
  currentRole: Role;
  monitorPoints: MonitorPoint[];
  algaeRecords: AlgaeRecord[];
  tasks: Task[];
  warnings: Warning[];
  recheckRecords: RecheckRecord[];
  windInfo: WindInfo;
  densityThreshold: number;
  emergencyThreshold: number;
}
