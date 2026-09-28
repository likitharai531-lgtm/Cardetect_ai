import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  Camera,
  Image as ImageIcon,
  Settings,
  Phone,
  MessageSquare,
  Compass,
  Sun,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { CarDetectAppIcon } from './CarDetectAppIcon';

interface AndroidHomeScreenProps {
  onOpenApp: (initialAction?: 'camera' | 'gallery') => void;
  onOpenCodeModal: () => void;
}

export const AndroidHomeScreen: React.FC<AndroidHomeScreenProps> = ({
  onOpenApp,
  onOpenCodeModal,
}) => {
  const [time, setTime] = useState('09:41');
  const [dateStr, setDateStr] = useState('Sunday, Sep 27');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 relative select-none bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 min-h-[580px] overflow-hidden">
      {/* Dynamic Wallpaper Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP: Material You Clock & Date Widget */}
      <div className="pt-2 z-10">
        <div className="text-left space-y-1">
          <div className="text-5xl font-extrabold text-white tracking-tight font-sans drop-shadow-sm">
            {time}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>{dateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Sun className="w-3.5 h-3.5" /> 74°F Sunny
            </span>
          </div>
        </div>

        {/* Google Android Search Bar Pill */}
        <div className="mt-4 w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-full px-3.5 py-2.5 flex items-center justify-between shadow-md backdrop-blur-md transition-colors">
          <div className="flex items-center gap-2.5 flex-1">
            {/* Google G logo */}
            <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs">
              <span className="text-blue-400">G</span>
              <span className="text-red-400">o</span>
              <span className="text-yellow-400">o</span>
              <span className="text-blue-400">g</span>
            </div>
            <input
              type="text"
              placeholder="Search or type URL"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mic className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <button
              onClick={() => onOpenApp('camera')}
              className="hover:text-emerald-400 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
              title="Quick Camera Scan with CarDetect AI"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE: Primary App Grid with CAR DETECT AI PROMINENTLY FEATURED */}
      <div className="my-auto py-4 z-10">
        {/* Prominent Featured App Widget / Hero Launch Banner */}
        <div
          onClick={() => onOpenApp()}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 hover:border-emerald-400/80 transition-all cursor-pointer shadow-xl group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5">
            <CarDetectAppIcon size={58} showBadge className="group-hover:scale-105 transition-transform" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  CarDetect AI
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                Tap to scan car make, model & colour
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
                <span>Launch App</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Android App Icons Grid */}
        <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
          {/* 1. CarDetect AI App Icon */}
          <button
            onClick={() => onOpenApp()}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="relative">
              <CarDetectAppIcon
                size={54}
                showBadge
                className="group-hover:scale-110 active:scale-95 transition-transform shadow-emerald-950/80"
              />
              {/* Highlight halo */}
              <div className="absolute -inset-1 rounded-2xl bg-emerald-500/30 blur-xs -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
            </div>
            <span className="text-[11px] font-semibold text-white tracking-tight truncate max-w-[68px] drop-shadow-xs">
              CarDetect AI
            </span>
          </button>

          {/* 2. Camera Icon */}
          <button
            onClick={() => onOpenApp('camera')}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 active:scale-95 transition-transform border border-slate-600/50">
              <Camera className="w-6 h-6 text-slate-100" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 tracking-tight truncate max-w-[68px]">
              Camera
            </span>
          </button>

          {/* 3. Photos / Gallery Icon */}
          <button
            onClick={() => onOpenApp('gallery')}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 active:scale-95 transition-transform border border-blue-400/40">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 tracking-tight truncate max-w-[68px]">
              Photos
            </span>
          </button>

          {/* 4. Settings / System Info */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center gap-1.5 group focus:outline-none"
          >
            <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-slate-300 shadow-md group-hover:scale-110 active:scale-95 transition-transform border border-slate-600/40">
              <Settings className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 tracking-tight truncate max-w-[68px]">
              Settings
            </span>
          </button>
        </div>
      </div>

      {/* BOTTOM: Android App Dock / Favorites Bar */}
      <div className="z-10 pt-2 pb-1">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-2.5 backdrop-blur-lg flex items-center justify-around shadow-xl">
          {/* Phone app */}
          <button
            onClick={() => onOpenApp()}
            className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="Phone"
          >
            <Phone className="w-5 h-5 fill-current" />
          </button>

          {/* Messages */}
          <button
            onClick={() => onOpenApp()}
            className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
          </button>

          {/* Main CarDetect AI App Dock Icon */}
          <button
            onClick={() => onOpenApp()}
            className="relative active:scale-90 transition-transform"
            title="Open CarDetect AI"
          >
            <CarDetectAppIcon size={50} showBadge />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </button>

          {/* Browser / Chrome */}
          <button
            onClick={() => onOpenApp()}
            className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="Chrome"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Direct Camera */}
          <button
            onClick={() => onOpenApp('camera')}
            className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="Camera"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Settings & App Info Sheet Modal */}
      {showSettingsModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 w-full max-w-sm text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CarDetectAppIcon size={32} />
                <div>
                  <h4 className="font-bold text-white text-sm">CarDetect AI Info</h4>
                  <p className="text-[10px] text-slate-400">Android OS 15 • Kotlin Edition</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Vision Engine</span>
                <span className="font-mono text-emerald-400 font-semibold">Gemini 3.8 Flash</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Target Framework</span>
                <span className="font-mono text-blue-400 font-semibold">Jetpack Compose (Kotlin)</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Capabilities</span>
                <span className="text-slate-200 font-medium">Make, Model, Colour</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenCodeModal();
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                View Kotlin Code
              </button>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenApp();
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
              >
                Open CarDetect AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
