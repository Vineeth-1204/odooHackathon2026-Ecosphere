import { Role as PrismaRole } from "@prisma/client";

export type Role = PrismaRole;

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export function validateRole(input: any): string[] {
  const errors: string[] = [];
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Role name is required and must be a non-empty string");
  }
  return errors;
}
