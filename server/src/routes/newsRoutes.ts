import { Router } from 'express';
import { getNews, createNews, upvoteNews } from '../controllers/newsController.js';

const router = Router();

router.get('/news', getNews);
router.post('/news', createNews);
router.post('/news/:id/upvote', upvoteNews);

export default router;
