import { Router } from 'express';
import { RagController } from './rag.controller';
const router = Router();

router.get("/stats", RagController.getStats)
router.post("/ingest-ideas", RagController.ingestIdeasData)
router.post("/ingest-attachments", RagController.ingestAttachmentsData)
router.post("/ingest-platform", RagController.ingestPlatformData)
router.post("/query", RagController.qyeryRag)

export const RagRoutes: Router = router;