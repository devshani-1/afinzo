import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateFinancialSummaryWithAI } from './src/server/geminiService.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for server-side Gemini financial analysis
  app.post('/api/analyze-summary', async (req, res) => {
    try {
      const { calculations } = req.body;
      if (!calculations) {
        return res.status(400).json({ success: false, error: 'Missing calculations data' });
      }
      const summary = await generateFinancialSummaryWithAI(calculations);
      res.json({ success: true, summary });
    } catch (error: any) {
      console.error('API analyze-summary error:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate summary' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Affinzo' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Affinzo server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

