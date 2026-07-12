import { EmissionFactor as PrismaEmissionFactor } from "@prisma/client";

export type EmissionFactor = PrismaEmissionFactor;

export interface CreateEmissionFactorInput {
  name: string;
  value: number;
  unit: string;
  categoryId: string;
  source?: string;
  year: number;
}

export interface UpdateEmissionFactorInput {
  name?: string;
  value?: number;
  unit?: string;
  categoryId?: string;
  source?: string;
  year?: number;
}

export function validateEmissionFactor(input: any): string[] {
  const errors: string[] = [];
  
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  }
  
  if (input.value === undefined || typeof input.value !== "number" || input.value < 0) {
    errors.push("Value is required and must be a non-negative number");
  }
  
  if (!input.unit || typeof input.unit !== "string" || input.unit.trim().length === 0) {
    errors.push("Unit is required and must be a non-empty string");
  }
  
  if (!input.categoryId || typeof input.categoryId !== "string" || input.categoryId.trim().length === 0) {
    errors.push("Category ID is required");
  }
  
  if (input.year === undefined || typeof input.year !== "number" || input.year < 1900 || input.year > 2100) {
    errors.push("Year must be a valid number between 1900 and 2100");
  }
  
  return errors;
}
