import express from 'express';
import path from 'path';
import cors from 'cors';
import {
  getAllRecords,
  createRecord,
  deleteRecord,
  updateRecordAmount,
} from '../storage/jsonFileStorage';
import {
  getAllExpenses,
  createExpense,
  deleteExpense,
} from '../storage/expenseStorage';
import { getAllCategories, createCategory } from '../storage/workCategoryStorage';
import type {
  ContractorWorkRecord,
  ContractorWorkRecordCreate,
} from '../domain/contractorWorkRecord';
import type { ContractorExpenseCreate } from '../domain/contractorExpense';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/work-records', async (_req, res) => {
  try {
    const records = await getAllRecords();
    res.json(records);
  } catch (error) {
    console.error('GET /work-records', error);
    res.status(500).json({ error: 'Failed to fetch work records' });
  }
});

app.post('/work-records', async (req, res) => {
  try {
    const input = req.body as ContractorWorkRecordCreate;
    const record = await createRecord(input);
    res.status(201).json(record);
  } catch (error) {
    console.error('POST /work-records', error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : 'Failed to create work record',
    });
  }
});

app.delete('/work-records/:id', async (req, res) => {
  try {
    const deleted = await deleteRecord(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('DELETE /work-records/:id', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to delete work record',
    });
  }
});

app.patch('/work-records/:id', async (req, res) => {
  try {
    const rawAmount = req.body?.amountPaid;
    const amountNumber =
      typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    const updated = await updateRecordAmount(req.params.id, amountNumber);
    if (!updated) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error('PATCH /work-records/:id', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to update work record',
    });
  }
});

app.get('/work-categories', async (_req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('GET /work-categories', error);
    res.status(500).json({ error: 'Failed to fetch work categories' });
  }
});

app.post('/work-categories', async (req, res) => {
  try {
    const name =
      typeof req.body?.name === 'string' ? req.body.name : String(req.body?.name ?? '');
    const category = await createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    console.error('POST /work-categories', error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : 'Failed to create work category',
    });
  }
});

app.get('/expenses', async (_req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json(expenses);
  } catch (error) {
    console.error('GET /expenses', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/expenses', async (req, res) => {
  try {
    const input = req.body as ContractorExpenseCreate;
    const record = await createExpense(input);
    res.status(201).json(record);
  } catch (error) {
    console.error('POST /expenses', error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : 'Failed to create expense',
    });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    const deleted = await deleteExpense(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('DELETE /expenses/:id', error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to delete expense',
    });
  }
});

app.get('/summary', async (_req, res) => {
  try {
    const [records, expenses] = await Promise.all([
      getAllRecords(),
      getAllExpenses(),
    ]);
    const byContractor: Record<
      string,
      { earnings: number; expenses: number; balance: number; currency: string }
    > = {};
    for (const r of records) {
      let row = byContractor[r.contractorName];
      if (!row) {
        row = { earnings: 0, expenses: 0, balance: 0, currency: r.currency };
        byContractor[r.contractorName] = row;
      }
      row.earnings += r.amountPaid;
    }
    for (const e of expenses) {
      let row = byContractor[e.contractorName];
      if (!row) {
        row = { earnings: 0, expenses: 0, balance: 0, currency: 'UAH' };
        byContractor[e.contractorName] = row;
      }
      row.expenses += e.amount;
    }
    for (const name of Object.keys(byContractor)) {
      const row = byContractor[name]!;
      row.balance = row.earnings - row.expenses;
    }
    res.json(
      Object.entries(byContractor).map(([contractorName, data]) => ({
        contractorName,
        ...data,
      }))
    );
  } catch (error) {
    console.error('GET /summary', error);
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Contractor salary ledger API listening on http://localhost:${port}`);
});

