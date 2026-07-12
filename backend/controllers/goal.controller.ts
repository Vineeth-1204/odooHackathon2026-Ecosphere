import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateEnvironmentalGoal } from "../models/EnvironmentalGoal";

const prisma = new PrismaClient();

// Helper function to calculate current emissions for a goal based on logged transactions
async function calculateGoalCurrentValue(
  startDate: Date,
  endDate: Date,
  departmentId?: string | null
): Promise<number> {
  const whereClause: any = {
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (departmentId) {
    whereClause.departmentId = departmentId;
  }

  const result = await prisma.carbonTransaction.aggregate({
    where: whereClause,
    _sum: {
      emissions: true
    }
  });

  return result._sum.emissions || 0;
}

// List all environmental goals
export async function getGoals(req: Request, res: Response) {
  try {
    const { departmentId, status } = req.query;

    const whereClause: any = {};

    if (departmentId && typeof departmentId === "string" && departmentId.trim().length > 0) {
      whereClause.departmentId = departmentId;
    }

    if (status && typeof status === "string" && status.trim().length > 0) {
      whereClause.status = status;
    }

    const goals = await prisma.environmentalGoal.findMany({
      where: whereClause,
      include: {
        department: true
      },
      orderBy: { endDate: "asc" }
    });

    return res.status(200).json({ goals });
  } catch (error: any) {
    console.error("Get Goals Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching goals" });
  }
}

// Get goal by ID
export async function getGoalById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const goal = await prisma.environmentalGoal.findUnique({
      where: { id },
      include: {
        department: true
      }
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json({ goal });
  } catch (error: any) {
    console.error("Get Goal By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching goal details" });
  }
}

// Create new goal (Admin/Manager only)
export async function createGoal(req: Request, res: Response) {
  try {
    const validationErrors = validateEnvironmentalGoal(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { name, description, targetValue, unit, startDate, endDate, status, departmentId } = req.body;

    if (departmentId) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        return res.status(400).json({ message: "Specified department does not exist" });
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate current accumulated emissions in this time window
    const currentValue = await calculateGoalCurrentValue(start, end, departmentId);

    const goal = await prisma.environmentalGoal.create({
      data: {
        name,
        description,
        targetValue,
        currentValue,
        unit,
        startDate: start,
        endDate: end,
        status: status || "ACTIVE",
        departmentId: departmentId || null
      },
      include: {
        department: true
      }
    });

    return res.status(201).json({
      message: "Goal created successfully",
      goal
    });
  } catch (error: any) {
    console.error("Create Goal Error:", error);
    return res.status(500).json({ message: "Internal server error while creating goal" });
  }
}

// Update goal (Admin/Manager only)
export async function updateGoal(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, targetValue, currentValue, unit, startDate, endDate, status, departmentId } = req.body;

    const originalGoal = await prisma.environmentalGoal.findUnique({
      where: { id }
    });

    if (!originalGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updateData: any = {};
    let recalculateVal = false;
    let newStart = originalGoal.startDate;
    let newEnd = originalGoal.endDate;
    let newDeptId = originalGoal.departmentId;

    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (targetValue !== undefined) {
      if (typeof targetValue !== "number" || targetValue <= 0) {
        return res.status(400).json({ message: "Target value must be positive" });
      }
      updateData.targetValue = targetValue;
    }
    if (unit !== undefined) {
      updateData.unit = unit;
    }
    if (status !== undefined) {
      if (!["ACTIVE", "ACHIEVED", "FAILED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      updateData.status = status;
    }

    if (startDate !== undefined) {
      newStart = new Date(startDate);
      updateData.startDate = newStart;
      recalculateVal = true;
    }
    if (endDate !== undefined) {
      newEnd = new Date(endDate);
      updateData.endDate = newEnd;
      recalculateVal = true;
    }
    if (departmentId !== undefined) {
      if (departmentId) {
        const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!deptExists) {
          return res.status(400).json({ message: "Specified department does not exist" });
        }
        newDeptId = departmentId;
      } else {
        newDeptId = null;
      }
      updateData.departmentId = newDeptId;
      recalculateVal = true;
    }

    if (recalculateVal) {
      updateData.currentValue = await calculateGoalCurrentValue(newStart, newEnd, newDeptId);
    } else if (currentValue !== undefined) {
      // Allow manual override if explicitly provided
      updateData.currentValue = currentValue;
    }

    const updatedGoal = await prisma.environmentalGoal.update({
      where: { id },
      data: updateData,
      include: {
        department: true
      }
    });

    return res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal
    });
  } catch (error: any) {
    console.error("Update Goal Error:", error);
    return res.status(500).json({ message: "Internal server error while updating goal" });
  }
}

// Delete goal (Admin/Manager only)
export async function deleteGoal(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const goalExists = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!goalExists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await prisma.environmentalGoal.delete({ where: { id } });

    return res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error: any) {
    console.error("Delete Goal Error:", error);
    return res.status(500).json({ message: "Internal server error during goal deletion" });
  }
}
