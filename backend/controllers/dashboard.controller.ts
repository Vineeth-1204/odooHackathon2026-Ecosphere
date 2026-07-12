import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// Helper to get a setting value with a default fallback
async function getSettingValue(key: string, defaultValue: string): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to check if a database table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result: any[] = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}');`
    );
    return result[0]?.exists === true;
  } catch (err) {
    console.error(`Check table exist failed for ${tableName}:`, err);
    return false;
  }
}

export async function getESGScores(req: AuthenticatedRequest, res: Response) {
  try {
    // 1. Load weights
    const wEnv = parseFloat(await getSettingValue("esg_score_weight_environmental", "0.4"));
    const wSoc = parseFloat(await getSettingValue("esg_score_weight_social", "0.3"));
    const wGov = parseFloat(await getSettingValue("esg_score_weight_governance", "0.3"));

    // 2. Fetch all departments
    const departments = await prisma.department.findMany({
      include: {
        environmentalGoals: true,
        users: true
      }
    });

    const totalUsers = await prisma.user.count();
    const totalPolicies = await prisma.policy.count();

    // 3. Compute department scores
    const deptScores = [];
    let sumTotal = 0;
    let sumEnv = 0;
    let sumSoc = 0;
    let sumGov = 0;

    // Check if Team 3's tables are present in the DB
    const hasParticipation = await checkTableExists("participation");
    const hasChallengeParticipation = await checkTableExists("challenge_participation");

    for (const dept of departments) {
      // A. Environmental Score (based on goal completion percentage)
      let envScore = 70; // Default baseline
      if (dept.environmentalGoals.length > 0) {
        let totalProgress = 0;
        dept.environmentalGoals.forEach((goal) => {
          if (goal.targetValue > 0) {
            const ratio = goal.currentValue / goal.targetValue;
            totalProgress += Math.min(ratio * 100, 100);
          }
        });
        envScore = totalProgress / dept.environmentalGoals.length;
      }

      // B. Social Score (based on CSR participation or challenges if tables exist, else mock)
      let socScore = 75; // Default baseline
      if (hasParticipation && dept.users.length > 0) {
        try {
          const userIds = dept.users.map((u) => u.id);
          // Query raw SQL to avoid compilation issues with missing Prisma Client models
          const userIdsString = userIds.map((id) => `'${id}'`).join(",");
          if (userIdsString) {
            const participations: any[] = await prisma.$queryRawUnsafe(
              `SELECT COUNT(*) as count FROM participation WHERE "userId" IN (${userIdsString}) AND status = 'APPROVED';`
            );
            const challengeParticipations: any[] = await prisma.$queryRawUnsafe(
              `SELECT COUNT(*) as count FROM challenge_participation WHERE "userId" IN (${userIdsString}) AND status = 'APPROVED';`
            );
            
            const totalApproved = Number(participations[0]?.count || 0) + Number(challengeParticipations[0]?.count || 0);
            socScore = Math.min(60 + (totalApproved * 5), 100); // Dynamic scale
          }
        } catch (err) {
          console.error("Social query failed, using baseline:", err);
        }
      }

      // C. Governance Score
      // Formula: Policy Acknowledgement Rate (50%) + Compliance Issue Resolution Rate (50%)
      let govScore = 80; // Baseline
      const deptUserIds = dept.users.map((u) => u.id);
      
      if (deptUserIds.length > 0) {
        // Policy ack rate
        let ackRate = 1.0;
        if (totalPolicies > 0) {
          const acks = await prisma.policyAcknowledgement.count({
            where: { userId: { in: deptUserIds } }
          });
          ackRate = acks / (deptUserIds.length * totalPolicies);
        }

        // Compliance issues for users in this department
        const totalDeptIssues = await prisma.complianceIssue.count({
          where: { ownerId: { in: deptUserIds } }
        });
        const resolvedDeptIssues = await prisma.complianceIssue.count({
          where: { ownerId: { in: deptUserIds }, status: "RESOLVED" }
        });
        
        let complianceRate = 1.0;
        if (totalDeptIssues > 0) {
          complianceRate = resolvedDeptIssues / totalDeptIssues;
        }

        // Overdue count deduction
        const now = new Date();
        const overdueCount = await prisma.complianceIssue.count({
          where: {
            ownerId: { in: deptUserIds },
            status: "OPEN",
            dueDate: { lt: now }
          }
        });

        govScore = (ackRate * 50) + (complianceRate * 50) - (overdueCount * 10);
        govScore = Math.max(0, Math.min(govScore, 100));
      }

      const totalScore = (envScore * wEnv) + (socScore * wSoc) + (govScore * wGov);
      
      deptScores.push({
        departmentId: dept.id,
        departmentName: dept.name,
        environmentalScore: Math.round(envScore * 10) / 10,
        socialScore: Math.round(socScore * 10) / 10,
        governanceScore: Math.round(govScore * 10) / 10,
        totalScore: Math.round(totalScore * 10) / 10
      });

      sumEnv += envScore;
      sumSoc += socScore;
      sumGov += govScore;
      sumTotal += totalScore;
    }

    const deptCount = departments.length || 1;
    const orgScores = {
      environmentalScore: Math.round((sumEnv / deptCount) * 10) / 10,
      socialScore: Math.round((sumSoc / deptCount) * 10) / 10,
      governanceScore: Math.round((sumGov / deptCount) * 10) / 10,
      totalScore: Math.round((sumTotal / deptCount) * 10) / 10
    };

    return res.status(200).json({
      weights: { environmental: wEnv, social: wSoc, governance: wGov },
      organizationScores: orgScores,
      departmentScores: deptScores
    });
  } catch (error: any) {
    console.error("Get ESG Scores Error:", error);
    return res.status(500).json({ message: "Internal server error while computing ESG scores" });
  }
}

// KPI stats for cards on the home dashboard
export async function getDashboardKPIs(req: AuthenticatedRequest, res: Response) {
  try {
    const totalUsers = await prisma.user.count();
    const totalDepartments = await prisma.department.count();
    
    // Carbon Footprint summary
    const carbonTx = await prisma.carbonTransaction.findMany();
    const totalCarbon = carbonTx.reduce((sum, tx) => sum + tx.emissions, 0);

    // Compliance summary
    const openIssues = await prisma.complianceIssue.count({ where: { status: "OPEN" } });
    const resolvedIssues = await prisma.complianceIssue.count({ where: { status: "RESOLVED" } });
    const totalIssues = openIssues + resolvedIssues;
    const complianceHealth = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

    // Goals met
    const goals = await prisma.environmentalGoal.findMany();
    const completedGoals = goals.filter((g) => g.currentValue >= g.targetValue).length;
    const goalsProgress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 100;

    // Policy signature completion
    const policies = await prisma.policy.count();
    const acknowledgements = await prisma.policyAcknowledgement.count();
    const targetAcks = policies * totalUsers;
    const policyCompletionRate = targetAcks > 0 ? Math.round((acknowledgements / targetAcks) * 100) : 100;

    return res.status(200).json({
      kpis: {
        totalUsers,
        totalDepartments,
        totalCarbonEmissions: Math.round(totalCarbon * 100) / 100,
        openComplianceIssues: openIssues,
        complianceHealthRate: complianceHealth,
        goalsCompletionRate: goalsProgress,
        policyAcknowledgeRate: policyCompletionRate
      }
    });
  } catch (error: any) {
    console.error("Get Dashboard KPIs Error:", error);
    return res.status(500).json({ message: "Internal server error while loading dashboard KPIs" });
  }
}
