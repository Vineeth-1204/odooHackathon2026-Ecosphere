import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Get list of audits
export async function getAudits(req: AuthenticatedRequest, res: Response) {
  try {
    const audits = await prisma.audit.findMany({
      include: {
        complianceIssues: true
      },
      orderBy: { date: "desc" }
    });
    return res.status(200).json({ audits });
  } catch (error: any) {
    console.error("Get Audits Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching audits" });
  }
}

// Get single audit details
export async function getAuditById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        complianceIssues: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    return res.status(200).json({ audit });
  } catch (error: any) {
    console.error("Get Audit By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching audit details" });
  }
}

// Create an audit
export async function createAudit(req: AuthenticatedRequest, res: Response) {
  try {
    const { scope, date, auditor, status } = req.body;

    if (!scope || !date || !auditor) {
      return res.status(400).json({ message: "Scope, date, and auditor are required fields" });
    }

    const newAudit = await prisma.audit.create({
      data: {
        scope,
        date: new Date(date),
        auditor,
        status: status || "PLANNED"
      }
    });

    return res.status(201).json({
      message: "Audit created successfully",
      audit: newAudit
    });
  } catch (error: any) {
    console.error("Create Audit Error:", error);
    return res.status(500).json({ message: "Internal server error while creating audit" });
  }
}

// Update audit details
export async function updateAudit(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { scope, date, auditor, status } = req.body;

    const auditExists = await prisma.audit.findUnique({ where: { id } });
    if (!auditExists) {
      return res.status(404).json({ message: "Audit not found" });
    }

    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: {
        scope: scope || undefined,
        date: date ? new Date(date) : undefined,
        auditor: auditor || undefined,
        status: status || undefined
      }
    });

    return res.status(200).json({
      message: "Audit updated successfully",
      audit: updatedAudit
    });
  } catch (error: any) {
    console.error("Update Audit Error:", error);
    return res.status(500).json({ message: "Internal server error while updating audit" });
  }
}

// Delete audit
export async function deleteAudit(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const auditExists = await prisma.audit.findUnique({ where: { id } });
    if (!auditExists) {
      return res.status(404).json({ message: "Audit not found" });
    }

    await prisma.audit.delete({ where: { id } });
    return res.status(200).json({ message: "Audit deleted successfully" });
  } catch (error: any) {
    console.error("Delete Audit Error:", error);
    return res.status(500).json({ message: "Internal server error during audit deletion" });
  }
}
