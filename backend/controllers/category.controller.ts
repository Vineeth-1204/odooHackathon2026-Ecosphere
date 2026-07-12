import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateCategory } from "../models/Category";

const prisma = new PrismaClient();

// List all categories
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });

    return res.status(200).json({ categories });
  } catch (error: any) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching categories" });
  }
}

// Get category by ID
export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category });
  } catch (error: any) {
    console.error("Get Category By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching category details" });
  }
}

// Create category (Admin only)
export async function createCategory(req: Request, res: Response) {
  try {
    const validationErrors = validateCategory(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { name, description } = req.body;

    const catExists = await prisma.category.findUnique({ where: { name } });
    if (catExists) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCat = await prisma.category.create({
      data: { name, description }
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: newCat
    });
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return res.status(500).json({ message: "Internal server error while creating category" });
  }
}

// Update category (Admin only)
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const originalCat = await prisma.category.findUnique({ where: { id } });
    if (!originalCat) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updateData: any = {};
    if (name && name !== originalCat.name) {
      const nameExists = await prisma.category.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(400).json({ message: "Another category with this name already exists" });
      }
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedCat = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCat
    });
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return res.status(500).json({ message: "Internal server error while updating category" });
  }
}

// Delete category (Admin only)
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const catExists = await prisma.category.findUnique({ where: { id } });
    if (!catExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({ message: "Internal server error during category deletion" });
  }
}
