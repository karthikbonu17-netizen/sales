import { Router } from 'express';
import { CONFIG } from '../config';
import { llmAdapter } from '../agents/llmAdapter';

const router = Router();

router.get('/status', (req, res) => {
  res.json({
    llmConfigured: llmAdapter.isConfigured(),
    model: CONFIG.OPENAI_MODEL,
    databaseType: CONFIG.DATABASE_TYPE,
    serverPort: CONFIG.PORT,
  });
});

export default router;
