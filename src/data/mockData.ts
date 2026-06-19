import { MonitorPoint, WaterIntake, AlgaeRecord, Task, Warning, RecheckRecord, WindInfo } from '../types';

export const mockMonitorPoints: MonitorPoint[] = [
  {
    id: 'mp001',
    name: '库心监测点',
    lat: 31.2304,
    lng: 121.4737,
    description: '水库中心区域，水深较深',
    downstreamIntakeIds: ['wi001', 'wi002']
  },
  {
    id: 'mp002',
    name: '东坝监测点',
    lat: 31.2350,
    lng: 121.4850,
    description: '东侧堤坝附近',
    downstreamIntakeIds: ['wi001']
  },
  {
    id: 'mp003',
    name: '西湾监测点',
    lat: 31.2280,
    lng: 121.4620,
    description: '西部水湾，水流较缓',
    downstreamIntakeIds: ['wi002', 'wi003']
  },
  {
    id: 'mp004',
    name: '入水口监测点',
    lat: 31.2400,
    lng: 121.4700,
    description: '主要入水口位置',
    downstreamIntakeIds: ['wi001', 'wi002', 'wi003']
  },
  {
    id: 'mp005',
    name: '取水口监测点',
    lat: 31.2250,
    lng: 121.4800,
    description: '自来水厂取水口',
    downstreamIntakeIds: ['wi001']
  }
];

export const mockWaterIntakes: WaterIntake[] = [
  {
    id: 'wi001',
    name: '第一水厂取水口',
    lat: 31.2220,
    lng: 121.4830,
    orgName: '市第一自来水厂',
    status: 'normal'
  },
  {
    id: 'wi002',
    name: '第二水厂取水口',
    lat: 31.2260,
    lng: 121.4650,
    orgName: '市第二自来水厂',
    status: 'normal'
  },
  {
    id: 'wi003',
    name: '工业园区取水口',
    lat: 31.2210,
    lng: 121.4580,
    orgName: '经开区供水中心',
    status: 'normal'
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
  },
  {
    id: 'ar004',
    pointId: 'mp003',
    pointName: '西湾监测点',
    density: 1680,
    measureTime: '2024-06-17 16:00:00',
    operator: '张水质',
    remark: '首次超标'
  },
  {
    id: 'ar005',
    pointId: 'mp002',
    pointName: '东坝监测点',
    density: 1650,
    measureTime: '2024-06-17 14:30:00',
    operator: '李水质',
    remark: '首次超标'
  },
  {
    id: 'ar006',
    pointId: 'mp001',
    pointName: '库心监测点',
    density: 620,
    measureTime: '2024-06-17 09:00:00',
    operator: '张水质'
  },
  {
    id: 'ar007',
    pointId: 'mp001',
    pointName: '库心监测点',
    density: 580,
    measureTime: '2024-06-16 09:00:00',
    operator: '张水质'
  },
  {
    id: 'ar008',
    pointId: 'mp003',
    pointName: '西湾监测点',
    density: 920,
    measureTime: '2024-06-16 10:30:00',
    operator: '张水质'
  },
  {
    id: 'ar009',
    pointId: 'mp002',
    pointName: '东坝监测点',
    density: 780,
    measureTime: '2024-06-16 14:00:00',
    operator: '李水质'
  },
  {
    id: 'ar010',
    pointId: 'mp005',
    pointName: '取水口监测点',
    density: 450,
    measureTime: '2024-06-17 10:00:00',
    operator: '张水质'
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
    warningId: 'warn001',
    photos: []
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
    warningId: 'warn002',
    photos: []
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
    result: '曝气作业完成，设备运行正常',
    photos: ['photo_old_001']
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
    description: '西湾监测点藻密度达到关注级别',
    consecutiveExceedCount: 2,
    upgradedToDispatch: true,
    affectedIntakeIds: ['wi002', 'wi003'],
    recheckPhotos: []
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
    description: '东坝监测点藻密度超过预警阈值',
    consecutiveExceedCount: 2,
    upgradedToDispatch: true,
    affectedIntakeIds: ['wi001'],
    recheckPhotos: []
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
    remark: '复测合格，预警解除',
    photos: ['photo_rc_001']
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
