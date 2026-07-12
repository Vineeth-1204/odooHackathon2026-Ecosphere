import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { redeemReward } from "../services/xp.service";

// ── LIST all active rewards ──────────────────────────
export const listRewards = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { status: "ACTIVE" },
      orderBy: { pointsCost: "asc" },
    });
    res.json({ success: true, data: rewards });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single reward ────────────────────────────────
export const getReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const reward = await prisma.reward.findUnique({ where: { id } });
    if (!reward) {
      res.status(404).json({ success: false, message: "Reward not found" });
      return;
    }
    res.json({ success: true, data: reward });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE reward (Admin) ────────────────────────────
export const createReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, pointsCost, stock } = req.body;

    if (!name || pointsCost === undefined) {
      res.status(400).json({ success: false, message: "name and pointsCost are required" });
      return;
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        description,
        pointsCost: Number(pointsCost),
        stock: stock ? Number(stock) : 0,
      },
    });

    res.status(201).json({ success: true, data: reward });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE reward (Admin) ────────────────────────────
export const updateReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, description, pointsCost, stock, status } = req.body;

    const reward = await prisma.reward.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(pointsCost !== undefined && { pointsCost: Number(pointsCost) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(status && { status }),
      },
    });

    res.json({ success: true, data: reward });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ARCHIVE reward (Admin) ───────────────────────────
export const archiveReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await prisma.reward.update({ where: { id }, data: { status: "ARCHIVED" } });
    res.json({ success: true, message: "Reward archived" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── REDEEM reward (Employee) — atomic ────────────────
export const redeemRewardHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rewardId = Number(req.params.id);
    const userId = req.user!.id;

    await redeemReward(userId, rewardId);

    res.json({ success: true, message: "Reward redeemed successfully!" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET MY redemption history (Employee) ─────────────
export const getMyRedemptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      include: { reward: { select: { id: true, name: true, description: true } } },
      orderBy: { redeemedAt: "desc" },
    });
    res.json({ success: true, data: redemptions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL redemptions (Admin) ──────────────────────
export const getAllRedemptions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const redemptions = await prisma.rewardRedemption.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        reward: { select: { id: true, name: true } },
      },
      orderBy: { redeemedAt: "desc" },
    });

    const mapped = redemptions.map((r) => ({
      ...r,
      user: {
        id: r.user.id,
        name: `${r.user.firstName} ${r.user.lastName}`,
        email: r.user.email,
      },
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
