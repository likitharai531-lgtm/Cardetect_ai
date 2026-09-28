import React from 'react';
import { AlertCircle, WifiOff, RefreshCw, XCircle, FileWarning } from 'lucide-react';

interface ErrorAlertProps {
  errorType: 'network' | 'invalid_image' | 'api' | 'general';
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  errorType,
  message,
  onRetry,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (errorType) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
      case 'invalid_image':
        return <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
    }
  };

  const getTitle = () => {
    switch (errorType) {
      case 'network':
        return 'Network Connection Problem';
      case 'invalid_image':
        return 'Invalid Image File';
      case 'api':
        return 'AI Recognition Error';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <div className="w-full bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 sm:p-4 text-slate-200 animate-in fade-in duration-200 shadow-md">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-rose-300 mb-0.5">{getTitle()}</h4>
          <p className="text-xs text-rose-100/80 leading-relaxed mb-3">{message}</p>

          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Detection
              </button>
            )}
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
