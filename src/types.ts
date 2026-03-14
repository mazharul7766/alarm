export interface BatteryState {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  health: number;
  temperature: number;
  voltage: number;
  capacity: number;
  technology: string;
  cycles: number;
}

export interface ChargingHistory {
  id: string;
  date: string;
  startTime: string;
  location: string;
  endLevel: number;
  duration: string;
  healthScore: number;
  type: 'Fast' | 'Normal' | 'Slow';
}

export interface AppSettings {
  alarmPercentage: number;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  fullChargeAlert: boolean;
  darkMode: boolean;
  autoMonitor: boolean;
  customRingtoneName: string;
  customRingtoneData: string | null;
}
