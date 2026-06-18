import { MonitorPoint, AlgaeRecord, Task, Warning, RecheckRecord, WindInfo } from '../types';

export const mockMonitorPoints: MonitorPoint[] = [
  {
    id: 'mp001',
    name: '库心监测点',
    lat: 31.2304,
    lng: 121.4737,
    description: '水库中心区域，水深较深'
  },
  {
    id: 'mp002',
    name: '东坝监测点',
    lat: 31.2350,
    lng: 121.4850,
    description: '东侧堤坝附近'
  },
  {
    id: 'mp003',
    name: '西湾监测点',
    lat: 31.2280,
    lng: 121.4620,
    description: '西部水湾，水流较缓'
  },
  {
    id: 'mp004',
    name: '入水口监测点',
    lat: 31.2400,
    lng: 121.4700,
    description: '主要入水口位置'
  },
  {
    id: 'mp005',
    name: '取水口监测点',
    lat: 31.2250,
    lng: 121.4800,
    description: '自来水厂取水口'
  }
];

export const mockAlgaeRecords: AlgaeRecord[] = [
  {
    id: 'ar001',
    pointId: 'mp001',
    pointName: '库心监测点',
    density: 850,
    measureTime: '2024-06-18 08:30:00',
    operator: '张水质',
    remark: '正常水平'
  },
  {
    id: 'ar002',
    pointId: 'mp003',
    pointName: '西湾监测点',
    density: 1520,
    measureTime: '2024-06-18 09:15:00',
    operator: '张水质',
    remark: '藻密度偏高'
  },
  {
    id: 'ar003',
    pointId: 'mp002',
    pointName: '东坝监测点',
    density: 2300,
    measureTime: '2024-06-18 10:00:00',
    operator: '李水质',
    remark: '超过预警阈值'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task001',
    type: 'aeration',
    pointId: 'mp003',
    pointName: '西湾监测点',
    status: 'in_progress',
    priority: 'medium',
    createTime: '2024-06-18 09:30:00',
    assignTime: '2024-06-18 09:45:00',
    startTime: '2024-06-18 10:00:00',
    assignee: '王队员',
    description: '开启曝气设备，降低西湾区域藻密度',
    warningId: 'warn001'
  },
  {
    id: 'task002',
    type: 'salvage',
    pointId: 'mp002',
    pointName: '东坝监测点',
    status: 'pending',
    priority: 'high',
    createTime: '2024-06-18 10:15:00',
    description: '东坝区域蓝藻打捞作业',
    warningId: 'warn002'
  },
  {
    id: 'task003',
    type: 'aeration',
    pointId: 'mp001',
    pointName: '库心监测点',
    status: 'completed',
    priority: 'low',
    createTime: '2024-06-17 14:00:00',
    assignTime: '2024-06-17 14:30:00',
    startTime: '2024-06-17 15:00:00',
    finishTime: '2024-06-17 18:00:00',
    assignee: '赵队员',
    description: '日常曝气维护',
    result: '曝气作业完成，设备运行正常'
  }
];

export const mockWarnings: Warning[] = [
  {
    id: 'warn001',
    pointId: 'mp003',
    pointName: '西湾监测点',
    level: 'attention',
    status: 'processing',
    triggerDensity: 1520,
    threshold: 1500,
    createTime: '2024-06-18 09:20:00',
    taskIds: ['task001'],
    recheckCount: 0,
    description: '西湾监测点藻密度达到关注级别'
  },
  {
    id: 'warn002',
    pointId: 'mp002',
    pointName: '东坝监测点',
    level: 'warning',
    status: 'active',
    triggerDensity: 2300,
    threshold: 1500,
    createTime: '2024-06-18 10:05:00',
    taskIds: ['task002'],
    recheckCount: 0,
    description: '东坝监测点藻密度超过预警阈值'
  }
];

export const mockRecheckRecords: RecheckRecord[] = [
  {
    id: 'rc001',
    warningId: 'warn_old_001',
    pointId: 'mp005',
    pointName: '取水口监测点',
    density: 1200,
    measureTime: '2024-06-16 14:30:00',
    operator: '张水质',
    passed: true,
    remark: '复测合格，预警解除'
  }
];

export const mockWindInfo: WindInfo = {
  direction: '东南风',
  speed: 3.5,
  updateTime: '2024-06-18 08:00:00',
  suitableForSalvage: true
};

export const DENSITY_THRESHOLD = 1500;
export const EMERGENCY_THRESHOLD = 3000;
