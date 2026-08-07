import { Request, Response } from 'express';
import { getNewsItems, addNewsItem, upvoteNewsItem } from '../services/newsService.js';

export const getNews = (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const items = getNewsItems(search, category);
    res.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNews = (req: Request, res: Response) => {
  try {
    const { title, summary, category, author, source, url, readTime, sentiment, impactScore, tags } = req.body;
    
    if (!title || !summary || !category) {
      return res.status(400).json({ success: false, error: 'Title, summary, and category are required fields.' });
    }

    const created = addNewsItem({
  title,

  summary,

  content: summary,

  category: category || 'LLMs',

  author: author || 'Community Contributor',

  source: source || 'User Submitted',

  url: url || 'https://techpulse.ai',

  readTime: readTime || '3 min read',

  sentiment: sentiment || 'Neutral',

  impactScore: Number(impactScore) || 75,

  aiGenerated: false,

  tags: Array.isArray(tags)
    ? tags
    : [String(category)]
});

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const upvoteNews = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = upvoteNewsItem(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'News item not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
