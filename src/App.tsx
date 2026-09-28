import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Car,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  X,
  ChevronRight,
  UploadCloud,
  Check,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { CarDetectionResult, ScanStep, SampleCarImage } from './types';
import { SAMPLE_IMAGES } from './data/sampleImages';
import { CameraModal } from './components/CameraModal';
import { ResultCards } from './components/ResultCards';
import { ErrorAlert } from './components/ErrorAlert';
import { AndroidStudioCodeModal } from './components/AndroidStudioCodeModal';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { AndroidHomeScreen } from './components/AndroidHomeScreen';
import { CarDetectAppIcon } from './components/CarDetectAppIcon';

export default function App() {
  // Screen routing: 'home' (Android Home Page with App Icon) or 'app' (CarDetect AI)
  const [currentScreen, setCurrentScreen] = useState<'home' | 'app'>('home');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<CarDetectionResult | null>(null);
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'invalid_image' | 'api' | 'general'>('general');

  // Modals & view states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isFrameMode, setIsFrameMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // File input ref for Gallery
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Track network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (errorType === 'network') {
        setErrorMessage(null);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setErrorType('network');
      setErrorMessage('You are currently offline. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [errorType]);

  // Launch app from home screen icon
  const handleOpenApp = (initialAction?: 'camera' | 'gallery') => {
    setCurrentScreen('app');
    if (initialAction === 'camera') {
      setTimeout(() => setIsCameraOpen(true), 250);
    } else if (initialAction === 'gallery') {
      setTimeout(() => fileInputRef.current?.click(), 250);
    }
  };

  // Gallery file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous results/errors
    resetErrors();
    setDetectionResult(null);

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setErrorType('invalid_image');
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setErrorType('invalid_image');
      setErrorMessage('Image is too large (maximum 20MB). Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setSelectedImageName(file.name);
    };
    reader.onerror = () => {
      setErrorType('invalid_image');
      setErrorMessage('Failed to read the image file. Please try another image.');
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  // Camera capture handler
  const handleCameraCapture = (dataUrl: string) => {
    resetErrors();
    setDetectionResult(null);
    setSelectedImage(dataUrl);
    setSelectedImageName(`Camera_Photo_${new Date().toLocaleTimeString().replace(/:/g, '')}.jpg`);
  };

  // Sample image selection
  const handleSelectSample = async (sample: SampleCarImage) => {
    resetErrors();
    setDetectionResult(null);
    setSelectedImageName(sample.title);

    try {
      // Fetch and convert sample url to base64 so it can be reliably analyzed
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback: use direct URL if fetch fails
      setSelectedImage(sample.url);
    }
  };

  const resetErrors = () => {
    setErrorMessage(null);
  };

  const handleTryAnother = () => {
    setSelectedImage(null);
    setSelectedImageName('');
    setDetectionResult(null);
    setScanStep('idle');
    resetErrors();
  };

  // Detect Car with Google Gemini Vision API
  const handleDetectCar = async () => {
    if (!selectedImage) return;

    if (!navigator.onLine) {
      setErrorType('network');
      setErrorMessage('You are offline. Please connect to the internet to run car recognition.');
      return;
    }

    resetErrors();
    setScanStep('encoding');
    setLoadingMessage('Optimizing image for Gemini Vision...');

    try {
      // Step 1: Convert image to clean base64 if needed
      let base64String = selectedImage;
      let mimeType = 'image/jpeg';

      if (selectedImage.startsWith('http')) {
        // Fetch URL and convert
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        mimeType = blob.type || 'image/jpeg';
        base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else if (selectedImage.startsWith('data:')) {
        const match = selectedImage.match(/data:(.*?);base64,/);
        if (match && match[1]) {
          mimeType = match[1];
        }
      }

      setScanStep('analyzing');
      setLoadingMessage('Scanning vehicle features with Gemini Vision AI...');

      // Call our server endpoint
      const response = await fetch('/api/detect-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: mimeType,
        }),
      });

      setScanStep('extracting');
      setLoadingMessage('Extracting Make, Model & Colour cards...');

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to detect car. Server returned an error.');
      }

      setDetectionResult(data.data);
      setScanStep('completed');
    } catch (err: any) {
      console.error('Detection error:', err);
      setScanStep('error');
      if (err.message && err.message.toLowerCase().includes('network') || !navigator.onLine) {
        setErrorType('network');
        setErrorMessage('Network connection lost or request timed out. Please check your connection and retry.');
      } else {
        setErrorType('api');
        setErrorMessage(err?.message || 'Error communicating with Gemini Vision API. Please try again.');
      }
    }
  };

  const isScanning = scanStep === 'encoding' || scanStep === 'analyzing' || scanStep === 'extracting';

  return (
    <AndroidPhoneFrame
      isFrameMode={isFrameMode}
      onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
      onOpenCodeModal={() => setIsCodeModalOpen(true)}
      currentScreen={currentScreen}
      onNavigateHome={() => setCurrentScreen('home')}
    >
      {/* Hidden file input for Gallery button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        className="hidden"
      />

      {/* RENDER SCREEN BASED ON STATE:
          1. 'home': ANDROID HOME PAGE WITH APP ICON
          2. 'app': CARDETECT AI APPLICATION INTERFACE */}
      {currentScreen === 'home' ? (
        <AndroidHomeScreen
          onOpenApp={handleOpenApp}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
        />
      ) : (
        /* APP VIEW */
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Android Top App Bar */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Back to Home Screen button */}
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                title="Return to Android Home Screen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* App Icon + Title */}
              <div className="flex items-center gap-2">
                <CarDetectAppIcon size={30} />
                <div>
                  <h2 className="text-sm font-extrabold text-white tracking-tight leading-none">
                    CarDetect AI
                  </h2>
                  <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                    Gemini Vision
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Home button */}
              <button
                onClick={() => setCurrentScreen('home')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Android Home"
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Kotlin Code Button */}
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold border border-slate-700/80 transition-colors"
                title="View Android Studio Kotlin source code"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Kotlin</span>
              </button>
            </div>
          </div>

          {/* Main App Content Area */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4">
            {/* Error notification banner if any */}
            {errorMessage && (
              <ErrorAlert
                errorType={errorType}
                message={errorMessage}
                onRetry={handleDetectCar}
                onDismiss={() => setErrorMessage(null)}
              />
            )}

            {/* 1. IMAGE PREVIEW SECTION */}
            <div className="w-full">
              <div className="relative w-full aspect-[4/3] max-h-[280px] rounded-2xl bg-slate-950/80 border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Car preview"
                      className="w-full h-full object-cover transition-transform duration-300"
                    />

                    {/* Laser scan line animation during detection */}
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser-scan" />
                        <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px]" />
                      </div>
                    )}

                    {/* Top overlay badge with file name & clear button */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                      <span className="text-[10px] font-medium bg-black/70 text-slate-200 px-2.5 py-1 rounded-full backdrop-blur-md truncate max-w-[200px]">
                        {selectedImageName || 'Selected Photo'}
                      </span>
                      <button
                        onClick={handleTryAnother}
                        disabled={isScanning}
                        className="w-7 h-7 rounded-full bg-black/70 hover:bg-red-600/90 text-white flex items-center justify-center backdrop-blur-md transition-colors shadow-sm"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Empty state placeholder with App Icon */
                  <div className="p-6 text-center flex flex-col items-center justify-center">
                    <div className="mb-3 transform group-hover:scale-105 transition-transform">
                      <CarDetectAppIcon size={58} showBadge />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Select or Capture a Car</h4>
                    <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                      Use the camera or gallery below to identify Make, Model & Colour.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. CAMERA AND GALLERY BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              {/* Camera Button */}
              <button
                onClick={() => setIsCameraOpen(true)}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/90 active:scale-97 text-slate-100 font-semibold text-xs border border-slate-700 transition-all shadow-xs disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Camera</span>
              </button>

              {/* Gallery Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/90 active:scale-97 text-slate-100 font-semibold text-xs border border-slate-700 transition-all shadow-xs disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Gallery</span>
              </button>
            </div>

            {/* 3. DETECT CAR BUTTON */}
            <button
              onClick={handleDetectCar}
              disabled={!selectedImage || isScanning}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 ${
                selectedImage && !isScanning
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 cursor-pointer ring-2 ring-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Car...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Detect Car</span>
                </>
              )}
            </button>

            {/* 4. LOADING INDICATOR WITH STEP-BY-STEP PROGRESS */}
            {isScanning && (
              <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-3 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    {loadingMessage}
                  </span>
                </div>

                {/* Stepper indicator pills */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      scanStep === 'encoding' ? 'w-8 bg-emerald-400' : 'w-2 bg-emerald-600'
                    }`}
                  />
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      scanStep === 'analyzing' ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      scanStep === 'extracting' ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* 5. RESULTS SECTION */}
            {detectionResult && (
              <ResultCards
                result={detectionResult}
                onTryAnother={handleTryAnother}
              />
            )}

            {/* 6. SAMPLE TEST IMAGES */}
            {!detectionResult && !isScanning && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Test Samples
                  </span>
                  <span className="text-[10px] text-slate-400">1-Tap to Test</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-200 truncate">
                          {sample.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {sample.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Kotlin Android Studio Code Drawer Modal */}
      <AndroidStudioCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </AndroidPhoneFrame>
  );
}
