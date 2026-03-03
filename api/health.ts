import { type IncomingMessage, type ServerResponse } from 'http';

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const body = JSON.stringify({ status: 'ok' });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

