// Import the Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a new user
  const newUser = await prisma.user.create({
    data: {
      username: "testuseradmin",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN",
    },
  });
  console.log('User created:', newUser);

  // Close the Prisma Client connection
  await prisma.$disconnect();
}

// Run the main function
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
