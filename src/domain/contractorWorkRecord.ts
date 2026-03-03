import { z } from 'zod';

export const contractorWorkRecordSchema = z.object({
  id: z.string(),
  contractorName: z.string().min(1),
  description: z.string().min(1),
  amountPaid: z.number().nonnegative().optional().default(0),
  currency: z.string().min(1),
  categoryIds: z.array(z.string()),
  conditionsNotes: z.string().optional(),
  // Дата виконання роботи (за бажанням користувача)
  workDate: z.string().optional(),
  createdAt: z.string(),
});

export const contractorWorkRecordCreateSchema =
  contractorWorkRecordSchema.omit({
    id: true,
    createdAt: true,
  });

export type ContractorWorkRecord = z.infer<typeof contractorWorkRecordSchema>;
export type ContractorWorkRecordCreate = z.infer<
  typeof contractorWorkRecordCreateSchema
>;

