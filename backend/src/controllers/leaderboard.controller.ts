import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getUserBalance } from "../services/xp.service";

// ── INDIVIDUAL Leaderboard ───────────────────────────
export const getEmployeeLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, limit = "50", offset = "0" } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(departmentId ? { departmentId: String(departmentId) } : {}),
        role: { name: "USER" },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        xpPoints: true,
        rewardPoints: true,
        departmentId: true,
        department: { select: { name: true } },
        userBadges: { select: { badgeId: true } },
      },
      orderBy: { xpPoints: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    const ranked = users.map((u, index) => ({
      rank: Number(offset) + index + 1,
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      xpPoints: u.xpPoints,
      rewardPoints: u.rewardPoints,
      department: u.department?.name ?? "N/A",
      departmentId: u.departmentId,
      badgeCount: u.userBadges.length,
    }));

    res.json({ success: true, data: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DEPARTMENT Leaderboard ───────────────────────────
export const getDepartmentLeaderboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          where: { role: { name: "USER" } },
          select: { xpPoints: true, rewardPoints: true },
        },
      },
    });

    const ranked = departments
      .map((dept) => ({
        id: dept.id,
        name: dept.name,
        totalXP: dept.users.reduce((sum, u) => sum + u.xpPoints, 0),
        totalPoints: dept.users.reduce((sum, u) => sum + u.rewardPoints, 0),
        memberCount: dept.users.length,
      }))
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((dept, index) => ({ rank: index + 1, ...dept }));

    res.json({ success: true, data: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MY RANK ─────────────────────────────────────────
export const getMyRank = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const balance = await getUserBalance(userId);

    // Count users with strictly higher XP
    const higherCount = await prisma.user.count({
      where: { xpPoints: { gt: balance.xpPoints }, role: { name: "USER" } },
    });

    const totalCount = await prisma.user.count({ where: { role: { name: "USER" } } });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        department: { select: { name: true } },
        userBadges: { select: { badgeId: true } },
      },
    });

    res.json({
      success: true,
      data: {
        rank: higherCount + 1,
        totalParticipants: totalCount,
        xpPoints: balance.xpPoints,
        rewardPoints: balance.rewardPoints,
        badgeCount: user?.userBadges.length ?? 0,
        department: user?.department?.name ?? "N/A",
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
