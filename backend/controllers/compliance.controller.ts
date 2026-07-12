import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Helper to check and auto-flag overdue issues
async function checkAndUpdateOverdueStatus() {
  const now = new Date();
  // Find open issues whose due date has passed
  const overdueIssues = await prisma.complianceIssue.findMany({
    where: {
      status: "OPEN",
      dueDate: { lt: now }
    }
  });

  if (overdueIssues.length > 0) {
    // Note: Since Prisma doesn't support custom fields or computed properties directly, 
    // we can either return the status as "OVERDUE" dynamically in queries,
    // or physically update the status. To keep it clean and robust, we will flag them
    // as OVERDUE dynamically when querying, and also send notifications for newly overdue issues.
    
    // Create notifications for owners of overdue issues
    for (const issue of overdueIssues) {
      // Check if notification already exists to avoid duplication
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: issue.ownerId,
          type: "COMPLIANCE_OVERDUE",
          message: { contains: issue.id }
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId: issue.ownerId,
            title: "Overdue Compliance Issue Alert",
            message: `The compliance issue "${issue.description.substring(0, 30)}..." (ID: ${issue.id}) is overdue. Please address it immediately.`,
            type: "COMPLIANCE_OVERDUE"
          }
        });
      }
    }
  }
}

// Get all compliance issues
export async function getComplianceIssues(req: AuthenticatedRequest, res: Response) {
  try {
    await checkAndUpdateOverdueStatus();
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const severity = req.query.severity as string;
    const status = req.query.status as string;
    const ownerId = req.query.ownerId as string;
    const auditId = req.query.auditId as string;

    const where: any = {};
    if (severity) where.severity = severity;
    if (status) {
      if (status === "OVERDUE") {
        where.status = "OPEN";
        where.dueDate = { lt: new Date() };
      } else {
        where.status = status;
        if (status === "OPEN") {
          where.dueDate = { gte: new Date() };
        }
      }
    }
    if (ownerId) where.ownerId = ownerId;
    if (auditId) where.auditId = auditId;

    const [issues, total] = await prisma.$transaction([
      prisma.complianceIssue.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          audit: true
        },
        orderBy: { dueDate: "asc" }
      }),
      prisma.complianceIssue.count({ where })
    ]);

    const now = new Date();
    const processedIssues = issues.map((issue) => {
      let currentStatus = issue.status;
      if (issue.status === "OPEN" && new Date(issue.dueDate) < now) {
        currentStatus = "OVERDUE";
      }
      return {
        ...issue,
        status: currentStatus
      };
    });

    return res.status(200).json({
      complianceIssues: processedIssues,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get Compliance Issues Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching compliance issues" });
  }
}

// Get single compliance issue details
export async function getComplianceIssueById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const issue = await prisma.complianceIssue.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true, department: true }
        },
        audit: true
      }
    });

    if (!issue) {
      return res.status(404).json({ message: "Compliance issue not found" });
    }

    const now = new Date();
    let currentStatus = issue.status;
    if (issue.status === "OPEN" && new Date(issue.dueDate) < now) {
      currentStatus = "OVERDUE";
    }

    return res.status(200).json({
      complianceIssue: {
        ...issue,
        status: currentStatus
      }
    });
  } catch (error: any) {
    console.error("Get Compliance Issue By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching compliance issue" });
  }
}

// Create a compliance issue
export async function createComplianceIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { auditId, severity, description, ownerId, dueDate } = req.body;

    if (!severity || !description || !ownerId || !dueDate) {
      return res.status(400).json({ message: "Severity, description, ownerId, and dueDate are required" });
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });
    if (!owner) {
      return res.status(400).json({ message: "Assigned owner does not exist" });
    }

    // Verify audit exists if linked
    if (auditId) {
      const audit = await prisma.audit.findUnique({ where: { id: auditId } });
      if (!audit) {
        return res.status(400).json({ message: "Linked audit does not exist" });
      }
    }

    const newIssue = await prisma.complianceIssue.create({
      data: {
        auditId: auditId || null,
        severity,
        description,
        ownerId,
        dueDate: new Date(dueDate),
        status: "OPEN"
      }
    });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: ownerId,
        title: "New Compliance Issue Assigned",
        message: `You have been assigned a new compliance issue: "${description.substring(0, 40)}...". Due date is ${new Date(dueDate).toLocaleDateString()}.`,
        type: "SYSTEM"
      }
    });

    return res.status(201).json({
      message: "Compliance issue created successfully",
      complianceIssue: newIssue
    });
  } catch (error: any) {
    console.error("Create Compliance Issue Error:", error);
    return res.status(500).json({ message: "Internal server error while creating compliance issue" });
  }
}

// Update compliance issue
export async function updateComplianceIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { severity, description, ownerId, dueDate, status } = req.body;

    const issueExists = await prisma.complianceIssue.findUnique({ where: { id } });
    if (!issueExists) {
      return res.status(404).json({ message: "Compliance issue not found" });
    }

    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) {
        return res.status(400).json({ message: "Assigned owner does not exist" });
      }
    }

    const updatedIssue = await prisma.complianceIssue.update({
      where: { id },
      data: {
        severity: severity || undefined,
        description: description || undefined,
        ownerId: ownerId || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status || undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined
      }
    });

    return res.status(200).json({
      message: "Compliance issue updated successfully",
      complianceIssue: updatedIssue
    });
  } catch (error: any) {
    console.error("Update Compliance Issue Error:", error);
    return res.status(500).json({ message: "Internal server error while updating compliance issue" });
  }
}

// Resolve compliance issue
export async function resolveComplianceIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const issue = await prisma.complianceIssue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: "Compliance issue not found" });
    }

    // Only Admin/Manager, or the assigned Owner can resolve the issue
    const isAdminOrManager = req.user?.role.name === "ADMIN" || req.user?.role.name === "MANAGER";
    const isOwner = issue.ownerId === userId;

    if (!isAdminOrManager && !isOwner) {
      return res.status(403).json({ message: "Forbidden. Only the owner or an admin/manager can resolve this issue." });
    }

    const updatedIssue = await prisma.complianceIssue.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date()
      }
    });

    return res.status(200).json({
      message: "Compliance issue resolved successfully",
      complianceIssue: updatedIssue
    });
  } catch (error: any) {
    console.error("Resolve Compliance Issue Error:", error);
    return res.status(500).json({ message: "Internal server error while resolving compliance issue" });
  }
}
