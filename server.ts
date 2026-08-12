import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  analyzeSkinWithGemini,
  generateRoutineWithGemini,
  analyzeIngredientsWithGemini,
  generateDermatologistConsultWithGemini,
} from './src/server/geminiService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Skin Assessment Endpoint
  app.post('/api/skin-assessment', async (req, res) => {
    try {
      const { imageDataUri, questionnaire } = req.body;
      const result = await analyzeSkinWithGemini(imageDataUri, questionnaire);
      res.json({ success: true, assessment: result });
    } catch (error: any) {
      console.error('API Error in /api/skin-assessment:', error);
      res.status(500).json({ success: false, error: error.message || 'Assessment failed' });
    }
  });

  // AI Routine Generation Endpoint
  app.post('/api/generate-routine', async (req, res) => {
    try {
      const { userProfile, assessment } = req.body;
      const routine = await generateRoutineWithGemini(userProfile, assessment);
      res.json({ success: true, routine });
    } catch (error: any) {
      console.error('API Error in /api/generate-routine:', error);
      res.status(500).json({ success: false, error: error.message || 'Routine generation failed' });
    }
  });

  // Ingredient Intelligence & Clashes Endpoint
  app.post('/api/ingredient-check', async (req, res) => {
    try {
      const { ingredients, userProfile } = req.body;
      const analysis = await analyzeIngredientsWithGemini(ingredients || [], userProfile || {});
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error('API Error in /api/ingredient-check:', error);
      res.status(500).json({ success: false, error: error.message || 'Ingredient analysis failed' });
    }
  });

  // Dermatologist AI Consult Endpoint
  app.post('/api/consultation', async (req, res) => {
    try {
      const { userQuery, profile, assessment } = req.body;
      const consultResponse = await generateDermatologistConsultWithGemini(userQuery, profile, assessment);
      res.json({ success: true, response: consultResponse });
    } catch (error: any) {
      console.error('API Error in /api/consultation:', error);
      res.status(500).json({ success: false, error: error.message || 'Consultation failed' });
    }
  });

  // Export Report Endpoint
  app.post('/api/reports/export', (req, res) => {
    try {
      const { report, format } = req.body;
      if (format === 'csv') {
        const csvContent = `Report Title,Date,User,Health Score,Type\n"${report.title}","${report.date}","${report.userName}","${report.score}","${report.type}"`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="skincare_report_${Date.now()}.csv"`);
        return res.send(csvContent);
      } else {
        // Formatted printable report JSON / text
        res.json({
          success: true,
          downloadUrl: `#`,
          reportData: report,
          formattedText: `
AI SKIN INTELLIGENCE PLATFORM - CLINICAL REPORT
=====================================================
Title: ${report.title || 'Skin Health Report'}
Date: ${report.date || new Date().toLocaleDateString()}
Patient: ${report.userName || 'Sophia Chen'}
Health Score: ${report.score || 82}/100
Report Type: ${report.type || 'Skin Assessment'}

EXECUTIVE SUMMARY:
${report.summary || 'N/A'}

CONCERNS & SEVERITY:
${(report.concernsList || []).join('\n- ')}

PRESCRIBED CARE PLAN:
${report.prescribedPlan || 'N/A'}

Verified by: AI Skin Intelligence & Clinical Dermatology Engine
=====================================================
          `,
        });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve Frontend / Vite Middleware
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
