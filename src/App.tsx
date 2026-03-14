/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Battery, 
  History, 
  BarChart3, 
  Settings as SettingsIcon, 
  Bolt, 
  Thermometer, 
  Heart, 
  ShieldCheck, 
  Play, 
  Square, 
  Bell, 
  ChevronRight, 
  ArrowLeft, 
  MoreVertical, 
  Lightbulb,
  Zap,
  Clock,
  LayoutDashboard,
  Music,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BatteryState, ChargingHistory, AppSettings } from './types';
import { getSmartOptimizationTip, getHealthAnalysis } from './services/aiService';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const MOCK_HISTORY: ChargingHistory[] = [
  { id: '1', date: 'Oct 24, 2023', startTime: '11:42 PM', location: 'Home Station', endLevel: 98, duration: '1h 45m', healthScore: 92, type: 'Fast' },
  { id: '2', date: 'Oct 22, 2023', startTime: '08:15 AM', location: 'Workplace', endLevel: 100, duration: '2h 10m', healthScore: 91, type: 'Normal' },
  { id: '3', date: 'Oct 19, 2023', startTime: '05:30 PM', location: 'Mall Station', endLevel: 85, duration: '0h 45m', healthScore: 94, type: 'Fast' },
];

const WEEKLY_DATA = [
  { day: 'M', duration: 6.0 },
  { day: 'T', duration: 7.5 },
  { day: 'W', duration: 4.5 },
  { day: 'T', duration: 9.0 },
  { day: 'F', duration: 9.5 },
  { day: 'S', duration: 5.5 },
  { day: 'S', duration: 4.0 },
];

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed bottom-24 left-4 right-4 z-[100] p-4 rounded-xl shadow-lg flex items-center gap-3 border",
        type === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300",
        type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300",
        type === 'info' && "bg-primary/5 border-primary/20 text-primary dark:bg-primary/20 dark:text-primary-light"
      )}
    >
      {type === 'success' && <CheckCircle2 size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      {type === 'info' && <Bell size={20} />}
      <p className="text-sm font-bold flex-1">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full">
        <X size={16} />
      </button>
    </motion.div>
  );
};

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'performance', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Set', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 pb-6 pt-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-slate-400 hover:text-primary"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const Dashboard = ({ battery, settings, setSettings, isMonitoring, setIsMonitoring, onShowDetails }: { 
  battery: BatteryState, 
  settings: AppSettings, 
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>,
  isMonitoring: boolean,
  setIsMonitoring: (val: boolean) => void,
  onShowDetails: (title: string) => void
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Battery Card */}
      <section className="mt-4">
        <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bolt size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium uppercase tracking-wider">
                  {battery.charging ? "Fast Charging" : "Discharging"}
                </span>
                <h2 className="text-6xl font-bold mt-2">{Math.round(battery.level * 100)}%</h2>
              </div>
              <Bolt className={cn("text-4xl", battery.charging && "animate-pulse")} />
            </div>
            <div className="space-y-1 mb-6">
              <p className="text-white/80 flex items-center gap-2">
                <Clock size={14} />
                {battery.charging ? `Full in ${Math.round(battery.chargingTime / 60)} min` : `${Math.round(battery.dischargingTime / 60)} min left`}
              </p>
              <p className="text-white/80 flex items-center gap-2">
                <Thermometer size={14} />
                {battery.temperature}°C • Health: Good
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl">
                <p className="text-[10px] uppercase text-white/60 mb-1">Voltage</p>
                <p className="font-bold">{battery.voltage}V</p>
              </div>
              <button 
                onClick={() => onShowDetails("Battery Capacity & Tech")}
                className="bg-white/5 backdrop-blur-md p-3 rounded-xl text-left hover:bg-white/10 transition-colors"
              >
                <p className="text-[10px] uppercase text-white/60 mb-1">Capacity</p>
                <p className="font-bold">{battery.capacity}mAh</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Alarm Control Card */}
      <section>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="text-primary" />
              <h3 className="font-bold text-lg">Charge Alarm</h3>
            </div>
            <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-sm">
              {settings.alarmPercentage}% Limit
            </span>
          </div>
          <div className="space-y-6">
            <div className="relative pt-2 pb-6">
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={settings.alarmPercentage}
                onChange={(e) => setSettings(prev => ({ ...prev, alarmPercentage: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsMonitoring(true)}
                disabled={isMonitoring}
                className={cn(
                  "flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95",
                  isMonitoring 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                    : "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110"
                )}
              >
                <Play size={18} fill="currentColor" />
                {isMonitoring ? "Monitoring..." : "Start"}
              </button>
              <button 
                onClick={() => setIsMonitoring(false)}
                disabled={!isMonitoring}
                className={cn(
                  "flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-95",
                  !isMonitoring
                    ? "bg-slate-50 dark:bg-slate-900/20 text-slate-300 border-slate-100 dark:border-slate-800 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                <Square size={18} fill="currentColor" />
                Stop
              </button>
            </div>
            
            {/* Auto Button Feature */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Auto-Start Monitoring</p>
                  <p className="text-xs text-slate-500">Automatically start alarm when plugged in</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, autoMonitor: !prev.autoMonitor }))}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    settings.autoMonitor ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    settings.autoMonitor ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <History className="text-emerald-500 mb-2" size={20} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-semibold">Cycles</p>
          <p className="text-xl font-bold">{battery.cycles}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Zap className="text-orange-500 mb-2" size={20} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-semibold">Peak Power</p>
          <p className="text-xl font-bold">25W</p>
        </div>
      </section>
    </div>
  );
};

