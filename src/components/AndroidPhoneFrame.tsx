import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2 } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenCodeModal: () => void;
  currentScreen?: 'home' | 'app';
  onNavigateHome?: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isFrameMode,
  onToggleFrameMode,
  onOpenCodeModal,
  currentScreen = 'home',
  onNavigateHome,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Desktop Navigation & Controls Bar */}
      <header className="w-full max-w-5xl mb-4 px-4 py-2 hidden sm:flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              CarDetect AI
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Android & Kotlin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Gemini Vision Automotive Recognition Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Home Screen Toggle */}
          <button
            onClick={onNavigateHome}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              currentScreen === 'home'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <span>📱 Android Home Screen</span>
          </button>

          {/* Kotlin Code & Android Studio Project button */}
          <button
            onClick={onOpenCodeModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all hover:border-emerald-500/40 shadow-xs"
          >
            <span>Kotlin & Android Studio Code</span>
          </button>

          {/* Frame View Toggle */}
          <button
            onClick={onToggleFrameMode}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-colors"
            title={isFrameMode ? 'Switch to Full Screen View' : 'Switch to Android Phone Frame'}
          >
            {isFrameMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Full Width</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isFrameMode
            ? 'max-w-[430px] rounded-[44px] border-[10px] border-slate-800 bg-slate-900 shadow-2xl relative overflow-hidden ring-1 ring-slate-700/50 my-auto'
            : 'max-w-md w-full min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-slate-800 bg-slate-900 shadow-xl overflow-hidden'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full bg-slate-950/80 px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none z-30">
          <span className="font-semibold text-slate-200 tracking-tight">{currentTime}</span>

          {/* Center Punch-hole Camera (in Frame Mode) */}
          {isFrameMode && (
            <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Wifi className="w-3 h-3" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Scrollable Child Content */}
        <div className="w-full min-h-[620px] max-h-[820px] overflow-y-auto scrollbar-none flex flex-col bg-slate-925">
          {children}
        </div>

        {/* Android Gesture Navigation Pill */}
        <div
          onClick={currentScreen === 'app' ? onNavigateHome : undefined}
          className={`w-full bg-slate-950/90 py-3 flex flex-col items-center justify-center z-30 border-t border-slate-900 transition-colors ${
            currentScreen === 'app' ? 'cursor-pointer hover:bg-slate-900 active:scale-98 group' : ''
          }`}
          title={currentScreen === 'app' ? 'Swipe / Tap to Return to Android Home Screen' : undefined}
        >
          <div
            className={`w-32 h-1 rounded-full transition-all ${
              currentScreen === 'app'
                ? 'bg-slate-400 group-hover:bg-emerald-400 group-hover:w-36'
                : 'bg-slate-600'
            }`}
          />
          {currentScreen === 'app' && (
            <span className="text-[9px] text-slate-400 group-hover:text-emerald-400 mt-0.5 tracking-tight">
              Tap bar to return to Home Screen
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
