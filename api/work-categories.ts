import { type IncomingMessage, type ServerResponse } from 'http';
import { getAllCategories, createCategory } from '../src/storage/workCategoryStorage';

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
): Promise<void> {
  if (req.method === 'GET') {
    try {
      const categories = await getAllCategories();
      const body = JSON.stringify(categories);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', Buffer.byteLength(body));
      res.end(body);
    } catch (error) {
      console.error('GET /api/work-categories', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch work categories' }));
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf8') || '{}';
      const bodyJson = JSON.parse(raw) as { name?: string };
      const name =
        typeof bodyJson?.name === 'string'
          ? bodyJson.name
          : String(bodyJson?.name ?? '');
      const category = await createCategory(name);
      const body = JSON.stringify(category);
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', Buffer.byteLength(body));
      res.end(body);
    } catch (error) {
      console.error('POST /api/work-categories', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create work category';
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: message }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  res.end();
}

