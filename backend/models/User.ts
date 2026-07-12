import { User as PrismaUser } from "@prisma/client";

export type User = PrismaUser;

export interface RegisterUserInput {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  departmentId?: string;
  roleId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  roleId?: string;
  password?: string;
}

export function validateUserRegistration(input: any): string[] {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!input.email || !emailRegex.test(input.email)) {
    errors.push("A valid email address is required");
  }
  if (!input.password || input.password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long");
  }
  if (!input.firstName || input.firstName.trim().length === 0) {
    errors.push("First name is required");
  }
  if (!input.lastName || input.lastName.trim().length === 0) {
    errors.push("Last name is required");
  }
  return errors;
}

export function validateUserLogin(input: any): string[] {
  const errors: string[] = [];
  if (!input.email) {
    errors.push("Email is required");
  }
  if (!input.password) {
    errors.push("Password is required");
  }
  return errors;
}
