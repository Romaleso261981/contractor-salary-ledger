import { type IncomingMessage, type ServerResponse } from 'http';
import { deleteRecord, updateRecordAmount } from '../src/storage/jsonFileStorage';

export default async function handler(
  req: IncomingMessage & { method?: string; url?: string },
  res: ServerResponse
): Promise<void> {
  const url = req.url ?? '';
  const id = url.split('/').pop() ?? '';

  if (req.method === 'DELETE') {
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
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf8') || '{}';
      const body = JSON.parse(raw) as { amountPaid?: number | string };
      const rawAmount = body.amountPaid;
      const amountNumber =
        typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);

      if (Number.isNaN(amountNumber) || amountNumber < 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid amount' }));
        return;
      }

      const updated = await updateRecordAmount(id, amountNumber);
      if (!updated) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Record not found' }));
        return;
      }

      const responseBody = JSON.stringify(updated);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', Buffer.byteLength(responseBody));
      res.end(responseBody);
    } catch (error) {
      console.error('PATCH /api/work-records/:id', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update work record';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: message }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'DELETE, PATCH');
  res.end();
}

