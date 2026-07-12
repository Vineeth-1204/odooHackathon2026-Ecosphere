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

  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: { name: c.name, description: c.description }
    });
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
