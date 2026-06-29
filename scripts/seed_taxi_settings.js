const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Taxi Fare Settings...');

  const settings = [
    {
      vehicleCategory: 'Sedan',
      airportBaseFare: 0,
      airportRatePerKm: 15,
      airportMinFare: 300,
      roundTripRatePerKm: 13,
      roundTripMinKmPerDay: 250,
      driverAllowancePerDay: 350,
    },
    {
      vehicleCategory: 'SUV',
      airportBaseFare: 0,
      airportRatePerKm: 18,
      airportMinFare: 400,
      roundTripRatePerKm: 15,
      roundTripMinKmPerDay: 250,
      driverAllowancePerDay: 350,
    },
    {
      vehicleCategory: 'Luxury',
      airportBaseFare: 0,
      airportRatePerKm: 30,
      airportMinFare: 1000,
      roundTripRatePerKm: 25,
      roundTripMinKmPerDay: 250,
      driverAllowancePerDay: 500,
    },
    {
      vehicleCategory: 'Crysta',
      airportBaseFare: 0,
      airportRatePerKm: 20,
      airportMinFare: 500,
      roundTripRatePerKm: 18,
      roundTripMinKmPerDay: 250,
      driverAllowancePerDay: 350,
    }
  ];

  for (const s of settings) {
    await prisma.taxiFareSetting.upsert({
      where: { vehicleCategory: s.vehicleCategory },
      update: s,
      create: s,
    });
    console.log(`Upserted ${s.vehicleCategory}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
