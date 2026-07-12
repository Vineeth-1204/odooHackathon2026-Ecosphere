import { EnvironmentalGoal as PrismaEnvironmentalGoal } from "@prisma/client";

export type EnvironmentalGoal = PrismaEnvironmentalGoal;

export interface CreateEnvironmentalGoalInput {
  name: string;
  description?: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: string; // ACTIVE, ACHIEVED, FAILED
  departmentId?: string;
}

export interface UpdateEnvironmentalGoalInput {
  name?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  departmentId?: string;
}

export function validateEnvironmentalGoal(input: any): string[] {
  const errors: string[] = [];

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Goal name is required and must be a non-empty string");
  }

  if (input.targetValue === undefined || typeof input.targetValue !== "number" || input.targetValue <= 0) {
    errors.push("Target value must be a number greater than 0");
  }

  if (!input.unit || typeof input.unit !== "string" || input.unit.trim().length === 0) {
    errors.push("Unit is required and must be a non-empty string");
  }

  let start: Date | null = null;
  let end: Date | null = null;

  if (!input.startDate) {
    errors.push("Start date is required");
  } else {
    start = new Date(input.startDate);
    if (isNaN(start.getTime())) {
      errors.push("Invalid start date format");
      start = null;
    }
  }

  if (!input.endDate) {
    errors.push("End date is required");
  } else {
    end = new Date(input.endDate);
    if (isNaN(end.getTime())) {
      errors.push("Invalid end date format");
      end = null;
    }
  }

  if (start && end && start >= end) {
    errors.push("Start date must be strictly before the end date");
  }

  if (input.status && !["ACTIVE", "ACHIEVED", "FAILED"].includes(input.status)) {
    errors.push("Status must be one of: ACTIVE, ACHIEVED, FAILED");
  }

  return errors;
}
