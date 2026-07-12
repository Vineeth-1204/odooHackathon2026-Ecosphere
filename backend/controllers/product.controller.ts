import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateProductProfile } from "../models/ProductProfile";

const prisma = new PrismaClient();

// List all product profiles
export async function getProducts(req: Request, res: Response) {
  try {
    const { search, esgGrade } = req.query;

    const whereClause: any = {};

    if (search && typeof search === "string" && search.trim().length > 0) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } }
      ];
    }

    if (esgGrade && typeof esgGrade === "string" && esgGrade.trim().length > 0) {
      whereClause.esgGrade = esgGrade.toUpperCase();
    }

    const products = await prisma.productProfile.findMany({
      where: whereClause,
      orderBy: { name: "asc" }
    });

    return res.status(200).json({ products });
  } catch (error: any) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching product ESG profiles" });
  }
}

// Get product profile by ID
export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.productProfile.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: "Product profile not found" });
    }

    return res.status(200).json({ product });
  } catch (error: any) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching product ESG profile" });
  }
}

// Create product ESG profile (Admin/Manager only)
export async function createProduct(req: Request, res: Response) {
  try {
    const validationErrors = validateProductProfile(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { name, sku, description, carbonFootprint, waterFootprint, wasteGenerated, recyclability, materialSourcing, esgGrade } = req.body;

    // Check if sku exists
    const skuExists = await prisma.productProfile.findUnique({ where: { sku } });
    if (skuExists) {
      return res.status(400).json({ message: "Product SKU already exists" });
    }

    const newProduct = await prisma.productProfile.create({
      data: {
        name,
        sku,
        description,
        carbonFootprint,
        waterFootprint: waterFootprint || null,
        wasteGenerated: wasteGenerated || null,
        recyclability: recyclability || null,
        materialSourcing,
        esgGrade: esgGrade.toUpperCase()
      }
    });

    return res.status(201).json({
      message: "Product ESG profile created successfully",
      product: newProduct
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Internal server error while creating product profile" });
  }
}

// Update product ESG profile (Admin/Manager only)
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, sku, description, carbonFootprint, waterFootprint, wasteGenerated, recyclability, materialSourcing, esgGrade } = req.body;

    const originalProduct = await prisma.productProfile.findUnique({ where: { id } });
    if (!originalProduct) {
      return res.status(404).json({ message: "Product profile not found" });
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Product name is required" });
      }
      updateData.name = name;
    }

    if (sku !== undefined && sku !== originalProduct.sku) {
      const skuExists = await prisma.productProfile.findUnique({ where: { sku } });
      if (skuExists) {
        return res.status(400).json({ message: "Another product with this SKU already exists" });
      }
      updateData.sku = sku;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (carbonFootprint !== undefined) {
      if (typeof carbonFootprint !== "number" || carbonFootprint < 0) {
        return res.status(400).json({ message: "Carbon footprint must be a non-negative number" });
      }
      updateData.carbonFootprint = carbonFootprint;
    }

    if (waterFootprint !== undefined) {
      updateData.waterFootprint = waterFootprint;
    }

    if (wasteGenerated !== undefined) {
      updateData.wasteGenerated = wasteGenerated;
    }

    if (recyclability !== undefined) {
      if (typeof recyclability !== "number" || recyclability < 0 || recyclability > 100) {
        return res.status(400).json({ message: "Recyclability must be between 0 and 100" });
      }
      updateData.recyclability = recyclability;
    }

    if (materialSourcing !== undefined) {
      updateData.materialSourcing = materialSourcing;
    }

    if (esgGrade !== undefined) {
      if (!["A", "B", "C", "D", "E", "F"].includes(esgGrade.toUpperCase())) {
        return res.status(400).json({ message: "Invalid ESG Grade" });
      }
      updateData.esgGrade = esgGrade.toUpperCase();
    }

    const updatedProduct = await prisma.productProfile.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      message: "Product profile updated successfully",
      product: updatedProduct
    });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: "Internal server error while updating product profile" });
  }
}

// Delete product profile (Admin/Manager only)
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const productExists = await prisma.productProfile.findUnique({ where: { id } });
    if (!productExists) {
      return res.status(404).json({ message: "Product profile not found" });
    }

    await prisma.productProfile.delete({ where: { id } });

    return res.status(200).json({ message: "Product profile deleted successfully" });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: "Internal server error during product profile deletion" });
  }
}
