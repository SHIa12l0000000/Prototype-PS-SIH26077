import { Router } from 'express';

const router = Router();

interface Post {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
}

const posts: Post[] = [
  {
    id: 'post_001',

    createdAt: new Date().toISOString(),

    text:
      'AI security update: New cybersecurity models are improving threat detection.',

    rationale:
      'Selected because AI security is a rapidly growing technology trend.',

    sources: [
      'https://example.com/ai-security'
    ]
  }
];

router.get('/posts', (_req, res) => {
  res.json({
    posts
  });
});

export default router;