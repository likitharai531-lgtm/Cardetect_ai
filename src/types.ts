export interface CarDetectionResult {
  isCarDetected: boolean;
  make: string;
  model: string;
  colour: string;
  colourHex?: string;
  bodyType?: string;
  confidence?: number;
  notes?: string;
}

export interface SampleCarImage {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  isCar: boolean;
}

export type ScanStep = 'idle' | 'encoding' | 'analyzing' | 'extracting' | 'completed' | 'error';
