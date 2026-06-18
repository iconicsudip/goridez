import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  { category: 'Hatchback', model: 'Maruti Swift', fuel: 'Petrol/CNG', p12: 1800, km12: 150, p24: 3000, km24: 300, extraKm: 11, dep: 5000, active: true },
  { category: 'Hatchback', model: 'Baleno', fuel: 'Petrol', p12: 2000, km12: 150, p24: 3200, km24: 300, extraKm: 11, dep: 5000, active: true },
  { category: 'Hatchback', model: 'TATA TIAGO', fuel: 'Petrol', p12: 1800, km12: 150, p24: 2800, km24: 300, extraKm: 11, dep: 5000, active: true },
  { category: 'Hatchback', model: 'I20', fuel: 'Petrol', p12: 1800, km12: 150, p24: 2800, km24: 300, extraKm: 12, dep: 5000, active: true },
  { category: 'Sedan', model: 'DZIRE', fuel: 'Petrol/CNG', p12: 2000, km12: 150, p24: 3000, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'Sedan', model: 'Honda Amaze', fuel: 'Petrol', p12: 2000, km12: 150, p24: 3000, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'Sedan', model: 'VERNA', fuel: 'Petrol', p12: 2800, km12: 150, p24: 4000, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'Maruti Brezza', fuel: 'Petrol/CNG', p12: 2800, km12: 150, p24: 3500, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'Hyundai Creta', fuel: 'Diesel', p12: 3200, km12: 150, p24: 4500, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'FRONXX', fuel: 'Petrol/CNG', p12: 2500, km12: 150, p24: 3200, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'Venue', fuel: 'Petrol', p12: 2500, km12: 150, p24: 3500, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'S-CROSS', fuel: 'Diesel', p12: 3000, km12: 150, p24: 4000, km24: 300, extraKm: 13, dep: 8000, active: true },
  { category: 'SUV', model: 'THAR', fuel: 'Diesel', p12: 4000, km12: 150, p24: 5000, km24: 300, extraKm: 14, dep: 8000, active: true },
  { category: 'SUV', model: 'Ertiga', fuel: 'Petrol/CNG', p12: 3000, km12: 150, p24: 4000, km24: 300, extraKm: 14, dep: 8000, active: true },
  { category: 'SUV', model: 'SCORPIO S11', fuel: 'Diesel', p12: 4500, km12: 150, p24: 5500, km24: 300, extraKm: 14, dep: 8000, active: true },
  { category: 'SUV', model: 'SCORPIO N', fuel: 'Diesel', p12: 5500, km12: 150, p24: 7500, km24: 300, extraKm: 14, dep: 8000, active: true },
];

async function main() {
  console.log('Clearing old car data...');
  
  await prisma.booking.updateMany({ where: { carId: { not: null } }, data: { carId: null } });
  await prisma.wishlistItem.deleteMany({ where: { carId: { not: null } } });
  await prisma.carPackage.deleteMany({});
  await prisma.car.deleteMany({});

  console.log('Fetching or creating Udaipur city...');
  let city = await prisma.city.findFirst({ where: { name: { equals: 'Udaipur', mode: 'insensitive' } } });
  if (!city) {
    city = await prisma.city.create({ data: { name: 'Udaipur', slug: 'udaipur' } });
  }

  console.log('Inserting new cars...');
  for (const item of data) {
    const parts = item.model.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || item.model;
    
    // Determine seating capacity (rough guess based on category/model)
    let seatingCapacity = 5;
    if (item.model.toLowerCase().includes('ertiga') || item.model.toLowerCase().includes('scorpio') || item.category === 'SUV') {
      seatingCapacity = 7;
    }
    if (item.model.toLowerCase().includes('brezza') || item.model.toLowerCase().includes('creta') || item.model.toLowerCase().includes('venue') || item.model.toLowerCase().includes('s-cross') || item.model.toLowerCase().includes('fronxx') || item.model.toLowerCase().includes('thar')) {
        seatingCapacity = 5;
    }

    const car = await prisma.car.create({
      data: {
        make,
        model,
        category: item.category,
        fuelType: item.fuel,
        transmission: 'Manual Gearbox',
        seatingCapacity,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80',
        availability: item.active,
        cityId: city.id,
        serviceTypes: ['SELF_DRIVE'],
        packages: {
          create: [
            {
              name: '12 Hours',
              type: 'KM',
              basePrice: item.p12,
              limitValue: item.km12,
              extraChargePerUnit: item.extraKm,
              deposit: item.dep,
            },
            {
              name: '24 Hours',
              type: 'KM',
              basePrice: item.p24,
              limitValue: item.km24,
              extraChargePerUnit: item.extraKm,
              deposit: item.dep,
            }
          ]
        }
      }
    });
    console.log(`Created ${car.make} ${car.model}`);
  }

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
