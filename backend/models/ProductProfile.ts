import { ProductProfile as PrismaProductProfile } from "@prisma/client";

export type ProductProfile = PrismaProductProfile;

export interface CreateProductProfileInput {
  name: string;
  sku: string;
  description?: string;
  carbonFootprint: number;
  waterFootprint?: number;
  wasteGenerated?: number;
  recyclability?: number; // 0 to 100
  materialSourcing?: string;
  esgGrade: string; // A, B, C, D, E, F
}

export interface UpdateProductProfileInput {
  name?: string;
  sku?: string;
  description?: string;
  carbonFootprint?: number;
  waterFootprint?: number;
  wasteGenerated?: number;
  recyclability?: number;
  materialSourcing?: string;
  esgGrade?: string;
}

export function validateProductProfile(input: any): string[] {
  const errors: string[] = [];

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Product name is required");
  }

  if (!input.sku || typeof input.sku !== "string" || input.sku.trim().length === 0) {
    errors.push("Product SKU is required");
  }

  if (input.carbonFootprint === undefined || typeof input.carbonFootprint !== "number" || input.carbonFootprint < 0) {
    errors.push("Carbon footprint must be a non-negative number");
  }

  if (input.waterFootprint !== undefined && (typeof input.waterFootprint !== "number" || input.waterFootprint < 0)) {
    errors.push("Water footprint must be a non-negative number");
  }

  if (input.wasteGenerated !== undefined && (typeof input.wasteGenerated !== "number" || input.wasteGenerated < 0)) {
    errors.push("Waste generated must be a non-negative number");
  }

  if (input.recyclability !== undefined && (typeof input.recyclability !== "number" || input.recyclability < 0 || input.recyclability > 100)) {
    errors.push("Recyclability must be a number between 0 and 100");
  }

  if (!input.esgGrade || !["A", "B", "C", "D", "E", "F"].includes(input.esgGrade.toUpperCase())) {
    errors.push("ESG Grade must be one of: A, B, C, D, E, F");
  }

  return errors;
}
