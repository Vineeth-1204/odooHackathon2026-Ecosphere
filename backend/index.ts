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
import emissionRoutes from "./routes/emission.routes";
import carbonRoutes from "./routes/carbon.routes";
import goalRoutes from "./routes/goal.routes";
import productRoutes from "./routes/product.routes";

// Governance Module Routes
import policyRoutes from "./routes/policy.routes";
import auditRoutes from "./routes/audit.routes";
import complianceRoutes from "./routes/compliance.routes";
import reportRoutes from "./routes/report.routes";
import notificationRoutes from "./routes/notification.routes";
import dashboardRoutes from "./routes/dashboard.routes";

// Social & Gamification Routes
import csrRoutes from "./src/routes/csr.routes";
import challengeRoutes from "./src/routes/challenge.routes";
import badgeRoutes from "./src/routes/badge.routes";
import rewardRoutes from "./src/routes/reward.routes";
import leaderboardRoutes from "./src/routes/leaderboard.routes";

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
app.use("/api/emissions", emissionRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/products", productRoutes);

// Governance Module Routes mounting
app.use("/api/policies", policyRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Social & Gamification Routes mounting
app.use("/api/csr", csrRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

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
