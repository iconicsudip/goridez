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

  console.log('Inserting Delivery Charges...');
  const deliveryData = [
    { category: 'Hatchback', ap: 599, ad: 599, rp: 399, rd: 399 },
    { category: 'Sedan', ap: 599, ad: 599, rp: 449, rd: 449 },
    { category: 'SUV', ap: 699, ad: 699, rp: 499, rd: 499 },
  ];

  await prisma.deliveryCharge.deleteMany({});
  for (const d of deliveryData) {
    await prisma.deliveryCharge.create({
      data: {
        cityId: city.id,
        category: d.category,
        airportPickup: d.ap,
        airportDrop: d.ad,
        railwayPickup: d.rp,
        railwayDrop: d.rd,
        lateNightStart: '22:00',
        lateNightEnd: '06:00',
        notes: 'Maharana Pratap Airport UDR'
      }
    });
    console.log(`Created Delivery Charge for ${d.category}`);
  }

  console.log('Inserting Chauffeur Cars...');
  const chauffeurData = [
    { cat: 'Sedan', model: 'Swift Dzire/Aura/Etios', p4: 2000, p8: 2500, p12: 3000, exKm: 12, exHr: 250, nc: 300, ns: '22:00', ne: '06:00', daDay: 250, daOut: 400, seats: 4 },
    { cat: 'Sedan', model: 'Honda City/Verna', p4: 2500, p8: 3000, p12: 3500, exKm: 14, exHr: 300, nc: 350, ns: '22:00', ne: '06:00', daDay: 250, daOut: 450, seats: 4 },
    { cat: 'SUV', model: 'Ertiga/Romanio', p4: 3000, p8: 3500, p12: 4000, exKm: 16, exHr: 350, nc: 400, ns: '22:00', ne: '06:00', daDay: 300, daOut: 500, seats: 7 },
    { cat: 'SUV', model: 'Innova 2.5', p4: 3500, p8: 4000, p12: 4500, exKm: 18, exHr: 400, nc: 450, ns: '22:00', ne: '06:00', daDay: 300, daOut: 500, seats: 7 },
    { cat: 'Crysta', model: 'Innova Crysta 2.4', p4: 4000, p8: 4500, p12: 5000, exKm: 20, exHr: 450, nc: 550, ns: '22:00', ne: '06:00', daDay: 350, daOut: 600, seats: 7 },
    { cat: 'Crysta', model: 'Innova Crysta 2.8/Hycross', p4: 4500, p8: 5000, p12: 5500, exKm: 22, exHr: 500, nc: 600, ns: '22:00', ne: '06:00', daDay: 350, daOut: 600, seats: 7 },
    { cat: 'Traveller', model: 'Traveller', p4: 5000, p8: 6000, p12: 7000, exKm: 28, exHr: 700, nc: 300, ns: '22:00', ne: '06:00', daDay: 250, daOut: 400, seats: 14 },
    { cat: 'Traveller', model: 'Urbania', p4: 6000, p8: 8000, p12: 10000, exKm: 40, exHr: 1200, nc: 1000, ns: '22:00', ne: '06:00', daDay: 500, daOut: 900, seats: 14 },
    { cat: 'Luxury', model: 'Mercedes E-Class/BMW', p4: 8500, p8: 13000, p12: 17500, exKm: 70, exHr: 1500, nc: 1500, ns: '22:00', ne: '06:00', daDay: 600, daOut: 1200, seats: 4 },
  ];

  for (const item of chauffeurData) {
    const parts = item.model.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || item.model;
    
    const car = await prisma.car.create({
      data: {
        make,
        model,
        category: item.cat,
        fuelType: 'Diesel',
        transmission: item.cat === 'Luxury' ? 'Automatic' : 'Manual',
        seatingCapacity: item.seats,
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80',
        availability: true,
        cityId: city.id,
        serviceTypes: ['WITH_DRIVER', 'TAXI'],
        extraHourCharge: item.exHr,
        nightCharge: item.nc,
        nightChargeStart: item.ns,
        nightChargeEnd: item.ne,
        driverAllowanceDay: item.daDay,
        driverAllowanceOut: item.daOut,
        packages: {
          create: [
            { name: '4 Hours', type: 'KM', basePrice: item.p4, limitValue: 40, extraChargePerUnit: item.exKm, deposit: 0 },
            { name: '8 Hours', type: 'KM', basePrice: item.p8, limitValue: 80, extraChargePerUnit: item.exKm, deposit: 0 },
            { name: '12 Hours', type: 'KM', basePrice: item.p12, limitValue: 120, extraChargePerUnit: item.exKm, deposit: 0 },
          ]
        }
      }
    });
    console.log(`Created Chauffeur ${car.make} ${car.model}`);
  }

  console.log('Inserting Round Trip Routes...');
  await prisma.roundTripRoute.deleteMany({});
  
  const roundTripRoutes = [
    { route: 'Udaipur-Kumbhalgarh-Ranakpur', dist: 150, s1: 3600, s2: 7200, s3: 10800, v1: 5500, v2: 10900, v3: 16300, c1: 6000, c2: 12000, c3: 18000, l1: 12000, l2: 24000, l3: 36000, na: 500 },
    { route: 'Udaipur-Chittorgarh', dist: 130, s1: 3600, s2: 7200, s3: 10800, v1: 5500, v2: 10900, v3: 16300, c1: 6000, c2: 12000, c3: 18000, l1: 12000, l2: 24000, l3: 36000, na: 500 },
    { route: 'Udaipur-Mount Abu', dist: 175, s1: 4800, s2: 8400, s3: 12000, v1: 7200, v2: 12600, v3: 18000, c1: 8000, c2: 14000, c3: 20000, l1: 20000, l2: 32000, l3: 44000, na: 500 },
    { route: 'Udaipur-Jodhpur', dist: 265, s1: 7200, s2: 10800, s3: 14400, v1: 11500, v2: 16900, v3: 22300, c1: 13500, c2: 19500, c3: 25500, l1: 28000, l2: 40000, l3: 52000, na: 600 },
    { route: 'Udaipur-Jaipur', dist: 415, s1: 10500, s2: 14100, s3: 17700, v1: 15000, v2: 20400, v3: 25800, c1: 16000, c2: 22000, c3: 28000, l1: 34000, l2: 46000, l3: 58000, na: 700 },
    { route: 'Udaipur-Ranakpur', dist: 104, s1: 3300, s2: 6900, s3: 10500, v1: 5000, v2: 10400, v3: 15800, c1: 5500, c2: 11500, c3: 17500, l1: 9000, l2: 21000, l3: 33000, na: 500 },
    { route: 'Udaipur-Nathdwara-Eklingji', dist: 65, s1: 3300, s2: 6900, s3: 10500, v1: 5000, v2: 10400, v3: 15800, c1: 5500, c2: 11500, c3: 17500, l1: 9000, l2: 21000, l3: 33000, na: 400 },
  ];

  for (const rt of roundTripRoutes) {
    await prisma.roundTripRoute.create({
      data: {
        cityId: city.id,
        routeTitle: rt.route,
        distanceKm: rt.dist,
        sedan1D: rt.s1, sedan2D: rt.s2, sedan3D: rt.s3,
        suv1D: rt.v1, suv2D: rt.v2, suv3D: rt.v3,
        crysta1D: rt.c1, crysta2D: rt.c2, crysta3D: rt.c3,
        luxury1D: rt.l1, luxury2D: rt.l2, luxury3D: rt.l3,
        nightAllowance: rt.na
      }
    });
    console.log(`Created Route ${rt.route}`);
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
