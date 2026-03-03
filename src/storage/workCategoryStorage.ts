import { promises as fs } from 'fs';
import { join } from 'path';
import {
  contractorWorkCategories,
  type ContractorWorkCategory,
} from '../config/workCategories';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'contractor-work-categories.json');

async function ensureDataFileExists(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    if (!raw.trim()) {
      throw new Error('Empty categories file');
    }
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(contractorWorkCategories, null, 2),
      'utf8'
    );
  }
}

async function readAll(): Promise<ContractorWorkCategory[]> {
  await ensureDataFileExists();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  if (!raw.trim()) return [...contractorWorkCategories];
  const parsed = JSON.parse(raw) as unknown;
  const array = Array.isArray(parsed) ? parsed : [];
  return array.filter(
    (item): item is ContractorWorkCategory =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ContractorWorkCategory).id === 'string' &&
      typeof (item as ContractorWorkCategory).name === 'string'
  );
}

async function writeAll(
  categories: ContractorWorkCategory[]
): Promise<ContractorWorkCategory[]> {
  await ensureDataFileExists();
  await fs.writeFile(DATA_FILE, JSON.stringify(categories, null, 2), 'utf8');
  return categories;
}

export async function getAllCategories(): Promise<ContractorWorkCategory[]> {
  const categories = await readAll();
  return [...categories];
}

function generateId(name: string, existing: ContractorWorkCategory[]): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-а-яіїєґ]/gi, '');

  if (!base) {
    return String(Date.now());
  }

  let candidate = base;
  let suffix = 1;
  while (existing.some((c) => c.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createCategory(
  name: string
): Promise<ContractorWorkCategory> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name is required');
  }

  const existing = await readAll();
  const id = generateId(trimmed, existing);
  const category: ContractorWorkCategory = { id, name: trimmed };
  existing.push(category);
  await writeAll(existing);
  return category;
}

