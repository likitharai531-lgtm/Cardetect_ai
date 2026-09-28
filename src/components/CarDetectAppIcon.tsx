import React from 'react';

interface CarDetectAppIconProps {
  size?: number | string;
  className?: string;
  showBadge?: boolean;
}

export const CarDetectAppIcon: React.FC<CarDetectAppIconProps> = ({
  size = 56,
  className = '',
  showBadge = false,
}) => {
  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center shadow-lg transition-transform ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)',
      }}
    >
      {/* Outer subtle ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />

      {/* Futuristic Car Silhouette SVG */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 text-white drop-shadow-md"
      >
        {/* Car body */}
        <path
          d="M7 28L11.5 17.5C12.2 15.8 13.8 14.8 15.6 14.8H32.4C34.2 14.8 35.8 15.8 36.5 17.5L41 28M7 28V36C7 37.1 7.9 38 9 38H11C12.1 38 13 37.1 13 36V34H35V36C35 37.1 35.9 38 37 38H39C40.1 38 41 37.1 41 36V28M7 28H41"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Windshield */}
        <path
          d="M13.5 25L16.2 18H31.8L34.5 25H13.5Z"
          fill="currentColor"
          fillOpacity="0.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Headlights */}
        <circle cx="12" cy="30" r="2.5" fill="#38bdf8" />
        <circle cx="36" cy="30" r="2.5" fill="#38bdf8" />
        {/* AI sparkle in center */}
        <path
          d="M24 20L25 22L27 23L25 24L24 26L23 24L21 23L23 22L24 20Z"
          fill="#fef08a"
        />
      </svg>

      {/* Notification / AI active badge */}
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 text-[9px] font-bold text-white items-center justify-center">
            AI
          </span>
        </span>
      )}
    </div>
  );
};
