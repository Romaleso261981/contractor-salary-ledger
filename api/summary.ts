import { type IncomingMessage, type ServerResponse } from 'http';
import { getAllRecords } from '../src/storage/jsonFileStorage';
import { getAllExpenses } from '../src/storage/expenseStorage';

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  try {
    const [records, expenses] = await Promise.all([
      getAllRecords(),
      getAllExpenses(),
    ]);

    const byContractor: Record<
      string,
      { earnings: number; expenses: number; balance: number; currency: string }
    > = {};

    for (const record of records) {
      let row = byContractor[record.contractorName];
      if (!row) {
        row = {
          earnings: 0,
          expenses: 0,
          balance: 0,
          currency: record.currency,
        };
        byContractor[record.contractorName] = row;
      }
      row.earnings += record.amountPaid;
    }

    for (const expense of expenses) {
      let row = byContractor[expense.contractorName];
      if (!row) {
        row = { earnings: 0, expenses: 0, balance: 0, currency: 'UAH' };
        byContractor[expense.contractorName] = row;
      }
      row.expenses += expense.amount;
    }

    for (const name of Object.keys(byContractor)) {
      const row = byContractor[name]!;
      row.balance = row.earnings - row.expenses;
    }

    const payload = Object.entries(byContractor).map(([contractorName, data]) => ({
      contractorName,
      ...data,
    }));

    const body = JSON.stringify(payload);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
  } catch (error) {
    console.error('GET /api/summary', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to compute summary' }));
  }
}

