require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) return;

  await prisma.product.createMany({
    data: [
      { name: "Widget", price: 9.99 },
      { name: "Gadget", price: 19.99 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
