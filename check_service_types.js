const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cars = await prisma.car.findMany();
  console.log("Cars serviceTypes:");
  cars.forEach(c => {
    console.log(`Model: "${c.make} ${c.model}" | serviceTypes: ${JSON.stringify(c.serviceTypes)}`);
  });
}

run().finally(() => prisma.$disconnect());
