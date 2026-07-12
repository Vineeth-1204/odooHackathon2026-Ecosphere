import { Setting as PrismaSetting } from "@prisma/client";

export type Setting = PrismaSetting;

export interface UpdateSettingInput {
  key: string;
  value: string;
  description?: string;
}

export function validateSetting(input: any): string[] {
  const errors: string[] = [];
  if (!input.key || typeof input.key !== "string" || input.key.trim().length === 0) {
    errors.push("Setting key is required");
  }
  if (input.value === undefined || typeof input.value !== "string") {
    errors.push("Setting value is required and must be a string");
  }
  return errors;
}
