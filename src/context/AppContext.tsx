import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  AppState,
  Role,
  AlgaeRecord,
  Task,
  Warning,
  RecheckRecord,
  MonitorPoint,
  WaterIntake,
  WarningLevel,
  WarningStatus,
  TaskStatus
} from '../types';
import {
  mockMonitorPoints,
  mockWaterIntakes,
  mockAlgaeRecords,
  mockTasks,
  mockWarnings,
  mockRecheckRecords,
  mockWindInfo,
  DENSITY_THRESHOLD,
  EMERGENCY_THRESHOLD
} from '../data/mockData';

type Action =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'ADD_ALGAE_RECORD'; payload: AlgaeRecord }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'ADD_WARNING'; payload: Warning }
  | { type: 'UPDATE_WARNING'; payload: Warning }
  | { type: 'ADD_RECHECK_RECORD'; payload: RecheckRecord }
  | { type: 'ADD_MONITOR_POINT'; payload: MonitorPoint }
  | { type: 'UPDATE_WIND'; payload: typeof mockWindInfo }
  | { type: 'UPDATE_INTAKE_STATUS'; payload: { id: string; status: 'normal' | 'affected' } };

const initialState: AppState = {
  currentRole: 'water',
  monitorPoints: mockMonitorPoints,
  waterIntakes: mockWaterIntakes,
  algaeRecords: mockAlgaeRecords,
  tasks: mockTasks,
  warnings: mockWarnings,
  recheckRecords: mockRecheckRecords,
  windInfo: mockWindInfo,
  densityThreshold: DENSITY_THRESHOLD,
  emergencyThreshold: EMERGENCY_THRESHOLD
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };
    case 'ADD_ALGAE_RECORD':
      return { ...state, algaeRecords: [action.payload, ...state.algaeRecords] };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'ADD_WARNING':
      return { ...state, warnings: [action.payload, ...state.warnings] };
    case 'UPDATE_WARNING':
      return {
        ...state,
        warnings: state.warnings.map(w => w.id === action.payload.id ? action.payload : w)
      };
    case 'ADD_RECHECK_RECORD':
      return { ...state, recheckRecords: [action.payload, ...state.recheckRecords] };
    case 'ADD_MONITOR_POINT':
      return { ...state, monitorPoints: [...state.monitorPoints, action.payload] };
    case 'UPDATE_WIND':
      return { ...state, windInfo: action.payload };
    case 'UPDATE_INTAKE_STATUS':
      return {
        ...state,
        waterIntakes: state.waterIntakes.map(wi =>
          wi.id === action.payload.id ? { ...wi, status: action.payload.status } : wi
        )
      };
    default:
      return state;
  }
}

interface ConsecutiveExceedResult {
  consecutiveExceedCount: number;
  upgradedToDispatch: boolean;
  affectedIntakeIds: string[];
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getWarningLevel: (density: number) => WarningLevel;
  canDispatchSalvage: () => boolean;
  canCloseWarning: (warningId: string) => boolean;
  getLatestDensity: (pointId: string) => number | null;
  createTask: (task: Omit<Task, 'id' | 'createTime' | 'status'>) => Task | null;
  createWarning: (record: AlgaeRecord) => Warning | null;
  updateWindInfo: (windInfo: Partial<{ direction: string; speed: number; suitableForSalvage: boolean }>) => void;
  toggleWindSuitability: () => void;
  checkConsecutiveExceed: (pointId: string) => ConsecutiveExceedResult;
  getAffectedIntakes: (pointId: string) => WaterIntake[];
  getPointRecords: (pointId: string) => AlgaeRecord[];
  getTreatmentTimePoints: (pointId: string) => { time: string; label: string }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const getWarningLevel = (density: number): WarningLevel => {
    if (density >= state.emergencyThreshold) return 'emergency';
    if (density >= state.densityThreshold) return 'warning';
    if (density >= state.densityThreshold * 0.7) return 'attention';
    return 'normal';
  };

  const canDispatchSalvage = (): boolean => {
    return state.windInfo.suitableForSalvage;
  };

  const canCloseWarning = (warningId: string): boolean => {
    const warning = state.warnings.find(w => w.id === warningId);
    if (!warning) return false;
    if (warning.recheckCount === 0) return false;
    const latestRecheck = state.recheckRecords.find(r => r.id === warning.latestRecheckId);
    if (!latestRecheck?.passed) return false;
    if (!latestRecheck.photos || latestRecheck.photos.length === 0) return false;
    return true;
  };

  const getLatestDensity = (pointId: string): number | null => {
    const pointRecords = state.algaeRecords.filter(r => r.pointId === pointId);
    if (pointRecords.length === 0) return null;
    return pointRecords.sort((a, b) =>
      new Date(b.measureTime).getTime() - new Date(a.measureTime).getTime()
    )[0].density;
  };

