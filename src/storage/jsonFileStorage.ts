import { promises as fs } from 'fs';
import { join } from 'path';
import {
  contractorWorkRecordSchema,
  contractorWorkRecordCreateSchema,
  type ContractorWorkRecord,
  type ContractorWorkRecordCreate,
} from '../domain/contractorWorkRecord';
import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const DATA_FILE = join(DATA_DIR, 'contractor-work-records.json');

async function ensureDataFileExists(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAll(): Promise<ContractorWorkRecord[]> {
  await ensureDataFileExists();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw) as unknown;
  const array = Array.isArray(parsed) ? parsed : [];
  return array
    .map((item) => contractorWorkRecordSchema.safeParse(item))
    .filter((r) => r.success)
    .map((r) => r.data);
}

async function writeAll(
  records: ContractorWorkRecord[]
): Promise<ContractorWorkRecord[]> {
  await ensureDataFileExists();
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
  return records;
}

export async function getAllRecords(): Promise<ContractorWorkRecord[]> {
  const records = await readAll();
  return [...records].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createRecord(
  input: ContractorWorkRecordCreate
): Promise<ContractorWorkRecord> {
  const parsed = contractorWorkRecordCreateSchema.parse(input);
  const existing = await readAll();
  const now = new Date().toISOString();
  const record: ContractorWorkRecord = {
    id: String(Date.now()),
    createdAt: now,
    ...parsed,
  };
  existing.push(record);
  await writeAll(existing);
  return record;
}

export async function deleteRecord(id: string): Promise<boolean> {
  const existing = await readAll();
  const next = existing.filter((item) => item.id !== id);
  if (next.length === existing.length) return false;
  await writeAll(next);
  return true;
}

