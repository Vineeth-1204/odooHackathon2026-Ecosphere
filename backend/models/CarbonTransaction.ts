import { CarbonTransaction as PrismaCarbonTransaction } from "@prisma/client";

export type CarbonTransaction = PrismaCarbonTransaction;

export interface CreateCarbonTransactionInput {
  date: string | Date;
  description: string;
  activityValue: number;
  emissionFactorId: string;
  departmentId: string;
  userId: string;
}

export interface UpdateCarbonTransactionInput {
  date?: string | Date;
  description?: string;
  activityValue?: number;
  emissionFactorId?: string;
  departmentId?: string;
  userId?: string;
}

export function validateCarbonTransaction(input: any): string[] {
  const errors: string[] = [];
  
  if (!input.date) {
    errors.push("Date is required");
  } else {
    const parsedDate = new Date(input.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Invalid date format");
    }
  }
  
  if (!input.description || typeof input.description !== "string" || input.description.trim().length === 0) {
    errors.push("Description is required and must be a non-empty string");
  }
  
  if (input.activityValue === undefined || typeof input.activityValue !== "number" || input.activityValue <= 0) {
    errors.push("Activity quantity must be a number greater than 0");
  }
  
  if (!input.emissionFactorId || typeof input.emissionFactorId !== "string" || input.emissionFactorId.trim().length === 0) {
    errors.push("Emission Factor ID is required");
  }
  
  if (!input.departmentId || typeof input.departmentId !== "string" || input.departmentId.trim().length === 0) {
    errors.push("Department ID is required");
  }
  
  return errors;
}
