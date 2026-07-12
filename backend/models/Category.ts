import { Category as PrismaCategory } from "@prisma/client";

export type Category = PrismaCategory;

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export function validateCategory(input: any): string[] {
  const errors: string[] = [];
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Category name is required and must be a non-empty string");
  }
  return errors;
}
