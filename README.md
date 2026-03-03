# Contractor Salary Ledger

Small standalone repository to track contractor work:

- what exactly was done;
- how much you paid and in which currency;
- which categories this work belongs to;
- short notes about the conditions you had to go through.

All data is stored as JSON, but validated by TypeScript + Zod schemas so the structure always stays under control.

## Quick start

```bash
npm install
npm run dev
```

The API will start on `http://localhost:3001`.

## API

All responses are JSON.

- `GET /health` — simple health check.
- `GET /work-records` — list all work records (latest first).
- `POST /work-records` — create new record.
- `DELETE /work-records/:id` — delete record.
- `GET /work-categories` — list available work categories.

### Work record shape

The main type is:

- `contractorName` — who did the work (e.g. `"Shorubeo"`).
- `description` — short description of what was done.
- `amountPaid` — how much you paid for this work.
- `currency` — e.g. `"грн"`, `"USD"`.
- `categoryIds` — array of category ids from `src/config/workCategories.ts`.
- `conditionsNotes` — optional short note about the conditions (what you had to go through).
- `createdAt` — ISO date string, auto‑filled.

### Example: create record

```bash
curl -X POST http://localhost:3001/work-records \
  -H "Content-Type: application/json" \
  -d '{
    "contractorName": "Shorubeo",
    "description": "Landing page layout and animations",
    "amountPaid": 5000,
    "currency": "грн",
    "categoryIds": ["development", "design"],
    "conditionsNotes": "Tight deadline, many design changes"
  }'
```

Data is saved to `data/contractor-work-records.json` in the repo folder.

