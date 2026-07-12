import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all settings
export async function getSettings(req: Request, res: Response) {
  try {
    const settingsList = await prisma.setting.findMany({
      orderBy: { key: "asc" }
    });
    
    // Map to a key-value object for easier frontend consumption
    const settingsObject = settingsList.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return res.status(200).json({
      settings: settingsList,
      settingsObject
    });
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching settings" });
  }
}

// Bulk update settings (Admin only)
export async function updateSettings(req: Request, res: Response) {
  try {
    const { settings } = req.body; // Expects array of { key: string, value: string }
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ message: "Invalid settings format. Expected an array of settings." });
    }

    const updatePromises = settings.map((s) => {
      if (!s.key || s.value === undefined) return Promise.resolve();
      return prisma.setting.upsert({
        where: { key: s.key },
        update: { value: String(s.value) },
        create: { key: s.key, value: String(s.value) }
      });
    });

    await Promise.all(updatePromises);

    const updatedSettings = await prisma.setting.findMany({
      orderBy: { key: "asc" }
    });

    const settingsObject = updatedSettings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return res.status(200).json({
      message: "Settings updated successfully",
      settings: updatedSettings,
      settingsObject
    });
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return res.status(500).json({ message: "Internal server error while updating settings" });
  }
}
