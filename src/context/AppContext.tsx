import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  AppState,
  Role,
  AlgaeRecord,
  Task,
  Warning,
  RecheckRecord,
  MonitorPoint,
  WarningLevel,
  WarningStatus,
  TaskStatus
} from '../types';
import {
  mockMonitorPoints,
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
  | { type: 'UPDATE_WIND'; payload: typeof mockWindInfo };

const initialState: AppState = {
  currentRole: 'water',
  monitorPoints: mockMonitorPoints,
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
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getWarningLevel: (density: number) => WarningLevel;
  canDispatchSalvage: () => boolean;
  canCloseWarning: (warningId: string) => boolean;
  getLatestDensity: (pointId: string) => number | null;
  createTask: (task: Omit<Task, 'id' | 'createTime' | 'status'>) => Task;
  createWarning: (record: AlgaeRecord) => Warning | null;
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
    return latestRecheck?.passed ?? false;
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

  const createTask = (taskData: Omit<Task, 'id' | 'createTime' | 'status'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: generateId('task'),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'pending' as TaskStatus
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const createWarning = (record: AlgaeRecord): Warning | null => {
    const level = getWarningLevel(record.density);
    if (level === 'normal') return null;

    const existingWarning = state.warnings.find(
      w => w.pointId === record.pointId && w.status !== 'closed'
    );
    if (existingWarning) return null;

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
      description: `${record.pointName}藻密度达到${level === 'emergency' ? '紧急' : level === 'warning' ? '预警' : '关注'}级别`
    };
    dispatch({ type: 'ADD_WARNING', payload: newWarning });
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
      createWarning
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
