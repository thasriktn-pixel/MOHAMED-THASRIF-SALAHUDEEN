/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined in the backend. Please configure it in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// AI Service Recommendation Endpoint
app.post('/api/gemini/recommendations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, year, mileage, complaints, serviceHistory, availableTemplates } = req.body;

    const ai = getAiClient();

    const systemInstruction = `You are a professional Master Automotive Diagnostic AI for Sri Lankan auto workshops.
Analyze the vehicle's details (make, model, year, mileage, and user complaints/service history) and recommend specific repair/preventative maintenance tasks.
You must cross-reference your recommendations with the available service templates in the workshop, but you can also suggest custom services if highly necessary.
Ensure your response is highly specific to the vehicle type (e.g. hybrid systems for Suzuki Wagon R, Toyota Aqua/Vezel, or specific engine details).`;

    const prompt = `Vehicle Details:
Make: ${make}
Model: ${model}
Year: ${year}
Mileage: ${mileage} km
Current Issues/Complaints: ${complaints || 'None reported'}
Recent Service History: ${serviceHistory || 'None recorded'}

Available Workshop Service Templates:
${JSON.stringify(availableTemplates)}

Recommend preventative maintenance and repairs. Return your recommendations in the requested JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedTemplates: {
              type: Type.ARRAY,
              description: 'List of IDs of existing service templates from the provided list that are recommended.',
              items: { type: Type.STRING }
            },
            customRecommendations: {
              type: Type.ARRAY,
              description: 'New custom services recommended that are NOT in the templates list.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER, description: 'Estimated price in LKR (Sri Lankan Rupees).' }
                },
                required: ['name', 'description', 'estimatedPrice']
              }
            },
            explanation: {
              type: Type.STRING,
              description: 'A detailed master diagnostic summary justifying the recommendations based on the vehicle mileage, age, make, and complaints.'
            },
            partsToPrepare: {
              type: Type.ARRAY,
              description: 'Spare parts recommended to be kept ready for these tasks.',
              items: { type: Type.STRING }
            },
            diagnosticSteps: {
              type: Type.ARRAY,
              description: 'A structural checklist of specific mechanical/electronic tests the technician should run first.',
              items: { type: Type.STRING }
            }
          },
          required: ['recommendedTemplates', 'customRecommendations', 'explanation', 'partsToPrepare', 'diagnosticSteps']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini returned empty response text.');
    }

    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while generating recommendations.',
      isMissingKey: !process.env.GEMINI_API_KEY
    });
  }
});

// Setup Vite Dev Server / Serve Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static files from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TS Workshop Manager backend running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start TS Workshop Manager server:', err);
});
