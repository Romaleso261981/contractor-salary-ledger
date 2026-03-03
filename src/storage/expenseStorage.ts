import { promises as fs } from 'fs';
import { join } from 'path';
import {
  contractorExpenseSchema,
  contractorExpenseCreateSchema,
  type ContractorExpense,
  type ContractorExpenseCreate,
} from '../domain/contractorExpense';
import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const DATA_FILE = join(DATA_DIR, 'contractor-expenses.json');

async function ensureDataFileExists(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAll(): Promise<ContractorExpense[]> {
  await ensureDataFileExists();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw) as unknown;
  const array = Array.isArray(parsed) ? parsed : [];
  const results = array.map((item) => contractorExpenseSchema.safeParse(item));
  return results
    .filter((r): r is { success: true; data: ContractorExpense } => r.success)
    .map((r) => r.data);
}

async function writeAll(records: ContractorExpense[]): Promise<void> {
  await ensureDataFileExists();
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

export async function getAllExpenses(): Promise<ContractorExpense[]> {
  const records = await readAll();
  return [...records].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createExpense(
  input: ContractorExpenseCreate
): Promise<ContractorExpense> {
  const parsed = contractorExpenseCreateSchema.parse(input);
  const existing = await readAll();
  const record: ContractorExpense = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...parsed,
  };
  existing.push(record);
  await writeAll(existing);
  return record;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const existing = await readAll();
  const next = existing.filter((item) => item.id !== id);
  if (next.length === existing.length) return false;
  await writeAll(next);
  return true;
}
