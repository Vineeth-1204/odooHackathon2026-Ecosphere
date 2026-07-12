import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// List all users with pagination and search
export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const departmentId = (req.query.departmentId as string) || undefined;
    const roleId = (req.query.roleId as string) || undefined;

    const skip = (page - 1) * limit;

    // Search condition
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (roleId) {
      where.roleId = roleId;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
          department: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    // Omit passwords
    const usersWithoutPassword = users.map((u) => {
      const { password: _, ...userNoPwd } = u;
      return userNoPwd;
    });

    return res.status(200).json({
      users: usersWithoutPassword,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get Users Error:", error);
    return res.status(500).json({ message: "Internal server error while retrieving users" });
  }
}

// Get user by ID
export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error("Get User By ID Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching user details" });
  }
}

// Create a new user (Admin function)
export async function createUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, firstName, lastName, roleId, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName || !roleId) {
      return res.status(400).json({ message: "All fields (email, password, firstName, lastName, roleId) are required" });
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Verify role exists
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      return res.status(400).json({ message: "Selected role does not exist" });
    }

    // Verify department exists
    if (departmentId) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        return res.status(400).json({ message: "Selected department does not exist" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId,
        departmentId: departmentId || null
      },
      include: {
        role: true,
        department: true
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return res.status(500).json({ message: "Internal server error while creating user" });
  }
}

// Update User (Admin or own profile)
export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, roleId, departmentId } = req.body;

    // Check permissions: only Admin or user self
    const isAdmin = req.user?.role.name === "ADMIN";
    const isSelf = req.user?.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Forbidden. You can only update your own profile." });
    }

    // Fetch original user
    const originalUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!originalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update payload
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Email check (only if changed and unique)
    if (email && email !== originalUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another account" });
      }
      updateData.email = email;
    }

    // Password check (if updating password)
    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Role and department: ADMIN only
    if (isAdmin) {
      if (roleId && roleId !== originalUser.roleId) {
        const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
        if (!roleExists) {
          return res.status(400).json({ message: "Role does not exist" });
        }
        updateData.roleId = roleId;
      }
      if (departmentId !== undefined) {
        if (departmentId) {
          const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
          if (!deptExists) {
            return res.status(400).json({ message: "Department does not exist" });
          }
          updateData.departmentId = departmentId;
        } else {
          updateData.departmentId = null;
        }
      }
    } else {
      // If not admin, ignore roleId and departmentId attempts
      if (roleId || departmentId !== undefined) {
        return res.status(403).json({ message: "Forbidden. Non-admin users cannot alter roles or departments." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        department: true
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "Internal server error while updating user" });
  }
}

// Delete User (Admin only)
export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(400).json({ message: "Bad request. You cannot delete your own account." });
    }

    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Internal server error during user deletion" });
  }
}

// List all roles
export async function getRoles(req: AuthenticatedRequest, res: Response) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }
    });
    return res.status(200).json({ roles });
  } catch (error: any) {
    console.error("Get Roles Error:", error);
    return res.status(500).json({ message: "Internal server error while fetching roles" });
  }
}
