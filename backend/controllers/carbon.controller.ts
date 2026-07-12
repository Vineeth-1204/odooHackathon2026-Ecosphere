import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validateCarbonTransaction } from "../models/CarbonTransaction";

const prisma = new PrismaClient();

// List carbon transactions with filters
export async function getTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    const { departmentId, categoryId, startDate, endDate } = req.query;

    const whereClause: any = {};

    if (departmentId && typeof departmentId === "string" && departmentId.trim().length > 0) {
      whereClause.departmentId = departmentId;
    }

    if (categoryId && typeof categoryId === "string" && categoryId.trim().length > 0) {
      whereClause.emissionFactor = {
        categoryId: categoryId
      };
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate && typeof startDate === "string" && startDate.trim().length > 0) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string" && endDate.trim().length > 0) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.carbonTransaction.findMany({
      where: whereClause,
      include: {
        emissionFactor: {
          include: {
            category: true
          }
        },
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: "desc" }
    });

    return res.status(200).json({ transactions });
  } catch (error: any) {
    console.error("Get Transactions Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching transactions" });
  }
}

// Get transaction by ID
export async function getTransactionById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const transaction = await prisma.carbonTransaction.findUnique({
      where: { id },
      include: {
        emissionFactor: {
          include: {
            category: true
          }
        },
        department: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ transaction });
  } catch (error: any) {
    console.error("Get Transaction By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching transaction details" });
  }
}

// Helper to update active goals for a department or organization-wide when transactions occur
async function updateMatchingGoals(
  txDate: Date,
  departmentId: string,
  emissionsChange: number
) {
  try {
    // Find active goals that span the transaction date
    const matchingGoals = await prisma.environmentalGoal.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: txDate },
        endDate: { gte: txDate },
        OR: [
          { departmentId: null }, // Org-wide goals
          { departmentId: departmentId } // Department specific goals
        ]
      }
    });

    // Update each goal's currentValue
    for (const goal of matchingGoals) {
      const newCurrentValue = Math.max(0, goal.currentValue + emissionsChange);
      
      // Determine if goal status should change
      // Since these are environmental reduction goals (or caps), exceeding them might mean "FAILED"
      // or achieving is assessed at the end of the duration. Let's keep it as is, or auto-mark achieved
      // if current emissions are <= target at the end. For now, just update progress.
      await prisma.environmentalGoal.update({
        where: { id: goal.id },
        data: { currentValue: newCurrentValue }
      });
    }
  } catch (err) {
    console.error("Failed to update matching goals:", err);
  }
}

// Create new transaction
export async function createTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const validationErrors = validateCarbonTransaction(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { date, description, activityValue, emissionFactorId, departmentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User context not found" });
    }

    // Check if emission factor exists
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: emissionFactorId }
    });
    if (!factor) {
      return res.status(400).json({ message: "Emission factor not found" });
    }

    // Check if department exists
    const dept = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    if (!dept) {
      return res.status(400).json({ message: "Department not found" });
    }

    // Calculate emissions
    const emissions = Number((activityValue * factor.value).toFixed(2));
    const txDate = new Date(date);

    const transaction = await prisma.carbonTransaction.create({
      data: {
        date: txDate,
        description,
        activityValue,
        emissionFactorId,
        emissions,
        departmentId,
        userId
      },
      include: {
        emissionFactor: true,
        department: true
      }
    });

    // Update matching goals in background
    await updateMatchingGoals(txDate, departmentId, emissions);

    return res.status(201).json({
      message: "Transaction logged successfully",
      transaction
    });
  } catch (error: any) {
    console.error("Create Transaction Error:", error);
    return res.status(500).json({ message: "Internal server error while logging transaction" });
  }
}

// Update transaction
export async function updateTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { date, description, activityValue, emissionFactorId, departmentId } = req.body;

    const originalTx = await prisma.carbonTransaction.findUnique({
      where: { id }
    });

    if (!originalTx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const updateData: any = {};
    let recalculateEmissions = false;
    let newFactorId = originalTx.emissionFactorId;
    let newActivityVal = originalTx.activityValue;
    let newDeptId = originalTx.departmentId;
    let newDate = originalTx.date;

    if (date !== undefined) {
      newDate = new Date(date);
      updateData.date = newDate;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (activityValue !== undefined) {
      if (typeof activityValue !== "number" || activityValue <= 0) {
        return res.status(400).json({ message: "Activity quantity must be positive" });
      }
      newActivityVal = activityValue;
      updateData.activityValue = activityValue;
      recalculateEmissions = true;
    }

    if (emissionFactorId !== undefined && emissionFactorId !== originalTx.emissionFactorId) {
      const factor = await prisma.emissionFactor.findUnique({
        where: { id: emissionFactorId }
      });
      if (!factor) {
        return res.status(400).json({ message: "Emission factor not found" });
      }
      newFactorId = emissionFactorId;
      updateData.emissionFactorId = emissionFactorId;
      recalculateEmissions = true;
    }

    if (departmentId !== undefined && departmentId !== originalTx.departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!dept) {
        return res.status(400).json({ message: "Department not found" });
      }
      newDeptId = departmentId;
      updateData.departmentId = departmentId;
    }

    let updatedEmissions = originalTx.emissions;
    if (recalculateEmissions) {
      const activeFactor = await prisma.emissionFactor.findUnique({
        where: { id: newFactorId }
      });
      if (activeFactor) {
        updatedEmissions = Number((newActivityVal * activeFactor.value).toFixed(2));
        updateData.emissions = updatedEmissions;
      }
    }

    // Perform database update
    const updatedTx = await prisma.carbonTransaction.update({
      where: { id },
      data: updateData,
      include: {
        emissionFactor: true,
        department: true
      }
    });

    // Rebalance goal values
    // Remove old emissions contribution
    await updateMatchingGoals(originalTx.date, originalTx.departmentId, -originalTx.emissions);
    // Add new emissions contribution
    await updateMatchingGoals(newDate, newDeptId, updatedEmissions);

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTx
    });
  } catch (error: any) {
    console.error("Update Transaction Error:", error);
    return res.status(500).json({ message: "Internal server error while updating transaction" });
  }
}

