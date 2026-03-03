import { z } from 'zod';

export const contractorExpenseSchema = z.object({
  id: z.string(),
  contractorName: z.string().min(1),
  amount: z.number().nonnegative(),
  description: z.string().min(1),
  // Дата видачі коштів (за бажанням користувача)
  expenseDate: z.string().optional(),
  createdAt: z.string(),
});

export const contractorExpenseCreateSchema = contractorExpenseSchema.omit({
  id: true,
  createdAt: true,
});

export type ContractorExpense = z.infer<typeof contractorExpenseSchema>;
export type ContractorExpenseCreate = z.infer<
  typeof contractorExpenseCreateSchema
>;
