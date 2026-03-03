import { type IncomingMessage, type ServerResponse } from 'http';
import { getAllRecords, createRecord } from '../src/storage/jsonFileStorage';
import type { ContractorWorkRecordCreate } from '../src/domain/contractorWorkRecord';

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
): Promise<void> {
  if (req.method === 'GET') {
    try {
      const records = await getAllRecords();
      const body = JSON.stringify(records);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', Buffer.byteLength(body));
      res.end(body);
    } catch (error) {
      console.error('GET /api/work-records', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to fetch work records' }));
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
      const input = JSON.parse(raw) as ContractorWorkRecordCreate;
      const record = await createRecord(input);
      const body = JSON.stringify(record);
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Length', Buffer.byteLength(body));
      res.end(body);
    } catch (error) {
      console.error('POST /api/work-records', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create work record';
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