const HistoryView = ({ onShowDetails }: { onShowDetails: (title: string) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Charging History</h2>
        <button 
          onClick={() => onShowDetails("History Filters")}
          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {MOCK_HISTORY.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="h-24 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/battery${item.id}/400/100`} 
                alt="Battery charging" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold leading-tight">{item.date}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{item.startTime} - {item.location}</p>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {item.endLevel}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold">Duration</span>
                  <span className="font-medium text-sm">{item.duration}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold">Health Score</span>
                  <span className="text-primary font-bold text-sm">{item.healthScore}/100</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Bolt size={14} />
                  <span className="text-xs">{item.type} Charge</span>
                </div>
                <button 
                  onClick={() => onShowDetails(`Charging Session: ${item.date}`)}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceView = ({ battery, onShowDetails }: { battery: BatteryState, onShowDetails: (title: string) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Today's Duration</p>
          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">+12% vs avg</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-4xl font-bold">9h 12m</h2>
          <p className="text-emerald-500 dark:text-emerald-400 font-semibold mt-1">Excellent Performance</p>
        </div>
        <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(17,50,212,0.5)]"></div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Weekly Analytics</h3>
          <button 
            onClick={() => onShowDetails("Weekly Performance Analytics")}
            className="text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
          >
            View Details
          </button>
        </div>
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_DATA}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(17, 50, 212, 0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="duration" radius={[6, 6, 0, 0]}>
                {WEEKLY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.day === 'F' ? '#1132d4' : 'rgba(17, 50, 212, 0.2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent dark:border-primary/10">
          <Heart className="text-primary mb-2" size={20} />
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Health</p>
          <p className="text-lg font-bold">{battery.health}%</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent dark:border-primary/10">
          <Thermometer className="text-primary mb-2" size={20} />
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Temp</p>
          <p className="text-lg font-bold">{battery.temperature}°C</p>
        </div>
      </section>
    </div>
  );
};

const SettingsView = ({ settings, setSettings, onShowToast }: { 
  settings: AppSettings, 
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>,
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggle = (key: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRingtoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        onShowToast("Please select an audio file", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setSettings(prev => ({
          ...prev,
          customRingtoneName: file.name,
          customRingtoneData: data
        }));
        onShowToast(`Ringtone set to: ${file.name}`, "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const resetDefaults = () => {
    setSettings({
      alarmPercentage: 80,
      vibrationEnabled: true,
      voiceEnabled: false,
      fullChargeAlert: true,
      darkMode: true,
      autoMonitor: true,
      customRingtoneName: 'Default - Digital Alarm',
      customRingtoneData: null
    });
    onShowToast("Settings reset to defaults", "info");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-primary text-xs font-bold uppercase tracking-widest mb-4 px-2">Alert Configuration</h2>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleRingtoneChange} 
            accept="audio/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors text-left"
          >
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Music size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold">Custom Ringtone</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{settings.customRingtoneName}</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Battery size={20} />
                </div>
                <p className="font-bold">Alarm Percentage</p>
              </div>
              <span className="text-primary font-bold text-lg">{settings.alarmPercentage}%</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={settings.alarmPercentage}
              onChange={(e) => setSettings(prev => ({ ...prev, alarmPercentage: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-primary text-xs font-bold uppercase tracking-widest mb-4 px-2">Preferences</h2>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800">
          {[
            { key: 'vibrationEnabled', label: 'Vibration Alert', icon: Bolt },
            { key: 'voiceEnabled', label: 'Voice Notification', icon: Heart },
            { key: 'fullChargeAlert', label: 'Full Charge Alert', icon: ShieldCheck },
            { key: 'darkMode', label: 'Dark Mode', icon: Bolt },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <item.icon size={18} />
                </div>
                <p className="font-bold text-sm">{item.label}</p>
              </div>
              <button 
                onClick={() => toggle(item.key as keyof AppSettings)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  settings[item.key as keyof AppSettings] ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings[item.key as keyof AppSettings] ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <button 
          onClick={resetDefaults}
          className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <History size={18} />
          Reset to Defaults
        </button>
      </section>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [battery, setBattery] = useState<BatteryState>({
    level: 0.76,
    charging: true,
    chargingTime: 1680,
    dischargingTime: 0,
    health: 94,
    temperature: 34,
    voltage: 4.2,
    capacity: 4500,
    technology: 'Li-ion',
    cycles: 142
  });

  const [settings, setSettings] = useState<AppSettings>({
    alarmPercentage: 80,
    vibrationEnabled: true,
    voiceEnabled: false,
    fullChargeAlert: true,
    darkMode: true,
    autoMonitor: true,
    customRingtoneName: 'Default - Digital Alarm',
    customRingtoneData: null
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [smartTip, setSmartTip] = useState("Analyzing battery patterns...");
  const [healthAnalysis, setHealthAnalysis] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Battery API Integration
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBattery = () => {
          setBattery(prev => ({
            ...prev,
            level: batt.level,
            charging: batt.charging,
            chargingTime: batt.chargingTime === Infinity ? 0 : batt.chargingTime,
            dischargingTime: batt.dischargingTime === Infinity ? 0 : batt.dischargingTime,
          }));
        };

        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
        batt.addEventListener('chargingtimechange', updateBattery);
        batt.addEventListener('dischargingtimechange', updateBattery);

        return () => {
          batt.removeEventListener('levelchange', updateBattery);
          batt.removeEventListener('chargingchange', updateBattery);
          batt.removeEventListener('chargingtimechange', updateBattery);
          batt.removeEventListener('dischargingtimechange', updateBattery);
        };
      });
    }
  }, []);

  // Auto-Monitor Logic
  useEffect(() => {
    if (settings.autoMonitor && battery.charging) {
      setIsMonitoring(true);
    }
  }, [battery.charging, settings.autoMonitor]);

  // Alarm Logic
  useEffect(() => {
    let alarmInterval: NodeJS.Timeout;
    
    if (isMonitoring && battery.charging && battery.level * 100 >= settings.alarmPercentage) {
      showToast(`ALARM! Battery reached ${settings.alarmPercentage}%!`, 'error');
      
      // Play sound if custom data exists
      if (settings.customRingtoneData) {
        const audio = new Audio(settings.customRingtoneData);
        audio.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        // Fallback or default sound logic could go here
        console.log("Playing default alarm sound...");
      }
    }
    
    return () => clearInterval(alarmInterval);
  }, [battery.level, battery.charging, isMonitoring, settings.alarmPercentage, settings.customRingtoneData]);

  // AI Insights
  useEffect(() => {
    const fetchAIInsights = async () => {
      const tip = await getSmartOptimizationTip(battery);
      setSmartTip(tip);
      const analysis = await getHealthAnalysis(battery);
      setHealthAnalysis(analysis);
    };

    fetchAIInsights();
    // Refresh every 5 minutes or when health changes
  }, [battery.health]);

  return (
    <div className={cn("min-h-screen pb-24 transition-colors duration-500", settings.darkMode ? "dark bg-background-dark" : "bg-background-light")}>
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Battery className="text-primary" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight dark:text-white">Smart Battery</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors dark:text-slate-400">
            <Bell size={20} />
          </button>
        </header>

        {/* AI Insight Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 flex items-start gap-4 border border-primary/20 mb-6"
        >
          <Lightbulb className="text-primary mt-1 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm dark:text-primary-light">AI Optimization Tip</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{smartTip}</p>
          </div>
        </motion.div>

        {/* Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard 
                battery={battery} 
                settings={settings} 
                setSettings={setSettings}
                isMonitoring={isMonitoring}
                setIsMonitoring={setIsMonitoring}
                onShowDetails={(title) => showToast(`Showing details for: ${title}`, 'info')}
              />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryView onShowDetails={(title) => showToast(`Showing details for: ${title}`, 'info')} />
            </motion.div>
          )}
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PerformanceView battery={battery} onShowDetails={(title) => showToast(`Showing details for: ${title}`, 'info')} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsView settings={settings} setSettings={setSettings} onShowToast={showToast} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