  const generateId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  };

  const checkConsecutiveExceed = (pointId: string): ConsecutiveExceedResult => {
    const pointRecords = state.algaeRecords
      .filter(r => r.pointId === pointId)
      .sort((a, b) => new Date(b.measureTime).getTime() - new Date(a.measureTime).getTime());

    let consecutiveExceedCount = 0;
    for (const record of pointRecords) {
      if (record.density >= state.densityThreshold) {
        consecutiveExceedCount++;
      } else {
        break;
      }
    }

    const upgradedToDispatch = consecutiveExceedCount >= 2;

    const point = state.monitorPoints.find(p => p.id === pointId);
    const affectedIntakeIds = point ? point.downstreamIntakeIds : [];

    return { consecutiveExceedCount, upgradedToDispatch, affectedIntakeIds };
  };

  const getAffectedIntakes = (pointId: string): WaterIntake[] => {
    const point = state.monitorPoints.find(p => p.id === pointId);
    if (!point) return [];
    return state.waterIntakes.filter(wi => point.downstreamIntakeIds.includes(wi.id));
  };

  const getPointRecords = (pointId: string): AlgaeRecord[] => {
    return state.algaeRecords
      .filter(r => r.pointId === pointId)
      .sort((a, b) => new Date(a.measureTime).getTime() - new Date(b.measureTime).getTime());
  };

  const getTreatmentTimePoints = (pointId: string): { time: string; label: string }[] => {
    const relatedTasks = state.tasks.filter(t => t.pointId === pointId && t.status === 'completed');
    return relatedTasks.map(t => ({
      time: t.finishTime || t.startTime || t.createTime,
      label: t.type === 'aeration' ? '曝气处置' : t.type === 'salvage' ? '打捞处置' : '围隔处置'
    }));
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createTime' | 'status'>): Task | null => {
    if (taskData.type === 'salvage' && !state.windInfo.suitableForSalvage) {
      console.warn('[createTask] 当前风向不适宜，无法创建打捞任务');
      return null;
    }

    const newTask: Task = {
      ...taskData,
      id: generateId('task'),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'pending' as TaskStatus,
      photos: taskData.photos || []
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const updateWindInfo = (windInfo: Partial<{ direction: string; speed: number; suitableForSalvage: boolean }>) => {
    const newWindInfo = {
      ...state.windInfo,
      ...windInfo,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    dispatch({ type: 'UPDATE_WIND', payload: newWindInfo });
  };

  const toggleWindSuitability = () => {
    const directions = ['东南风', '西北风', '东北风', '西南风', '南风', '北风'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    const randomSpeed = Math.round((Math.random() * 6 + 1) * 10) / 10;
    const newSuitable = !state.windInfo.suitableForSalvage;

    const newWindInfo = {
      direction: randomDirection,
      speed: randomSpeed,
      suitableForSalvage: newSuitable,
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    dispatch({ type: 'UPDATE_WIND', payload: newWindInfo });
  };

  const createWarning = (record: AlgaeRecord): Warning | null => {
    const level = getWarningLevel(record.density);
    if (level === 'normal') return null;

    const existingWarning = state.warnings.find(
      w => w.pointId === record.pointId && w.status !== 'closed'
    );
    if (existingWarning) {
      const exceedResult = checkConsecutiveExceed(record.pointId);
      const updatedWarning: Warning = {
        ...existingWarning,
        level: level === 'emergency' ? 'emergency' : existingWarning.level === 'warning' ? 'warning' : level,
        consecutiveExceedCount: exceedResult.consecutiveExceedCount,
        upgradedToDispatch: exceedResult.upgradedToDispatch || existingWarning.upgradedToDispatch,
        affectedIntakeIds: exceedResult.affectedIntakeIds,
        triggerDensity: record.density,
        description: exceedResult.upgradedToDispatch
          ? `${record.pointName}连续${exceedResult.consecutiveExceedCount}次超标，已升级为调度事件`
          : existingWarning.description
      };
      dispatch({ type: 'UPDATE_WARNING', payload: updatedWarning });

      if (exceedResult.upgradedToDispatch) {
        exceedResult.affectedIntakeIds.forEach(intakeId => {
          dispatch({ type: 'UPDATE_INTAKE_STATUS', payload: { id: intakeId, status: 'affected' } });
        });
      }

      return updatedWarning;
    }

    const exceedResult = checkConsecutiveExceed(record.pointId);
    const threshold = level === 'emergency' ? state.emergencyThreshold : state.densityThreshold;
    const newWarning: Warning = {
      id: generateId('warn'),
      pointId: record.pointId,
      pointName: record.pointName,
      level,
      status: 'active' as WarningStatus,
      triggerDensity: record.density,
      threshold,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      taskIds: [],
      recheckCount: 0,
      description: exceedResult.upgradedToDispatch
        ? `${record.pointName}连续${exceedResult.consecutiveExceedCount}次超标，已升级为调度事件`
        : `${record.pointName}藻密度达到${level === 'emergency' ? '紧急' : level === 'warning' ? '预警' : '关注'}级别`,
      consecutiveExceedCount: exceedResult.consecutiveExceedCount,
      upgradedToDispatch: exceedResult.upgradedToDispatch,
      affectedIntakeIds: exceedResult.affectedIntakeIds,
      recheckPhotos: []
    };
    dispatch({ type: 'ADD_WARNING', payload: newWarning });

    if (exceedResult.upgradedToDispatch) {
      exceedResult.affectedIntakeIds.forEach(intakeId => {
        dispatch({ type: 'UPDATE_INTAKE_STATUS', payload: { id: intakeId, status: 'affected' } });
      });
    }

    return newWarning;
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      getWarningLevel,
      canDispatchSalvage,
      canCloseWarning,
      getLatestDensity,
      createTask,
      createWarning,
      updateWindInfo,
      toggleWindSuitability,
      checkConsecutiveExceed,
      getAffectedIntakes,
      getPointRecords,
      getTreatmentTimePoints
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
