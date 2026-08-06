require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { initializeDB } = require("./db/config.mongo");
const { SALT_ROUNDS } = require("./constants");

const User = require("./models/User");
const Team = require("./models/Team");
const Project = require("./models/Project");
const Tag = require("./models/Tag");
const Task = require("./models/Task");

// ---- seed data ----------------------------------------------------

const USERS = [
  { name: "Sanu Ranjan", email: "sanu@taskdesk.dev", password: "secure123" },
  { name: "Tanay Mehta", email: "tanay@taskdesk.dev", password: "secure123" },
  { name: "Priya Nair", email: "priya@taskdesk.dev", password: "secure123" },
  { name: "Arjun Rao", email: "arjun@taskdesk.dev", password: "secure123" },
  { name: "Meera Iyer", email: "meera@taskdesk.dev", password: "secure123" },
];

// memberIdxs -> indexes into the seeded users array
const TEAMS = [
  {
    name: "Development",
    description: "Builds and maintains the product",
    memberIdxs: [0, 3],
  },
  { name: "Design", description: "Owns UX and visual design", memberIdxs: [2] },
  {
    name: "Marketing",
    description: "Runs campaigns and growth",
    memberIdxs: [1, 4],
  },
  {
    name: "Sales",
    description: "Handles deals and customer outreach",
    memberIdxs: [4],
  },
  {
    name: "Finance",
    description: "Manages budgets and accounts",
    memberIdxs: [4],
  },
];

const PROJECTS = [
  {
    name: "Website Redesign",
    description: "Revamp the marketing site end to end",
  },
  { name: "Mobile App Launch", description: "Ship the new mobile app in Q3" },
  { name: "Q3 Ad Campaign", description: "Paid and organic push for Q3" },
  {
    name: "Billing Overhaul",
    description: "Migrate to the new billing system",
  },
  {
    name: "Customer Onboarding",
    description: "Streamline first-run experience",
  },
  {
    name: "API v2 Migration",
    description: "Move all clients to the v2 REST API",
  },
  {
    name: "Design System",
    description: "Build a shared component and token library",
  },
  {
    name: "Security Audit",
    description: "Full pen-test and vulnerability remediation",
  },
  {
    name: "Data Warehouse",
    description: "Centralize analytics into one warehouse",
  },
  {
    name: "Referral Program",
    description: "Launch a customer referral and rewards flow",
  },
  {
    name: "Support Portal",
    description: "Self-serve help center and ticketing",
  },
  {
    name: "Performance Sprint",
    description: "Cut page load times across the app",
  },
];

const TAGS = [
  "Urgent",
  "Bug",
  "UI",
  "Backend",
  "Research",
  "Documentation",
  "High Priority",
];

