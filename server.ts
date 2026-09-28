import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support base64 image uploads up to 30mb
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY environment variable is not defined. Server will run in degraded mode.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'CarDetect AI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Car Detection Vision API endpoint
app.post('/api/detect-car', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid image file to analyze.',
      });
      return;
    }

    // Clean up base64 prefix if provided (e.g. data:image/jpeg;base64,...)
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      cleanBase64 = parts[1];
      const match = parts[0].match(/data:(.*)/);
      if (match && match[1]) {
        detectedMime = match[1];
      }
    }

    if (!cleanBase64 || cleanBase64.length < 50) {
      res.status(400).json({
        success: false,
        error: 'The image provided appears to be empty or corrupted. Please capture or upload another photo.',
      });
      return;
    }

    if (!apiKey) {
      // Return helpful fallback if no API key is yet configured
      res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured on the server. Please check your AI Studio secrets.',
      });
      return;
    }

    // Call Gemini Vision model with fallback models in case of temporary 503 high demand
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;
    let responseText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: detectedMime || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: `You are an expert automotive visual recognition AI system for the "CarDetect AI" Android application.
Inspect the provided image thoroughly.

TASK 1: Determine if this image contains a motor car / passenger automobile / SUV / pickup truck / sports car / van / minivan / electric vehicle.
- If there is a car visible (even partial or parked): isCarDetected = true.
- If there is NO car visible (e.g. it is a person, animal, bicycle, motorbike without cars, landscape, food, building, interior room, or abstract object): isCarDetected = false.

TASK 2: If isCarDetected is TRUE:
- make: Identify the vehicle manufacturer/brand (e.g., "Tesla", "Toyota", "Ford", "BMW", "Porsche", "Mercedes-Benz", "Honda", "Ferrari", "Lamborghini", "Audi", "Hyundai", "Volkswagen", "Chevrolet", etc.).
- model: Identify the specific car model and generation/year if identifiable (e.g., "Model 3 (Highland)", "Mustang GT Fastback", "Camry SE", "911 Carrera S", "Civic Type R", "Corvette Stingray").
- colour: Identify the prominent exterior body colour name (e.g., "Sonic Red Metallic", "Midnight Silver", "Nardo Grey", "Ultra White", "Racing Yellow", "British Racing Green", "Obsidian Black").
- colourHex: The closest representative 6-character hex code for that color, including the '#' (e.g., "#DC2626", "#1E293B", "#2563EB", "#F59E0B").
- bodyType: The vehicle body class (e.g., "Sedan", "Coupe", "SUV", "Sports Car", "Convertible", "Hatchback", "Pickup Truck", "Wagon", "Minivan").
- confidence: Your detection confidence between 0.00 and 1.00 (e.g., 0.96).
- notes: A concise 1-2 sentence fascinating overview, notable performance trait, or standout visual design detail of this car model.

TASK 3: If isCarDetected is FALSE:
- make: ""
- model: ""
- colour: ""
- colourHex: ""
- bodyType: ""
- confidence: 0.0
- notes: A brief, friendly sentence explaining what was observed instead (e.g., "Detected a domestic cat sitting indoors. No automotive vehicle was found in this photo.").`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isCarDetected: {
                  type: Type.BOOLEAN,
                  description: 'True if a car or automobile is detected in the image; false otherwise.',
                },
                make: {
                  type: Type.STRING,
                  description: "Car brand / manufacturer (e.g., 'Tesla', 'Porsche'). Empty if no car.",
                },
                model: {
                  type: Type.STRING,
                  description: "Car model name and year/generation (e.g., 'Model 3', '911 Carrera'). Empty if no car.",
                },
                colour: {
                  type: Type.STRING,
                  description: "Exterior colour name of the car (e.g., 'Deep Blue Metallic'). Empty if no car.",
                },
                colourHex: {
                  type: Type.STRING,
                  description: "Hex color code representation (e.g., '#1E3A8A'). Empty if no car.",
                },
                bodyType: {
                  type: Type.STRING,
                  description: "Body style class (Sedan, SUV, Coupe, Sports Car, etc.). Empty if no car.",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: 'Model confidence score between 0.0 and 1.0.',
                },
                notes: {
                  type: Type.STRING,
                  description: 'Short informative note about the vehicle or explanation if not a car.',
                },
              },
              required: ['isCarDetected'],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying next fallback:`, err?.message || err);
        lastError = err;
        // Small delay before trying next model
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!responseText) {
      throw lastError || new Error('All vision models failed to return analysis.');
    }

    const result = JSON.parse(responseText.trim());

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Detection API error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'An unexpected error occurred while communicating with the Gemini Vision API.',
    });
  }
});

// Server setup
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarDetect AI backend running on http://0.0.0.0:${PORT}`);
  });
}

start();
