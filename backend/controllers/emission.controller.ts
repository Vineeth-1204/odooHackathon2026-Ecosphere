import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateEmissionFactor } from "../models/EmissionFactor";

const prisma = new PrismaClient();

// List all emission factors
export async function getEmissionFactors(req: Request, res: Response) {
  try {
    const { search, categoryId } = req.query;

    const whereClause: any = {};

    if (search && typeof search === "string" && search.trim().length > 0) {
      whereClause.name = {
        contains: search,
        mode: "insensitive"
      };
    }

    if (categoryId && typeof categoryId === "string" && categoryId.trim().length > 0) {
      whereClause.categoryId = categoryId;
    }

    const emissionFactors = await prisma.emissionFactor.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { name: "asc" }
    });

    return res.status(200).json({ emissionFactors });
  } catch (error: any) {
    console.error("Get Emission Factors Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching emission factors" });
  }
}

// Get emission factor by ID
export async function getEmissionFactorById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const emissionFactor = await prisma.emissionFactor.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!emissionFactor) {
      return res.status(404).json({ message: "Emission factor not found" });
    }

    return res.status(200).json({ emissionFactor });
  } catch (error: any) {
    console.error("Get Emission Factor By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching emission factor details" });
  }
}

// Create emission factor (Admin only)
export async function createEmissionFactor(req: Request, res: Response) {
  try {
    const validationErrors = validateEmissionFactor(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { name, value, unit, categoryId, source, year } = req.body;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(400).json({ message: "Specified category does not exist" });
    }

    // Check if factor with this name already exists
    const factorExists = await prisma.emissionFactor.findUnique({ where: { name } });
    if (factorExists) {
      return res.status(400).json({ message: "Emission factor with this name already exists" });
    }

    const newFactor = await prisma.emissionFactor.create({
      data: {
        name,
        value,
        unit,
        categoryId,
        source,
        year
      },
      include: {
        category: true
      }
    });

    return res.status(201).json({
      message: "Emission factor created successfully",
      emissionFactor: newFactor
    });
  } catch (error: any) {
    console.error("Create Emission Factor Error:", error);
    return res.status(500).json({ message: "Internal server error while creating emission factor" });
  }
}

// Update emission factor (Admin only)
export async function updateEmissionFactor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, value, unit, categoryId, source, year } = req.body;

    const originalFactor = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!originalFactor) {
      return res.status(404).json({ message: "Emission factor not found" });
    }

    const updateData: any = {};

    if (name && name !== originalFactor.name) {
      const nameExists = await prisma.emissionFactor.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(400).json({ message: "Another emission factor with this name already exists" });
      }
      updateData.name = name;
    }

    if (value !== undefined) {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({ message: "Value must be a non-negative number" });
      }
      updateData.value = value;
    }

    if (unit !== undefined) {
      if (typeof unit !== "string" || unit.trim().length === 0) {
        return res.status(400).json({ message: "Unit is required" });
      }
      updateData.unit = unit;
    }

    if (categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return res.status(400).json({ message: "Specified category does not exist" });
      }
      updateData.categoryId = categoryId;
    }

    if (source !== undefined) {
      updateData.source = source;
    }

    if (year !== undefined) {
      if (typeof year !== "number" || year < 1900 || year > 2100) {
        return res.status(400).json({ message: "Year must be between 1900 and 2100" });
      }
      updateData.year = year;
    }

    const updatedFactor = await prisma.emissionFactor.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    return res.status(200).json({
      message: "Emission factor updated successfully",
      emissionFactor: updatedFactor
    });
  } catch (error: any) {
    console.error("Update Emission Factor Error:", error);
    return res.status(500).json({ message: "Internal server error while updating emission factor" });
  }
}

// Delete emission factor (Admin only)
export async function deleteEmissionFactor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const factorExists = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!factorExists) {
      return res.status(404).json({ message: "Emission factor not found" });
    }

    await prisma.emissionFactor.delete({ where: { id } });

    return res.status(200).json({ message: "Emission factor deleted successfully" });
  } catch (error: any) {
    console.error("Delete Emission Factor Error:", error);
    return res.status(500).json({ message: "Internal server error during emission factor deletion" });
  }
}
