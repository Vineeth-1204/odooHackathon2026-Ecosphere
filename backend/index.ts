import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import departmentRoutes from "./routes/department.routes";
import categoryRoutes from "./routes/category.routes";
import settingsRoutes from "./routes/settings.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware (clean console format)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Routes mounting
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandle Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Ecosphere Backend running on port ${PORT}`);
  console.log(`========================================`);
});
