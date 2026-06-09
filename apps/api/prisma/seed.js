const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const permissions = [
  {
    key: "restaurants.manage",
    name: "Manage restaurants",
    description: "Create, update and deactivate restaurants"
  },
  {
    key: "branches.manage",
    name: "Manage branches",
    description: "Create, update and deactivate branches"
  },
  {
    key: "roles.manage",
    name: "Manage roles",
    description: "Manage restaurant roles, permissions and assignments"
  },
  {
    key: "users.manage",
    name: "Manage users",
    description: "Manage users within a restaurant"
  }
];

async function main() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        key: permission.key
      },
      update: {
        deletedAt: null,
        description: permission.description,
        name: permission.name
      },
      create: permission
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
