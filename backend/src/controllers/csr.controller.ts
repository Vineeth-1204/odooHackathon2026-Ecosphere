import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ── LIST CSR Activities ─────────────────────────────
export const listCSRActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId, departmentId, status, search } = req.query;

    const activities = await prisma.cSRActivity.findMany({
      where: {
        ...(status ? { status: status as any } : { status: 'ACTIVE' }),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        ...(departmentId ? { departmentId: Number(departmentId) } : {}),
        ...(search ? { title: { contains: String(search), mode: 'insensitive' } } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { participations: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: activities });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single CSR Activity ─────────────────────────
export const getCSRActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const activity = await prisma.cSRActivity.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { participations: true } },
      },
    });
    if (!activity) {
      res.status(404).json({ success: false, message: 'CSR Activity not found' });
      return;
    }
    res.json({ success: true, data: activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE CSR Activity (Admin/Manager) ─────────────
export const createCSRActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, departmentId, date, maxParticipants, pointsReward } = req.body;

    if (!title || !categoryId || !date) {
      res.status(400).json({ success: false, message: 'title, categoryId, and date are required' });
      return;
    }

    const activity = await prisma.cSRActivity.create({
      data: {
        title,
        description,
        categoryId: Number(categoryId),
        departmentId: departmentId ? Number(departmentId) : null,
        date: new Date(date),
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        pointsReward: pointsReward ? Number(pointsReward) : 10,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE CSR Activity (Admin/Manager) ─────────────
export const updateCSRActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { title, description, categoryId, departmentId, date, maxParticipants, pointsReward, status } = req.body;

    const activity = await prisma.cSRActivity.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(departmentId !== undefined && { departmentId: departmentId ? Number(departmentId) : null }),
        ...(date && { date: new Date(date) }),
        ...(maxParticipants !== undefined && { maxParticipants: maxParticipants ? Number(maxParticipants) : null }),
        ...(pointsReward !== undefined && { pointsReward: Number(pointsReward) }),
        ...(status && { status }),
      },
    });

    res.json({ success: true, data: activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE (Archive) CSR Activity (Admin) ───────────
export const deleteCSRActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await prisma.cSRActivity.update({ where: { id }, data: { status: 'ARCHIVED' } });
    res.json({ success: true, message: 'CSR Activity archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
