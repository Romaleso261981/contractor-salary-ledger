import { type IncomingMessage, type ServerResponse } from 'http';
import { deleteExpense } from '../src/storage/expenseStorage';

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
    const deleted = await deleteExpense(id);
    if (!deleted) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Expense not found' }));
      return;
    }
    res.statusCode = 204;
    res.end();
  } catch (error) {
    console.error('DELETE /api/expenses/:id', error);
    const message =
      error instanceof Error ? error.message : 'Failed to delete expense';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}

