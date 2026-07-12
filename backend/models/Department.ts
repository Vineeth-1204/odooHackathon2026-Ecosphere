import { Department as PrismaDepartment } from "@prisma/client";

export type Department = PrismaDepartment;

export interface CreateDepartmentInput {
  name: string;
  description?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  description?: string;
}

export function validateDepartment(input: any): string[] {
  const errors: string[] = [];
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Department name is required and must be a non-empty string");
  }
  return errors;
}