const TASKS = [
  {
    name: "Design landing page wireframes",
    projectIdx: 0,
    teamIdx: 1,
    ownerIdxs: [2],
    tags: ["UI", "Research"],
    timeToComplete: 4,
    status: "In Progress",
  },
  {
    name: "Build responsive navbar",
    projectIdx: 0,
    teamIdx: 0,
    ownerIdxs: [0],
    tags: ["UI", "Backend"],
    timeToComplete: 2,
    status: "To Do",
  },
  {
    name: "Fix broken contact form",
    projectIdx: 0,
    teamIdx: 0,
    ownerIdxs: [3],
    tags: ["Bug", "Urgent"],
    timeToComplete: 1,
    status: "Completed",
  },
  {
    name: "Set up push notifications",
    projectIdx: 1,
    teamIdx: 0,
    ownerIdxs: [0, 3],
    tags: ["Backend"],
    timeToComplete: 5,
    status: "To Do",
  },
  {
    name: "App store screenshots",
    projectIdx: 1,
    teamIdx: 1,
    ownerIdxs: [2],
    tags: ["UI", "Documentation"],
    timeToComplete: 3,
    status: "In Progress",
  },
  {
    name: "Beta crash triage",
    projectIdx: 1,
    teamIdx: 0,
    ownerIdxs: [3],
    tags: ["Bug", "High Priority"],
    timeToComplete: 2,
    status: "Blocked",
  },
  {
    name: "Draft ad copy variants",
    projectIdx: 2,
    teamIdx: 2,
    ownerIdxs: [4],
    tags: ["Research"],
    timeToComplete: 2,
    status: "Completed",
  },
  {
    name: "Set campaign budget",
    projectIdx: 2,
    teamIdx: 4,
    ownerIdxs: [4],
    tags: ["High Priority"],
    timeToComplete: 1,
    status: "Completed",
  },
  {
    name: "A/B test landing variants",
    projectIdx: 2,
    teamIdx: 2,
    ownerIdxs: [1, 4],
    tags: ["Research", "UI"],
    timeToComplete: 4,
    status: "In Progress",
  },
  {
    name: "Migrate invoices to new schema",
    projectIdx: 3,
    teamIdx: 0,
    ownerIdxs: [0],
    tags: ["Backend", "Urgent"],
    timeToComplete: 6,
    status: "To Do",
  },
  {
    name: "Reconcile Q2 accounts",
    projectIdx: 3,
    teamIdx: 4,
    ownerIdxs: [4],
    tags: ["Documentation"],
    timeToComplete: 3,
    status: "Completed",
  },
  {
    name: "Refund flow edge cases",
    projectIdx: 3,
    teamIdx: 0,
    ownerIdxs: [3],
    tags: ["Bug"],
    timeToComplete: 2,
    status: "Blocked",
  },
  {
    name: "Welcome email sequence",
    projectIdx: 4,
    teamIdx: 2,
    ownerIdxs: [1],
    tags: ["Documentation"],
    timeToComplete: 2,
    status: "In Progress",
  },
  {
    name: "Onboarding checklist UI",
    projectIdx: 4,
    teamIdx: 1,
    ownerIdxs: [2],
    tags: ["UI"],
    timeToComplete: 3,
    status: "To Do",
  },
  {
    name: "Track activation metrics",
    projectIdx: 4,
    teamIdx: 0,
    ownerIdxs: [0, 1],
    tags: ["Backend", "Research"],
    timeToComplete: 4,
    status: "Completed",
  },
  {
    name: "Deprecate v1 endpoints",
    projectIdx: 5,
    teamIdx: 0,
    ownerIdxs: [0, 3],
    tags: ["Backend", "High Priority"],
    timeToComplete: 5,
    status: "In Progress",
  },
  {
    name: "Publish component tokens",
    projectIdx: 6,
    teamIdx: 1,
    ownerIdxs: [2],
    tags: ["UI", "Documentation"],
    timeToComplete: 3,
    status: "To Do",
  },
  {
    name: "Patch auth vulnerabilities",
    projectIdx: 7,
    teamIdx: 0,
    ownerIdxs: [3],
    tags: ["Bug", "Urgent", "High Priority"],
    timeToComplete: 4,
    status: "Completed",
  },
  {
    name: "Set up ETL pipeline",
    projectIdx: 8,
    teamIdx: 0,
    ownerIdxs: [0],
    tags: ["Backend", "Research"],
    timeToComplete: 7,
    status: "Blocked",
  },
  {
    name: "Design referral reward tiers",
    projectIdx: 9,
    teamIdx: 2,
    ownerIdxs: [1, 4],
    tags: ["Research"],
    timeToComplete: 3,
    status: "To Do",
  },
  {
    name: "Build ticket submission form",
    projectIdx: 10,
    teamIdx: 1,
    ownerIdxs: [2],
    tags: ["UI", "Backend"],
    timeToComplete: 4,
    status: "In Progress",
  },
];

// spread completed tasks across the last week so the
// last-week report has data
function completedDateWithinWeek(i) {
  const d = new Date();
  d.setDate(d.getDate() - (i % 7));
  return d;
}

// ---- runner -------------------------------------------------------

async function seed() {
  await initializeDB();

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Project.deleteMany({}),
    Tag.deleteMany({}),
    Task.deleteMany({}),
  ]);

  console.log("Seeding users...");
  const users = await User.insertMany(
    await Promise.all(
      USERS.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, SALT_ROUNDS),
      })),
    ),
  );

  console.log("Seeding teams...");
  const teams = await Team.insertMany(
    TEAMS.map((t) => ({
      name: t.name,
      description: t.description,
      members: t.memberIdxs.map((i) => users[i]._id),
    })),
  );

  console.log("Seeding projects...");
  const projects = await Project.insertMany(PROJECTS);

  console.log("Seeding tags...");
  await Tag.insertMany(TAGS.map((name) => ({ name })));

  console.log("Seeding tasks...");
  let completedCount = 0;
  const taskDocs = TASKS.map((t) => {
    const doc = {
      name: t.name,
      project: projects[t.projectIdx]._id,
      team: teams[t.teamIdx]._id,
      owners: t.ownerIdxs.map((i) => users[i]._id),
      tags: t.tags,
      timeToComplete: t.timeToComplete,
      status: t.status,
    };
    if (t.status === "Completed") {
      doc.updatedAt = completedDateWithinWeek(completedCount++);
    }
    return doc;
  });
  // insertMany skips the pre-save hook, so our custom updatedAt survives
  await Task.insertMany(taskDocs);

  console.log("\nSeed complete:");
  console.log(`  users:    ${users.length}`);
  console.log(`  teams:    ${teams.length}`);
  console.log(`  projects: ${projects.length}`);
  console.log(`  tags:     ${TAGS.length}`);
  console.log(`  tasks:    ${taskDocs.length}`);
  console.log(
    "\nLogin with any seeded user, e.g. sanu@taskdesk.dev / secure123",
  );

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.connection.close();
  process.exit(1);
});
