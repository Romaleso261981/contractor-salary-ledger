import { type IncomingMessage, type ServerResponse } from 'http';
import { deleteRecord } from '../src/storage/jsonFileStorage';

export default async function handler(
  req: IncomingMessage & { method?: string; url?: string },
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'DELETE') {
    res.statusCode = 405;
    res.setHeader('Allow', 'DELETE');
    res.end();
    return;
  }

  const url = req.url ?? '';
  const id = url.split('/').pop() ?? '';

  try {
    const deleted = await deleteRecord(id);
    if (!deleted) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Record not found' }));
      return;
    }
    res.statusCode = 204;
    res.end();
  } catch (error) {
    console.error('DELETE /api/work-records/:id', error);
    const message =
      error instanceof Error ? error.message : 'Failed to delete work record';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}

