import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateDepartment } from "../models/Department";

const prisma = new PrismaClient();

// List all departments
export async function getDepartments(req: Request, res: Response) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return res.status(200).json({ departments });
  } catch (error: any) {
    console.error("Get Departments Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching departments" });
  }
}

// Get department by ID
export async function getDepartmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({ department });
  } catch (error: any) {
    console.error("Get Department By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching department details" });
  }
}

// Create department (Admin only)
export async function createDepartment(req: Request, res: Response) {
  try {
    const validationErrors = validateDepartment(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { name, description } = req.body;

    const deptExists = await prisma.department.findUnique({ where: { name } });
    if (deptExists) {
      return res.status(400).json({ message: "Department with this name already exists" });
    }

    const newDept = await prisma.department.create({
      data: { name, description }
    });

    return res.status(201).json({
      message: "Department created successfully",
      department: newDept
    });
  } catch (error: any) {
    console.error("Create Department Error:", error);
    return res.status(500).json({ message: "Internal server error while creating department" });
  }
}

// Update department (Admin only)
export async function updateDepartment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const originalDept = await prisma.department.findUnique({ where: { id } });
    if (!originalDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const updateData: any = {};
    if (name && name !== originalDept.name) {
      const nameExists = await prisma.department.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(400).json({ message: "Another department with this name already exists" });
      }
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedDept = await prisma.department.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      message: "Department updated successfully",
      department: updatedDept
    });
  } catch (error: any) {
    console.error("Update Department Error:", error);
    return res.status(500).json({ message: "Internal server error while updating department" });
  }
}

// Delete department (Admin only)
export async function deleteDepartment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deptExists = await prisma.department.findUnique({ where: { id } });
    if (!deptExists) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Prisma onDelete: SetNull is configured on the User relation, so users will have departmentId = null
    await prisma.department.delete({ where: { id } });

    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("Delete Department Error:", error);
    return res.status(500).json({ message: "Internal server error during department deletion" });
  }
}
