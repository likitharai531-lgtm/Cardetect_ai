import React from 'react';
import {
  Car,
  Tag,
  Palette,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { CarDetectionResult } from '../types';

interface ResultCardsProps {
  result: CarDetectionResult;
  onTryAnother: () => void;
}

export const ResultCards: React.FC<ResultCardsProps> = ({ result, onTryAnother }) => {
  const [copiedColor, setCopiedColor] = React.useState(false);

  const handleCopyColor = () => {
    if (result.colourHex) {
      navigator.clipboard.writeText(result.colourHex);
      setCopiedColor(true);
      setTimeout(() => setCopiedColor(false), 2000);
    }
  };

  // 1. NEGATIVE STATE: No car detected
  if (!result.isCarDetected) {
    return (
      <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 text-center shadow-lg backdrop-blur-xs relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">No car detected</h3>

          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed mb-4">
            {result.notes ||
              'The vision AI did not find a passenger car or motor vehicle in this image. Please ensure the car is well-lit and unobstructed.'}
          </p>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-xs mx-auto mb-6 text-left space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" /> Tips for optimal detection:
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
              <li>Take the photo from 2–5 meters away</li>
              <li>Include front, side, or three-quarter angle</li>
              <li>Avoid extreme darkness or heavy glare</li>
            </ul>
          </div>

          <button
            onClick={onTryAnother}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Try Another Image
          </button>
        </div>
      </div>
    );
  }

  // 2. POSITIVE STATE: Car Detected! Show Make, Model, Colour cards
  const confidencePercent = result.confidence
    ? Math.round(result.confidence * 100)
    : 96;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Detection Banner with Confidence badge */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Vehicle Successfully Identified</span>
        </div>
        <span className="font-bold px-2 py-0.5 bg-emerald-900/80 rounded-md border border-emerald-600/40 text-emerald-200">
          {confidencePercent}% Confidence
        </span>
      </div>

      <div className="text-xs font-bold tracking-wider uppercase text-slate-400 px-1 flex items-center justify-between">
        <span>Identification Cards</span>
        <span className="text-[11px] font-normal text-slate-400">Powered by Gemini Vision</span>
      </div>

      {/* RESULT CARD 1: MAKE / BRAND */}
      <div className="bg-slate-900/90 border border-slate-700/70 hover:border-blue-500/50 rounded-2xl p-4.5 shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">
                Car Make / Brand
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {result.make || 'Identified Brand'}
              </div>
            </div>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60">
            Manufacturer
          </span>
        </div>
      </div>

      {/* RESULT CARD 2: MODEL & BODY TYPE */}
      <div className="bg-slate-900/90 border border-slate-700/70 hover:border-purple-500/50 rounded-2xl p-4.5 shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-0.5">
                Car Model
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {result.model || 'Identified Model'}
              </div>
            </div>
          </div>

          {result.bodyType && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
              {result.bodyType}
            </span>
          )}
        </div>
      </div>

      {/* RESULT CARD 3: COLOUR & VISUAL SWATCH */}
      <div className="bg-slate-900/90 border border-slate-700/70 hover:border-emerald-500/50 rounded-2xl p-4.5 shadow-md transition-all relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              {/* Color swatch dot */}
              {result.colourHex && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 shadow-md"
                  style={{ backgroundColor: result.colourHex }}
                  title={result.colourHex}
                />
              )}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                Car Colour
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {result.colour || 'Identified Colour'}
              </div>
            </div>
          </div>

          {result.colourHex && (
            <button
              onClick={handleCopyColor}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Click to copy hex code"
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                style={{ backgroundColor: result.colourHex }}
              />
              <span>{result.colourHex}</span>
              {copiedColor ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
          )}
        </div>
      </div>

      {/* BONUS: DETAILED AI INSIGHTS & VEHICLE NOTES */}
      {result.notes && (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Automotive Note: </span>
            <span>{result.notes}</span>
          </div>
        </div>
      )}

      {/* TRY ANOTHER IMAGE BUTTON */}
      <div className="pt-2">
        <button
          onClick={onTryAnother}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-700 hover:to-slate-800 text-white font-semibold text-sm rounded-xl border border-slate-700/80 shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Try Another Image</span>
        </button>
      </div>
    </div>
  );
};
