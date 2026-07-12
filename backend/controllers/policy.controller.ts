import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// List all policies with unread/acknowledgement status
export async function getPolicies(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const policies = await prisma.policy.findMany({
      include: {
        acknowledgements: {
          where: { userId }
        }
      },
      orderBy: { effectiveDate: "desc" }
    });

    const response = policies.map((p) => {
      const { acknowledgements, ...policyData } = p;
      return {
        ...policyData,
        acknowledged: acknowledgements.length > 0,
        acknowledgedAt: acknowledgements.length > 0 ? acknowledgements[0].acknowledgedAt : null
      };
    });

    return res.status(200).json({ policies: response });
  } catch (error: any) {
    console.error("Get Policies Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching policies" });
  }
}

// Get policy by ID with acknowledgement status
export async function getPolicyById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const policy = await prisma.policy.findUnique({
      where: { id },
      include: {
        acknowledgements: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true
              }
            }
          }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const acknowledgedByCurrentUser = policy.acknowledgements.find((a) => a.userId === userId);

    return res.status(200).json({
      policy: {
        ...policy,
        acknowledgements: policy.acknowledgements,
        acknowledged: !!acknowledgedByCurrentUser,
        acknowledgedAt: acknowledgedByCurrentUser ? acknowledgedByCurrentUser.acknowledgedAt : null
      }
    });
  } catch (error: any) {
    console.error("Get Policy By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching policy details" });
  }
}

// Create a new policy (Admin/Manager only)
export async function createPolicy(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, documentUrl, effectiveDate, departmentScope } = req.body;

    if (!title || !effectiveDate) {
      return res.status(400).json({ message: "Title and effective date are required" });
    }

    const newPolicy = await prisma.policy.create({
      data: {
        title,
        description: description || null,
        documentUrl: documentUrl || null,
        effectiveDate: new Date(effectiveDate),
        departmentScope: departmentScope || null
      }
    });

    // Create notifications for all relevant users
    let targetUsers;
    if (departmentScope) {
      targetUsers = await prisma.user.findMany({
        where: {
          department: {
            name: { contains: departmentScope, mode: "insensitive" }
          }
        }
      });
    } else {
      targetUsers = await prisma.user.findMany();
    }

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((u) => ({
          userId: u.id,
          title: "New ESG Policy Published",
          message: `A new policy "${title}" has been published. Please review and acknowledge it.`,
          type: "POLICY_REMINDER"
        }))
      });
    }

    return res.status(201).json({
      message: "Policy published successfully",
      policy: newPolicy
    });
  } catch (error: any) {
    console.error("Create Policy Error:", error);
    return res.status(500).json({ message: "Internal server error while creating policy" });
  }
}

// Acknowledge a policy (All users)
export async function acknowledgePolicy(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const policy = await prisma.policy.findUnique({
      where: { id }
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Upsert or create unique acknowledgement
    const acknowledgement = await prisma.policyAcknowledgement.upsert({
      where: {
        userId_policyId: {
          userId,
          policyId: id
        }
      },
      create: {
        userId,
        policyId: id
      },
      update: {} // Do nothing if already acknowledged
    });

    return res.status(200).json({
      message: "Policy acknowledged successfully",
      acknowledgement
    });
  } catch (error: any) {
    console.error("Acknowledge Policy Error:", error);
    return res.status(500).json({ message: "Internal server error during policy acknowledgement" });
  }
}
