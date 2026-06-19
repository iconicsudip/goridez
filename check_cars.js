const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cars = await prisma.car.findMany();
  console.log('Total cars:', cars.length);
  cars.forEach(c => console.log(c.make, c.model, c.serviceTypes));
}
check().finally(() => prisma.$disconnect());
