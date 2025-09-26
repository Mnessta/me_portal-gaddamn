const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    },
  });

  console.log("User created:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
