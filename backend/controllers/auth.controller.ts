import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { validateUserRegistration, validateUserLogin } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "ecosphere_jwt_secret_hackathon_2026_super_secure_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export async function register(req: Request, res: Response) {
  try {
    const validationErrors = validateUserRegistration(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { email, password, firstName, lastName, departmentId } = req.body;

    // Check if registration is allowed in settings
    const regSetting = await prisma.setting.findUnique({
      where: { key: "allow_user_registration" }
    });

    if (regSetting && regSetting.value !== "true") {
      return res.status(403).json({ message: "Public registration is currently disabled by the administrator" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Get the USER role
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      return res.status(500).json({ message: "Default User Role not found in database. Please run migrations/seed." });
    }

    // Validate department if provided
    if (departmentId) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        return res.status(400).json({ message: "Selected Department does not exist" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: userRole.id,
        departmentId: departmentId || null
      },
      include: {
        role: true,
        department: true
      }
    });

    // Generate JWT
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Respond (exclude password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: "Registration successful",
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error during registration", error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validationErrors = validateUserLogin(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { email, password } = req.body;

    // Check maintenance mode
    const maintenanceSetting = await prisma.setting.findUnique({
      where: { key: "maintenance_mode" }
    });

    const isMaintenance = maintenanceSetting && maintenanceSetting.value === "true";

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        department: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If maintenance mode is active, only permit ADMIN users
    if (isMaintenance && user.role.name !== "ADMIN") {
      return res.status(403).json({ message: "System is undergoing maintenance. Only administrators are allowed to sign in." });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Respond (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error during login", error: error.message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching profile" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, return same message even if email doesn't exist
      return res.status(200).json({
        message: "If the email is registered in our system, you will receive a password reset link shortly."
      });
    }

    // Generate a reset token (mock reset flow as per "no 3rd party api" requirements)
    const mockToken = jwt.sign({ userId: user.id, purpose: "password_reset" }, JWT_SECRET, { expiresIn: "1h" });
    console.log(`[MOCK RESET MAIL] Password reset token generated for ${email}: ${mockToken}`);

    return res.status(200).json({
      message: "If the email is registered in our system, you will receive a password reset link shortly.",
      debugResetToken: mockToken // Provided for ease of developer testing in postman
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error during password reset request" });
  }
}
