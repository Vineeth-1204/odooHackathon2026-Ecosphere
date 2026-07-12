import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding database...");

  // 1. Roles
  const roles = [
    { name: "ADMIN", description: "System Administrator with full permissions" },
    { name: "USER", description: "Standard user with access to general modules" },
    { name: "MANAGER", description: "Department manager with reporting access" }
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description }
    });
    dbRoles[r.name] = role;
    console.log(`Upserted Role: ${role.name}`);
  }

  // 2. Departments
  const departments = [
    { name: "Executive", description: "C-level officers and directors" },
    { name: "Engineering & IT", description: "Software development and IT operations" },
    { name: "Human Resources", description: "People and culture management" },
    { name: "Sustainability & ESG", description: "Core environmental and governance compliance" },
    { name: "Operations & Logistics", description: "Facilities, manufacturing, and shipping" }
  ];

  const dbDepts: Record<string, any> = {};
  for (const d of departments) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: { name: d.name, description: d.description }
    });
    dbDepts[d.name] = dept;
    console.log(`Upserted Department: ${dept.name}`);
  }

  // 3. Admin User
  const adminEmail = "admin@ecosphere.com";
  const adminPassword = "adminPassword123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: "System",
      lastName: "Admin",
      roleId: dbRoles["ADMIN"].id,
      departmentId: dbDepts["Sustainability & ESG"].id
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: "System",
      lastName: "Admin",
      roleId: dbRoles["ADMIN"].id,
      departmentId: dbDepts["Sustainability & ESG"].id
    }
  });
  console.log(`Upserted Admin User: ${admin.email} (Password: ${adminPassword})`);

  // Create a regular user for demonstration testing
  const userEmail = "employee@ecosphere.com";
  const userPassword = "userPassword123";
  const hashedUserPassword = await bcrypt.hash(userPassword, 10);
  const employee = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      firstName: "Jane",
      lastName: "Doe",
      roleId: dbRoles["USER"].id,
      departmentId: dbDepts["Engineering & IT"].id
    },
    create: {
      email: userEmail,
      password: hashedUserPassword,
      firstName: "Jane",
      lastName: "Doe",
      roleId: dbRoles["USER"].id,
      departmentId: dbDepts["Engineering & IT"].id
    }
  });
  console.log(`Upserted Demo Employee: ${employee.email} (Password: ${userPassword})`);

  // 4. Categories
  const categories = [
    { name: "Scope 1 Emissions", description: "Direct GHG emissions from owned or controlled sources" },
    { name: "Scope 2 Emissions", description: "Indirect GHG emissions from purchase of electricity, heat, or steam" },
    { name: "Scope 3 Emissions", description: "Other indirect emissions (value chain, travel, waste)" },
    { name: "CSR Projects", description: "Corporate Social Responsibility activities and investments" },
    { name: "Diversity & Inclusion", description: "Social metrics tracking equal opportunity and recruitment representation" },
    { name: "Governance & Policies", description: "Compliance, ethical conduct, board diversity, and anti-corruption policies" }
  ];

  const dbCats: Record<string, any> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: { name: c.name, description: c.description }
    });
    dbCats[c.name] = cat;
    console.log(`Upserted Category: ${cat.name}`);
  }

  // 5. Settings
  const settings = [
    { key: "site_name", value: "Ecosphere ESG Portal", description: "The visual name of the platform displayed on layouts" },
    { key: "allow_user_registration", value: "true", description: "Toggle whether new accounts can be created from the sign-up page" },
    { key: "system_email", value: "sustainability@ecosphere.com", description: "Contact/From email address for notifications and issues" },
    { key: "esg_score_weight_environmental", value: "0.4", description: "The weighting given to Environmental metrics in overall ESG scores" },
    { key: "esg_score_weight_social", value: "0.3", description: "The weighting given to Social/Community metrics in overall ESG scores" },
    { key: "esg_score_weight_governance", value: "0.3", description: "The weighting given to Governance metrics in overall ESG scores" },
    { key: "maintenance_mode", value: "false", description: "Restrict site access to administrators only during system updates" }
  ];

  for (const s of settings) {
    const set = await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: { key: s.key, value: s.value, description: s.description }
    });
    console.log(`Upserted Setting: ${set.key} = ${set.value}`);
  }

  // 6. Dummy Leaderboard Users
  const dummyUsers = [
    { email: "alice@ecosphere.com", firstName: "Alice", lastName: "Johnson", xpPoints: 280, rewardPoints: 150, dept: "Engineering & IT" },
    { email: "bob@ecosphere.com", firstName: "Bob", lastName: "Smith", xpPoints: 420, rewardPoints: 220, dept: "Executive" },
    { email: "charlie@ecosphere.com", firstName: "Charlie", lastName: "Davis", xpPoints: 310, rewardPoints: 190, dept: "Sustainability & ESG" },
    { email: "diana@ecosphere.com", firstName: "Diana", lastName: "Prince", xpPoints: 150, rewardPoints: 90, dept: "Operations & Logistics" },
    { email: "ethan@ecosphere.com", firstName: "Ethan", lastName: "Hunt", xpPoints: 90, rewardPoints: 40, dept: "Human Resources" },
    { email: "frank@ecosphere.com", firstName: "Frank", lastName: "Castle", xpPoints: 510, rewardPoints: 280, dept: "Engineering & IT" },
    { email: "grace@ecosphere.com", firstName: "Grace", lastName: "Hopper", xpPoints: 620, rewardPoints: 350, dept: "Engineering & IT" },
    { email: "harry@ecosphere.com", firstName: "Harry", lastName: "Potter", xpPoints: 80, rewardPoints: 30, dept: "Executive" },
    { email: "indiana@ecosphere.com", firstName: "Indiana", lastName: "Jones", xpPoints: 350, rewardPoints: 180, dept: "Operations & Logistics" },
    { email: "julia@ecosphere.com", firstName: "Julia", lastName: "Roberts", xpPoints: 240, rewardPoints: 120, dept: "Human Resources" },
    { email: "kevin@ecosphere.com", firstName: "Kevin", lastName: "Bacon", xpPoints: 190, rewardPoints: 95, dept: "Executive" },
    { email: "lara@ecosphere.com", firstName: "Lara", lastName: "Croft", xpPoints: 480, rewardPoints: 260, dept: "Operations & Logistics" },
    { email: "michael@ecosphere.com", firstName: "Michael", lastName: "Jordan", xpPoints: 320, rewardPoints: 170, dept: "Human Resources" },
    { email: "nancy@ecosphere.com", firstName: "Nancy", lastName: "Drew", xpPoints: 410, rewardPoints: 210, dept: "Sustainability & ESG" },
    { email: "oliver@ecosphere.com", firstName: "Oliver", lastName: "Twist", xpPoints: 110, rewardPoints: 55, dept: "Engineering & IT" }
  ];

  const dbUsers: Record<string, any> = { [adminEmail]: admin, [userEmail]: employee };
  for (const du of dummyUsers) {
    const hashedPw = await bcrypt.hash("userPassword123", 10);
    const u = await prisma.user.upsert({
      where: { email: du.email },
      update: {
        firstName: du.firstName,
        lastName: du.lastName,
        xpPoints: du.xpPoints,
        rewardPoints: du.rewardPoints,
        roleId: dbRoles["USER"].id,
        departmentId: dbDepts[du.dept].id
      },
      create: {
        email: du.email,
        password: hashedPw,
        firstName: du.firstName,
        lastName: du.lastName,
        xpPoints: du.xpPoints,
        rewardPoints: du.rewardPoints,
        roleId: dbRoles["USER"].id,
        departmentId: dbDepts[du.dept].id
      }
    });
    dbUsers[du.email] = u;
    console.log(`Upserted Dummy User: ${du.email}`);
  }

  // 7. Dummy Challenges
  const challenges = [
    { title: "Reduce Office Paper Waste", description: "Switch to 100% digital documentation and logs.", categoryId: dbCats["Governance & Policies"].id, xpValue: 30, difficulty: "EASY", status: "ACTIVE" },
    { title: "Car Pool Friday", description: "Carpool or take public transport to work on Fridays.", categoryId: dbCats["Scope 3 Emissions"].id, xpValue: 60, difficulty: "MEDIUM", status: "ACTIVE" },
    { title: "Green Computing Audit", description: "Turn off developer workstations after hours.", categoryId: dbCats["Scope 2 Emissions"].id, xpValue: 120, difficulty: "HARD", status: "ACTIVE" }
  ];

  for (const ch of challenges) {
    const existing = await prisma.challenge.findFirst({ where: { title: ch.title } });
    if (!existing) {
      await prisma.challenge.create({
        data: {
          title: ch.title,
          description: ch.description,
          categoryId: ch.categoryId,
          xpValue: ch.xpValue,
          difficulty: ch.difficulty as any,
          status: ch.status as any,
          createdById: admin.id
        }
      });
      console.log(`Created Challenge: ${ch.title}`);
    }
  }

  // 8. Dummy CSR Activities
  const csrActivities = [
    { title: "Community Tree Planting", description: "Help plant 500 saplings in the city park.", categoryId: dbCats["CSR Projects"].id, pointsReward: 25, date: new Date("2026-11-20"), maxParticipants: 50, status: "ACTIVE" },
    { title: "Beach Clean Up Drive", description: "Remove microplastics and refuse from the coastline.", categoryId: dbCats["CSR Projects"].id, pointsReward: 40, date: new Date("2026-10-15"), maxParticipants: 30, status: "ACTIVE" },
    { title: "E-Waste Recycling Camp", description: "Bring discarded personal electronics for proper recycling.", categoryId: dbCats["CSR Projects"].id, pointsReward: 15, date: new Date("2026-12-05"), maxParticipants: null, status: "ACTIVE" }
  ];

  for (const act of csrActivities) {
    const existing = await prisma.cSRActivity.findFirst({ where: { title: act.title } });
    if (!existing) {
      await prisma.cSRActivity.create({
        data: {
          title: act.title,
          description: act.description,
          categoryId: act.categoryId,
          pointsReward: act.pointsReward,
          date: act.date,
          maxParticipants: act.maxParticipants,
          status: act.status as any,
          createdById: admin.id
        }
      });
      console.log(`Created CSR Activity: ${act.title}`);
    }
  }

  // 9. Dummy Badges
  const badges = [
    { name: "Green Novice", description: "Earn 50 XP points", iconUrl: "Award", unlockRule: { type: "xp_gte", value: 50 } },
    { name: "Eco Warrior", description: "Earn 200 XP points", iconUrl: "Trophy", unlockRule: { type: "xp_gte", value: 200 } },
    { name: "CSR Champion", description: "Complete 3 CSR activities", iconUrl: "Shield", unlockRule: { type: "csr_gte", value: 3 } }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { description: badge.description, iconUrl: badge.iconUrl, unlockRule: badge.unlockRule as any },
      create: { name: badge.name, description: badge.description, iconUrl: badge.iconUrl, unlockRule: badge.unlockRule as any }
    });
    console.log(`Upserted Badge: ${badge.name}`);
  }

  // 10. Dummy Rewards
  const rewards = [
    { name: "1-Ton Carbon Offset Certificate", description: "Retire 1 ton of certified carbon credits on your behalf.", pointsCost: 50, stock: 100, status: "ACTIVE" },
    { name: "Reusable Bamboo Bottle", description: "EcoSphere branded premium vacuum insulated water bottle.", pointsCost: 80, stock: 25, status: "ACTIVE" },
    { name: "Plant a Tree in Amazon Rainforest", description: "Donate to plant one native tree in degraded Amazon reserves.", pointsCost: 30, stock: 500, status: "ACTIVE" }
  ];

  for (const rew of rewards) {
    const existing = await prisma.reward.findFirst({ where: { name: rew.name } });
    if (!existing) {
      await prisma.reward.create({
        data: {
          name: rew.name,
          description: rew.description,
          pointsCost: rew.pointsCost,
          stock: rew.stock,
          status: rew.status as any
        }
      });
      console.log(`Created Reward: ${rew.name}`);
    } else {
      await prisma.reward.update({
        where: { id: existing.id },
        data: {
          description: rew.description,
          pointsCost: rew.pointsCost,
          stock: rew.stock,
          status: rew.status as any
        }
      });
      console.log(`Updated Reward: ${rew.name}`);
    }
  }

  // 11. Dummy Emission Factors
  const factors = [
    { name: "Grid Electricity Factor", value: 0.85, unit: "kWh", categoryId: dbCats["Scope 2 Emissions"].id, source: "EPA 2024", year: 2024 },
    { name: "Natural Gas Heating", value: 2.05, unit: "m3", categoryId: dbCats["Scope 1 Emissions"].id, source: "DEFRA 2024", year: 2024 },
    { name: "Air Travel Long Haul", value: 0.24, unit: "pkm", categoryId: dbCats["Scope 3 Emissions"].id, source: "ICAO 2024", year: 2024 },
    { name: "Diesel Generator", value: 2.68, unit: "liter", categoryId: dbCats["Scope 1 Emissions"].id, source: "EPA 2024", year: 2024 }
  ];

  const dbFactors: Record<string, any> = {};
  for (const f of factors) {
    const fact = await prisma.emissionFactor.upsert({
      where: { name: f.name },
      update: { value: f.value, unit: f.unit, categoryId: f.categoryId, source: f.source, year: f.year },
      create: { name: f.name, value: f.value, unit: f.unit, categoryId: f.categoryId, source: f.source, year: f.year }
    });
    dbFactors[f.name] = fact;
    console.log(`Upserted Emission Factor: ${fact.name}`);
  }

  // 12. Dummy Environmental Goals
  const goals = [
    { name: "Reduce Electricity Emissions by 20%", description: "Target for electricity conservation in engineering lab.", targetValue: 5000, currentValue: 1200, unit: "kg CO2e", startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), status: "ACTIVE", departmentId: dbDepts["Engineering & IT"].id },
    { name: "Decrease Business Travel Footprint", description: "Reduce intercontinental flights for leadership meetings.", targetValue: 8000, currentValue: 4500, unit: "kg CO2e", startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), status: "ACTIVE", departmentId: dbDepts["Executive"].id }
  ];

  for (const g of goals) {
    const existing = await prisma.environmentalGoal.findFirst({ where: { name: g.name } });
    if (!existing) {
      await prisma.environmentalGoal.create({
        data: g
      });
      console.log(`Created Environmental Goal: ${g.name}`);
    }
  }

  // 13. Dummy Carbon Transactions (over the last 6 months)
  const transactions = [
    { description: "Q1 Office Electricity Billing", activityValue: 1500, emissions: 1275, factorName: "Grid Electricity Factor", deptName: "Engineering & IT", email: "alice@ecosphere.com", date: new Date("2026-02-15") },
    { description: "Executive Business Flight to London", activityValue: 12000, emissions: 2880, factorName: "Air Travel Long Haul", deptName: "Executive", email: "bob@ecosphere.com", date: new Date("2026-03-10") },
    { description: "Warehouse Diesel Fuel Refill", activityValue: 800, emissions: 2144, factorName: "Diesel Generator", deptName: "Operations & Logistics", email: "admin@ecosphere.com", date: new Date("2026-04-18") },
    { description: "Q2 Office Electricity Billing", activityValue: 1800, emissions: 1530, factorName: "Grid Electricity Factor", deptName: "Engineering & IT", email: "alice@ecosphere.com", date: new Date("2026-05-22") },
    { description: "Regional Team Summit Travel", activityValue: 15000, emissions: 3600, factorName: "Air Travel Long Haul", deptName: "Human Resources", email: "ethan@ecosphere.com", date: new Date("2026-06-05") },
    { description: "Data Center Cooling Power", activityValue: 3000, emissions: 2550, factorName: "Grid Electricity Factor", deptName: "Engineering & IT", email: "employee@ecosphere.com", date: new Date("2026-07-02") }
  ];

  for (const tx of transactions) {
    const existing = await prisma.carbonTransaction.findFirst({ where: { description: tx.description, date: tx.date } });
    if (!existing) {
      await prisma.carbonTransaction.create({
        data: {
          description: tx.description,
          activityValue: tx.activityValue,
          emissions: tx.emissions,
          emissionFactorId: dbFactors[tx.factorName].id,
          departmentId: dbDepts[tx.deptName].id,
          userId: dbUsers[tx.email].id,
          date: tx.date
        }
      });
      console.log(`Created Carbon Transaction: ${tx.description}`);
    }
  }

  // 14. Dummy Policies
  const policies = [
    { title: "EcoSphere Sustainable Procurement Code", description: "Guidelines for purchasing low-carbon services and recycled materials.", effectiveDate: new Date("2026-01-10"), departmentScope: "Operations & Logistics" },
    { title: "Remote Work Energy Conservation Policy", description: "Best practices for reducing local power usage when working off-site.", effectiveDate: new Date("2026-03-01"), departmentScope: null }
  ];

  for (const p of policies) {
    const existing = await prisma.policy.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.policy.create({ data: p });
      console.log(`Created Policy: ${p.title}`);
    }
  }

  // 15. Dummy Audits
  const audits = [
    { scope: "Q1 Waste Management Audit", auditor: "Sarah Connor", status: "COMPLETED", date: new Date("2026-03-15") },
    { scope: "Q2 Energy Audit & Scope 2 Compliance Check", auditor: "James Cole", status: "SCHEDULED", date: new Date("2026-09-20") }
  ];

  for (const a of audits) {
    const existing = await prisma.audit.findFirst({ where: { scope: a.scope } });
    if (!existing) {
      await prisma.audit.create({ data: a });
      console.log(`Created Audit: ${a.scope}`);
    }
  }

  // 16. Dummy Compliance issues
  const complianceIssues = [
    { description: "Insufficient sorting bins in cafeteria", status: "OPEN", dueDate: new Date("2026-08-30"), severity: "LOW", ownerId: employee.id },
    { description: "Data center backup generator leakage", status: "IN_PROGRESS", dueDate: new Date("2026-07-25"), severity: "HIGH", ownerId: admin.id }
  ];

  for (const ci of complianceIssues) {
    const existing = await prisma.complianceIssue.findFirst({ where: { description: ci.description } });
    if (!existing) {
      await prisma.complianceIssue.create({ data: ci });
      console.log(`Created Compliance Issue: ${ci.description}`);
    }
  }

  // 17. Dummy Product ESG Profiles
  const products = [
    { name: "EcoSphere Bamboo Travel Flask", sku: "FL-BAM-01", description: "Double-walled insulation travel flask from natural bamboo wood.", carbonFootprint: 1.2, waterFootprint: 5.4, wasteGenerated: 0.1, recyclability: 95.0, esgGrade: "A", materialSourcing: "FSC Certified Forests" },
    { name: "Recycled Polymer Utility Case", sku: "CS-REC-02", description: "Impact resistant case manufactured entirely from ocean plastic reclaim.", carbonFootprint: 3.5, waterFootprint: 12.8, wasteGenerated: 0.4, recyclability: 80.0, esgGrade: "B", materialSourcing: "Reclaimed Ocean Polymers" }
  ];

  for (const prod of products) {
    await prisma.productProfile.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod
    });
    console.log(`Upserted Product ESG Profile: ${prod.name}`);
  }

  // 18. Dummy Department Scores for charts comparison
  const deptScores = [
    { departmentName: "Executive", env: 85, soc: 90, gov: 95, total: 90, period: "2026-Q2" },
    { departmentName: "Engineering & IT", env: 75, soc: 80, gov: 85, total: 80, period: "2026-Q2" },
    { departmentName: "Human Resources", env: 70, soc: 95, gov: 90, total: 85, period: "2026-Q2" },
    { departmentName: "Sustainability & ESG", env: 95, soc: 95, gov: 95, total: 95, period: "2026-Q2" },
    { departmentName: "Operations & Logistics", env: 60, soc: 75, gov: 80, total: 71, period: "2026-Q2" }
  ];

  for (const ds of deptScores) {
    const deptId = dbDepts[ds.departmentName].id;
    const existing = await prisma.departmentScore.findFirst({
      where: { departmentId: deptId, period: ds.period }
    });
    if (!existing) {
      await prisma.departmentScore.create({
        data: {
          departmentId: deptId,
          environmentalScore: ds.env,
          socialScore: ds.soc,
          governanceScore: ds.gov,
          totalScore: ds.total,
          period: ds.period
        }
      });
      console.log(`Created Department Score for: ${ds.departmentName}`);
    }
  }

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
