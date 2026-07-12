import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// List notifications for current user
export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return res.status(200).json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching notifications" });
  }
}

// Mark a single notification as read
export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. This notification does not belong to you." });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.status(200).json({ message: "Notification marked as read", notification: updated });
  } catch (error: any) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({ message: "Internal server error while updating notification status" });
  }
}

// Mark all user notifications as read
export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Mark All Notifications Read Error:", error);
    return res.status(500).json({ message: "Internal server error while updating notifications" });
  }
}