// Delete transaction
export async function deleteTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const transaction = await prisma.carbonTransaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Subtract emissions contribution from matching goals
    await updateMatchingGoals(transaction.date, transaction.departmentId, -transaction.emissions);

    await prisma.carbonTransaction.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error: any) {
    console.error("Delete Transaction Error:", error);
    return res.status(500).json({ message: "Internal server error during transaction deletion" });
  }
}

// Dashboard statistics aggregation
export async function getDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    // 1. Total emissions and count
    const aggregations = await prisma.carbonTransaction.aggregate({
      _sum: { emissions: true },
      _count: { id: true }
    });

    const totalEmissions = aggregations._sum.emissions || 0;
    const totalTransactions = aggregations._count.id || 0;

    // 2. Emissions grouped by Category
    const transactions = await prisma.carbonTransaction.findMany({
      include: {
        emissionFactor: {
          include: {
            category: true
          }
        }
      }
    });

    const categoryEmissionsMap: Record<string, { name: string; value: number }> = {};
    const departmentEmissionsMap: Record<string, { name: string; value: number }> = {};
    const monthlyTrendMap: Record<string, number> = {};

    // Seed last 6 months trend map so it always contains dates, even if emissions are 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyTrendMap[monthStr] = 0;
    }

    // Retrieve departments to map IDs to names
    const departments = await prisma.department.findMany();
    const deptNameMap: Record<string, string> = {};
    departments.forEach((d) => {
      deptNameMap[d.id] = d.name;
    });

    // Populate maps from transactions
    transactions.forEach((tx) => {
      // Category aggregation
      const catName = tx.emissionFactor.category.name;
      if (!categoryEmissionsMap[catName]) {
        categoryEmissionsMap[catName] = { name: catName, value: 0 };
      }
      categoryEmissionsMap[catName].value = Number(
        (categoryEmissionsMap[catName].value + tx.emissions).toFixed(2)
      );

      // Department aggregation
      const deptName = deptNameMap[tx.departmentId] || "Unknown Dept";
      if (!departmentEmissionsMap[deptName]) {
        departmentEmissionsMap[deptName] = { name: deptName, value: 0 };
      }
      departmentEmissionsMap[deptName].value = Number(
        (departmentEmissionsMap[deptName].value + tx.emissions).toFixed(2)
      );

      // Monthly Trend (matching the short formats)
      const txMonthStr = tx.date.toLocaleString("default", { month: "short", year: "2-digit" });
      // If it exists in our trend map (recent 6 months) or we can dynamically add it
      if (monthlyTrendMap[txMonthStr] !== undefined) {
        monthlyTrendMap[txMonthStr] = Number(
          (monthlyTrendMap[txMonthStr] + tx.emissions).toFixed(2)
        );
      }
    });

    const categoryBreakdown = Object.values(categoryEmissionsMap);
    const departmentBreakdown = Object.values(departmentEmissionsMap);
    const monthlyTrend = Object.entries(monthlyTrendMap).map(([month, emissions]) => ({
      month,
      emissions
    }));

    // 3. Goal summary stats
    const activeGoalsCount = await prisma.environmentalGoal.count({
      where: { status: "ACTIVE" }
    });

    const recentGoals = await prisma.environmentalGoal.findMany({
      take: 4,
      orderBy: { endDate: "asc" },
      include: {
        department: true
      }
    });

    // 4. Product summary (average carbon footprint)
    const productAggs = await prisma.productProfile.aggregate({
      _avg: { carbonFootprint: true },
      _count: { id: true }
    });
    
    const avgProductFootprint = productAggs._avg.carbonFootprint 
      ? Number(productAggs._avg.carbonFootprint.toFixed(2)) 
      : 0;
    const totalProducts = productAggs._count.id || 0;

    return res.status(200).json({
      summary: {
        totalEmissions: Number(totalEmissions.toFixed(2)),
        totalTransactions,
        activeGoalsCount,
        avgProductFootprint,
        totalProducts
      },
      categoryBreakdown,
      departmentBreakdown,
      monthlyTrend,
      recentGoals
    });
  } catch (error: any) {
    console.error("Get Dashboard Summary Error:", error);
    return res.status(500).json({ message: "Internal server error while compiling dashboard statistics" });
  }
}
