import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing database...');
  await prisma.wishlistItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.carPackage.deleteMany();
  await prisma.car.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.villa.deleteMany();
  await prisma.city.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  await prisma.globalPackageTier.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.aboutPage.deleteMany();


  // ─────────────────────────────────────────
  // PRICING RULES & GLOBAL TIERS
  // ─────────────────────────────────────────
  console.log('💰 Seeding Global Pricing & Tiers...');
  await prisma.pricingRule.create({
    data: { weekendMarkup: 15, festivalSurge: 30, dynamicSurgeActive: true }
  });

  await prisma.globalPackageTier.createMany({
    data: [
      { name: '12 Hours Limit Package', type: 'HOURS', basePricingInfo: 'Standard Base Pricing', limitInfo: '150 KM included limit' },
      { name: '24 Hours Limit Package', type: 'HOURS', basePricingInfo: 'Standard 24H Daily Loop', limitInfo: '300 KM included limit' },
      { name: '120 KM Distance Tier',  type: 'KM',    basePricingInfo: '120 KM ceiling cap',    limitInfo: 'Unlimited hours (max 24)' },
      { name: '250 KM Distance Tier',  type: 'KM',    basePricingInfo: '250 KM premium range',  limitInfo: 'Extra ₹50/km thereafter' },
      { name: '350 KM Distance Tier',  type: 'KM',    basePricingInfo: '350 KM long haul',      limitInfo: 'Extra ₹60/km thereafter' },
      { name: 'Airport Transfer',      type: 'TRANSFER', basePricingInfo: 'One-way flat rate',  limitInfo: 'Fixed airport run' },
      { name: 'Custom Package',        type: 'CUSTOM', basePricingInfo: 'Dynamic scaling',      limitInfo: 'Surcharges dynamically preloaded' },
    ]
  });

  // ─────────────────────────────────────────
  // CITIES
  // ─────────────────────────────────────────
  console.log('🌆 Seeding Cities...');
  const udaipur = await prisma.city.create({
    data: {
      name: 'Udaipur',
      slug: '/self-drive-cars-in-udaipur',
      faqQuestion: 'Is pickup available at Udaipur airport?',
      faqAnswer: 'Yes, we provide premium airport pickup directly at Maharana Pratap Airport with zero waiting time.'
    }
  });
  const jaipur = await prisma.city.create({
    data: {
      name: 'Jaipur',
      slug: '/self-drive-cars-in-jaipur',
      faqQuestion: 'Do you offer one-way drops from Jaipur to Udaipur?',
      faqAnswer: 'Absolutely. One-way intercity drops are available at a flat premium rate with GPS-tracked vehicles.'
    }
  });
  const jodhpur = await prisma.city.create({
    data: {
      name: 'Jodhpur',
      slug: '/self-drive-cars-in-jodhpur',
      faqQuestion: 'Can I pick up a car near Jodhpur Railway Station?',
      faqAnswer: 'Yes, we have a delivery point within 1 km of Jodhpur Railway Station for all bookings.'
    }
  });
  const mount_abu = await prisma.city.create({
    data: {
      name: 'Mount Abu',
      slug: '/self-drive-cars-in-mount-abu',
      faqQuestion: 'Do you deliver vehicles to Mount Abu hill station?',
      faqAnswer: 'Yes, we deliver vehicles to Mount Abu with hill-terrain-ready SUVs available on request.'
    }
  });

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  console.log('👤 Seeding Users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword  = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin GoRidezz', email: 'admin@goridezz.com', password: adminPassword, role: 'ADMIN', phone: '+91 98000 00001' }
  });
  const user1 = await prisma.user.create({
    data: { name: 'Tanweer Roy', email: 'tanweer.ws7657@gmail.com', password: userPassword, phone: '+91 94567 12345', role: 'USER' }
  });
  const user2 = await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'priya.sharma@example.com', password: userPassword, phone: '+91 98765 43210', role: 'USER' }
  });
  const user3 = await prisma.user.create({
    data: { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', password: userPassword, phone: '+91 91234 56789', role: 'USER' }
  });

  // ─────────────────────────────────────────
  // VEHICLES + PACKAGES
  // ─────────────────────────────────────────
  console.log('🚗 Seeding Cars & Packages...');

  const car1 = await prisma.car.create({
    data: {
      make: 'Mercedes-Benz', model: 'S-Class', category: 'Luxury Class',
      fuelType: 'Petrol', transmission: 'Automatic Gearbox', seatingCapacity: 4,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: udaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 14000, deposit: 15000, limitValue: 120, extraChargePerUnit: 50 },
          { type: 'KM', name: '24 Hours', basePrice: 20000, deposit: 15000, limitValue: 250, extraChargePerUnit: 60 }
        ]
      }
    }
  });

  const car2 = await prisma.car.create({
    data: {
      make: 'BMW', model: '5 Series', category: 'Luxury Class',
      fuelType: 'Diesel', transmission: 'Automatic Gearbox', seatingCapacity: 4,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: jaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 12000, deposit: 10000, limitValue: 120, extraChargePerUnit: 45 },
          { type: 'KM', name: '24 Hours', basePrice: 20000, deposit: 10000, limitValue: 250, extraChargePerUnit: 55 }
        ]
      }
    }
  });

  const car3 = await prisma.car.create({
    data: {
      make: 'Toyota', model: 'Innova Crysta', category: 'Innova',
      fuelType: 'Diesel', transmission: 'Manual Gearbox', seatingCapacity: 7,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: udaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 6000, deposit: 5000, limitValue: 120, extraChargePerUnit: 30 },
          { type: 'KM', name: '24 Hours', basePrice: 9500, deposit: 5000, limitValue: 250, extraChargePerUnit: 35 }
        ]
      }
    }
  });

  const car4 = await prisma.car.create({
    data: {
      make: 'Mahindra', model: 'Thar Roxx', category: 'SUV',
      fuelType: 'Diesel', transmission: 'Automatic Gearbox', seatingCapacity: 4,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: jodhpur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 4500, deposit: 4000, limitValue: 120, extraChargePerUnit: 28 },
          { type: 'KM', name: '24 Hours', basePrice: 7500, deposit: 4000, limitValue: 250, extraChargePerUnit: 32 }
        ]
      }
    }
  });

  const car5 = await prisma.car.create({
    data: {
      make: 'Range Rover', model: 'Velar', category: 'Luxury Class',
      fuelType: 'Petrol', transmission: 'Automatic Gearbox', seatingCapacity: 5,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: udaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 15000, deposit: 12000, limitValue: 120, extraChargePerUnit: 55 },
          { type: 'KM', name: '24 Hours', basePrice: 25000, deposit: 12000, limitValue: 250, extraChargePerUnit: 65 }
        ]
      }
    }
  });

  const car6 = await prisma.car.create({
    data: {
      make: 'Toyota', model: 'Fortuner', category: 'SUV',
      fuelType: 'Diesel', transmission: 'Automatic Gearbox', seatingCapacity: 7,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: jaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 7500, deposit: 6000, limitValue: 120, extraChargePerUnit: 35 },
          { type: 'KM', name: '24 Hours', basePrice: 13000, deposit: 6000, limitValue: 250, extraChargePerUnit: 40 }
        ]
      }
    }
  });

  const car7 = await prisma.car.create({
    data: {
      make: 'Hyundai', model: 'Creta', category: 'SUV',
      fuelType: 'Petrol', transmission: 'Automatic Gearbox', seatingCapacity: 5,
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: mount_abu.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 3200, deposit: 3000, limitValue: 120, extraChargePerUnit: 20 },
          { type: 'KM', name: '24 Hours', basePrice: 5500, deposit: 3000, limitValue: 250, extraChargePerUnit: 25 }
        ]
      }
    }
  });

  const car8 = await prisma.car.create({
    data: {
      make: 'Audi', model: 'A6', category: 'Luxury Class',
      fuelType: 'Petrol', transmission: 'Automatic Gearbox', seatingCapacity: 4,
      image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80',
      availability: true, cityId: jaipur.id,
      packages: {
        create: [
          { type: 'KM', name: '12 Hours', basePrice: 9000, deposit: 10000, limitValue: 120, extraChargePerUnit: 42 },
          { type: 'KM', name: '24 Hours', basePrice: 17000, deposit: 10000, limitValue: 250, extraChargePerUnit: 50 }
        ]
      }
    }
  });

  // ─────────────────────────────────────────
  // TOURS
  // ─────────────────────────────────────────
  console.log('🗺️  Seeding Tours...');

  const tour1 = await prisma.tour.create({
    data: {
      title: 'Royal Rajasthan Heritage Circuit',
      description: 'Embark on a majestic 5-day odyssey through the forts, palaces, and timeless lakes of Udaipur, Jodhpur, and Jaipur. Curated for the discerning traveller.',
      adultPrice: 45000, childPrice: 20000, duration: 5,
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrival in Udaipur', description: 'Check-in at heritage hotel. Evening boat ride on Lake Pichola.' },
        { day: 2, title: 'City Palace & Sajjangarh', description: 'Full day tour of City Palace Museum and Monsoon Palace sunset.' },
        { day: 3, title: 'Drive to Jodhpur', description: 'Scenic drive. Visit Mehrangarh Fort and Jaswant Thada.' },
        { day: 4, title: 'Jodhpur Blue City Walk', description: 'Old city walking tour. Sardar Market shopping. Sunset at Rao Jodha Desert Rock Park.' },
        { day: 5, title: 'Fly/Drive to Jaipur & Departure', description: 'Visit Amber Fort en route. Airport drop.' },
      ]),
      included: JSON.stringify(['AC Vehicle Transfers', 'Heritage Hotel Stay (4 Nights)', 'Daily Breakfast', 'Licensed Guide', 'Monument Entry Fees', 'Boat Ride Lake Pichola']),
      excluded: JSON.stringify(['Airfare', 'Lunch & Dinner', 'Personal Expenses', 'Tips']),
      cityId: udaipur.id
    }
  });

  const tour2 = await prisma.tour.create({
    data: {
      title: 'Desert Dunes & Camel Safari',
      description: 'A 3-day escape into the golden sands of the Thar Desert. Experience sunrise camel treks, dune bashing, and overnight camp under a blanket of stars.',
      adultPrice: 22000, childPrice: 10000, duration: 3,
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Jodhpur to Jaisalmer', description: 'Drive through the desert highway. Check in to luxury desert camp.' },
        { day: 2, title: 'Sunrise Camel Trek & Dune Bashing', description: 'Early morning camel ride to the dunes. ATV dune bashing in afternoon. Cultural evening with folk music.' },
        { day: 3, title: 'Jaisalmer Fort & Return', description: 'Morning Jaisalmer Fort tour. Return journey with drop-off.' },
      ]),
      included: JSON.stringify(['Luxury Camp Stay', 'All Meals in Camp', 'Camel Safari', 'ATV Dune Bashing', 'Cultural Performance', 'AC Vehicle Transfers']),
      excluded: JSON.stringify(['Airfare', 'Alcoholic Beverages', 'Personal Shopping']),
      cityId: jodhpur.id
    }
  });

  const tour3 = await prisma.tour.create({
    data: {
      title: 'Pink City Splendour — Jaipur Weekend',
      description: 'A curated 2-day premium weekend escape to Jaipur. Amber Fort, Hawa Mahal, Jantar Mantar, and the finest local cuisine await.',
      adultPrice: 15000, childPrice: 7000, duration: 2,
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Amber Fort & Jal Mahal', description: 'Elephant ride at Amber Fort. Jal Mahal photography. Evening Chokhi Dhani cultural dinner.' },
        { day: 2, title: 'City Palace & Hawa Mahal', description: 'City Palace guided tour. Hawa Mahal. Jantar Mantar UNESCO site. Johari Bazaar gem shopping.' },
      ]),
      included: JSON.stringify(['Boutique Hotel Stay (1 Night)', 'Breakfast', 'Licensed Guide', 'All Monument Entries', 'Cultural Dinner']),
      excluded: JSON.stringify(['Airfare', 'Lunch', 'Personal Expenses']),
      cityId: jaipur.id
    }
  });

  const tour4 = await prisma.tour.create({
    data: {
      title: 'Mount Abu Hill Retreat',
      description: 'Escape to Rajasthan\'s only hill station. Lush forests, Dilwara Temples, Nakki Lake boating, and misty mountain sunsets — a 3-day serene getaway.',
      adultPrice: 18000, childPrice: 8500, duration: 3,
      image: 'https://images.unsplash.com/photo-1594750852563-5ed8b5059c98?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1594750852563-5ed8b5059c98?auto=format&fit=crop&w=800&q=80',
      ]),
      itinerary: JSON.stringify([
        { day: 1, title: 'Arrive in Mount Abu', description: 'Nakki Lake boat ride. Sunset Point evening.' },
        { day: 2, title: 'Dilwara Temples & Wildlife', description: 'Dilwara Jain Temples full tour. Mount Abu Wildlife Sanctuary jeep safari.' },
        { day: 3, title: 'Guru Shikhar & Departure', description: 'Guru Shikhar — highest peak of Aravalli. Return journey.' },
      ]),
      included: JSON.stringify(['Mountain Resort Stay (2 Nights)', 'Breakfast & Dinner', 'Jeep Safari', 'Guide', 'Entry Fees']),
      excluded: JSON.stringify(['Airfare', 'Lunch', 'Personal Purchases']),
      cityId: mount_abu.id
    }
  });

  // ─────────────────────────────────────────
  // VILLAS
  // ─────────────────────────────────────────
  console.log('🏡 Seeding Villas...');

  const villa1 = await prisma.villa.create({
    data: {
      name: 'Aravalli Grande Palace',
      description: 'A majestic lakefront heritage property with 8 opulent suites, a private infinity pool overlooking Lake Pichola, and a dedicated butler service.',
      location: 'Lake Pichola, Udaipur',
      startingPrice: 24000,
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Private Infinity Pool', 'Lake View Terrace', 'Butler Service', 'Heritage Architecture', 'Private Dining', 'Spa & Wellness', 'Bonfire Area', 'Concierge 24/7', 'Helipad']),
      roomTypes: JSON.stringify([
        { name: 'Lake View Suite', maxOccupancy: 2, price: 24000 },
        { name: 'Royal Heritage Suite', maxOccupancy: 3, price: 32000 },
        { name: 'Grand Palace Wing', maxOccupancy: 6, price: 55000 },
      ]),
      occupancy: 8, cityId: udaipur.id
    }
  });

  const villa2 = await prisma.villa.create({
    data: {
      name: 'Blue City Haveli Estate',
      description: 'An authentic 18th-century Marwari haveli in the heart of the Blue City. Converted into a luxury 6-bedroom villa with rooftop views of Mehrangarh Fort.',
      location: 'Old City, Jodhpur',
      startingPrice: 16500,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Fort View Rooftop', 'Private Courtyard Pool', 'Chef on Request', 'Heritage Interiors', 'Air Conditioning', 'Wi-Fi', 'Bonfire & BBQ', 'Museum-Quality Antiques']),
      roomTypes: JSON.stringify([
        { name: 'Haveli Suite', maxOccupancy: 2, price: 16500 },
        { name: 'Fort View Premium', maxOccupancy: 2, price: 21000 },
        { name: 'Entire Haveli', maxOccupancy: 12, price: 75000 },
      ]),
      occupancy: 12, cityId: jodhpur.id
    }
  });

  const villa3 = await prisma.villa.create({
    data: {
      name: 'Amer Hill Villa',
      description: 'A private 4-bedroom contemporary villa nestled in the hills above Amer, Jaipur. Panoramic Amber Fort views, a private chef, and designer interiors.',
      location: 'Amer, Jaipur',
      startingPrice: 19000,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Private Pool', 'Fort View Terrace', 'Private Chef', 'Home Theatre', 'Gym', 'Wi-Fi 5G', 'Jacuzzi', 'Airport Pickup']),
      roomTypes: JSON.stringify([
        { name: 'Garden Room', maxOccupancy: 2, price: 19000 },
        { name: 'Fort View Master Suite', maxOccupancy: 2, price: 25000 },
        { name: 'Entire Villa', maxOccupancy: 8, price: 68000 },
      ]),
      occupancy: 8, cityId: jaipur.id
    }
  });

  const villa4 = await prisma.villa.create({
    data: {
      name: 'Sunset Ridge Mount Abu Villa',
      description: 'A cosy 3-bedroom luxury villa perched on the edge of the Aravalli hills in Mount Abu. Perfect for a quiet retreat with panoramic valley views and a bonfire terrace.',
      location: 'Sunset Point Area, Mount Abu',
      startingPrice: 11000,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Valley View Balcony', 'Bonfire Terrace', 'Fireplace', 'Netflix & Chill Room', 'Hammock Garden', 'Daily Housekeeping', 'Wi-Fi']),
      roomTypes: JSON.stringify([
        { name: 'Valley View Room', maxOccupancy: 2, price: 11000 },
        { name: 'Entire Villa', maxOccupancy: 6, price: 28000 },
      ]),
      occupancy: 6, cityId: mount_abu.id
    }
  });

  // ─────────────────────────────────────────
  // BOOKINGS
  // ─────────────────────────────────────────
  console.log('📅 Seeding Bookings...');
  const d = (daysFromNow: number) => {
    const d = new Date(); d.setDate(d.getDate() + daysFromNow); return d;
  };

  await prisma.booking.createMany({
    data: [
      {
        userId: user1.id, type: 'CAR', carId: car1.id,
        startDate: d(2), endDate: d(4),
        totalAmount: 28000, advancePaid: 8400, remainingAmount: 19600, depositAmount: 15000,
        status: 'CONFIRMED', depositStatus: 'PAID'
      },
      {
        userId: user1.id, type: 'VILLA', villaId: villa1.id,
        startDate: d(10), endDate: d(13),
        totalAmount: 72000, advancePaid: 21600, remainingAmount: 50400, depositAmount: 25000,
        status: 'CONFIRMED', depositStatus: 'PAID'
      },
      {
        userId: user2.id, type: 'TOUR', tourId: tour1.id,
        startDate: d(5), endDate: d(10),
        totalAmount: 45000, advancePaid: 13500, remainingAmount: 31500, depositAmount: 0,
        status: 'PENDING', depositStatus: 'PENDING'
      },
      {
        userId: user2.id, type: 'CAR', carId: car3.id,
        startDate: d(1), endDate: d(2),
        totalAmount: 5500, advancePaid: 5500, remainingAmount: 0, depositAmount: 5000,
        status: 'CONFIRMED', depositStatus: 'PAID'
      },
      {
        userId: user3.id, type: 'TOUR', tourId: tour2.id,
        startDate: d(15), endDate: d(18),
        totalAmount: 22000, advancePaid: 6600, remainingAmount: 15400, depositAmount: 0,
        status: 'CONFIRMED', depositStatus: 'PENDING'
      },
      {
        userId: user3.id, type: 'VILLA', villaId: villa2.id,
        startDate: d(20), endDate: d(24),
        totalAmount: 66000, advancePaid: 19800, remainingAmount: 46200, depositAmount: 20000,
        status: 'PENDING', depositStatus: 'PENDING'
      },
    ]
  });

  // ─────────────────────────────────────────
  // WISHLISTS
  // ─────────────────────────────────────────
  console.log('❤️  Seeding Wishlists...');
  await prisma.wishlistItem.createMany({
    data: [
      { userId: user1.id, type: 'CAR',   carId: car2.id },
      { userId: user1.id, type: 'TOUR',  tourId: tour1.id },
      { userId: user1.id, type: 'VILLA', villaId: villa3.id },
      { userId: user2.id, type: 'CAR',   carId: car5.id },
      { userId: user2.id, type: 'VILLA', villaId: villa1.id },
      { userId: user3.id, type: 'TOUR',  tourId: tour3.id },
      { userId: user3.id, type: 'CAR',   carId: car6.id },
    ]
  });

  // ─────────────────────────────────────────
  // BLOGS
  // ─────────────────────────────────────────
  console.log('✍️  Seeding Blogs...');
  await prisma.blog.createMany({
    data: [
      {
        title: "Navigating Kumbalgarh Fort via Scenic Mountain Passes in Brezza",
        slug: "navigating-kumbalgarh-fort-via-scenic-mountain-passes-in-brezza",
        category: "Travel Guide",
        content: "<h2>The Majesty of Kumbalgarh</h2><p>Kumbalgarh Fort is a Mewar fortress on the westerly range of Aravalli Hills, in the Rajsamand district near Udaipur in Rajasthan state in western India. It is a World Heritage Site included in Hill Forts of Rajasthan.</p><h2>The Route and Drive</h2><p>Driving to Kumbalgarh in a compact SUV like the Vitara Brezza offers the perfect balance of ground clearance and fuel efficiency. The narrow mountain passes require absolute focus. Ensure your brakes are in prime condition before starting this route.</p>",
        isDraft: false
      },
      {
        title: "Luxury Stays in Mewar: The Definitive Guide to Lakefront Havelis",
        slug: "luxury-stays-in-mewar-the-definitive-guide-to-lakefront-havelis",
        category: "Luxury Stays",
        content: "<h2>Unveiling Mewar's Finest Stays</h2><p>Rajasthan is known for its incredible heritage, and Udaipur stands as the jewel of Mewar. Experiencing it from a lakefront haveli is a bucket-list journey.</p><h2>Top Picks</h2><ul><li><strong>Aravalli Grande Palace</strong>: Infinity pool and helipad capabilities.</li><li><strong>Blue City Haveli Estate</strong>: Nestled under Mehrangarh's shadows in Jodhpur.</li></ul>",
        isDraft: false
      },
      {
        title: "Technical Driving: Master the Tight Hairpins of Mount Abu",
        slug: "technical-driving-master-the-tight-hairpins-of-mount-abu",
        category: "Technical Driving",
        content: "<h2>Conquering the Ascent</h2><p>Mount Abu is a popular hill station in the Aravalli Range in Sirohi district of Rajasthan state. Climbing up to the plateau requires understanding engine braking and correct gear synchronization.</p>",
        isDraft: false
      }
    ]
  });

  // ─────────────────────────────────────────
  // FAQS
  // ─────────────────────────────────────────
  console.log('❓ Seeding FAQs...');
  await prisma.fAQ.createMany({
    data: [
      {
        question: "What documents are required to book a self-drive car?",
        answer: "You need a valid Driving License (held for at least 2 years), a government-approved Photo ID (Aadhar Card, Passport, etc.), and a matching Credit/Debit card for the security deposit.",
        isActive: true
      },
      {
        question: "Is there a security deposit required for booking a self-drive vehicle?",
        answer: "Yes, a security deposit starting from ₹3,000 to ₹15,000 (depending on the vehicle class) is charged at checkout. This is fully refunded within 24–48 hours of vehicle return if no new damages are identified.",
        isActive: true
      },
      {
        question: "Are fuel charges included in the booking price?",
        answer: "By default, fuel charges are not included. The vehicle is provided with a full tank (or a specific fuel level) and must be returned with the same level. Any fuel shortfall will be charged at actual rate plus a small service fee.",
        isActive: true
      },
      {
        question: "Can I cancel my reservation or request a refund?",
        answer: "Yes, cancellations made at least 48 hours before the trip start time are eligible for a full refund. Cancellations between 24 and 48 hours receive a 50% refund. No refunds are processed for cancellations under 24 hours.",
        isActive: true
      },
      {
        question: "Do you provide professional chauffeur-driven cars?",
        answer: "Yes, we offer a dedicated Chauffeur Service option for all our premium vehicles. Chauffeur services include zero security deposit requirements and professional drivers fluent in local routes.",
        isActive: true
      },
      {
        question: "Can I extend my booking period mid-journey?",
        answer: "Extensions are permitted subject to vehicle availability. Please request extensions via your User Dashboard or contact our 24x7 support desk at least 4 hours before your scheduled drop-off time.",
        isActive: true
      }
    ]
  });

  // ─────────────────────────────────────────
  // ABOUT PAGE
  // ─────────────────────────────────────────
  console.log('📖 Seeding About Page...');
  await prisma.aboutPage.create({
    data: {
      id: 'singleton',
      title: 'About GoRidez',
      subtitle: 'Premium Car Rentals & Excursions in Rajasthan',
      content: `
        <p class="text-white/60 mb-6 leading-relaxed">
          Welcome to GoRidez, the leading premium transportation and luxury experience partner in Rajasthan. Headquartered in Udaipur, we provide travel solutions built specifically for international travelers and local connoisseurs.
        </p>
        <p class="text-white/60 mb-6 leading-relaxed">
          Whether you are exploring the magnificent forts of Jaipur, traversing the blue streets of Jodhpur, or spending a peaceful weekend in the cool hills of Mount Abu, our vetted fleet of self-drive vehicles, professional chauffeur desk, and private villas are ready to elevate your journey.
        </p>
        <h2 class="text-2xl font-black uppercase tracking-tight text-white mt-8 mb-4">Our Vision</h2>
        <p class="text-white/60 mb-6 leading-relaxed">
          To build a seamless, reliable, and premium transportation ecosystem across India, driven by elite hospitality and verified standards.
        </p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=80'
    }
  });

  console.log('\n✅ Seeding Complete! Database is fully loaded. 🎉\n');
  console.log('   Admin login: admin@goridezz.com  / admin123');
  console.log('   User  login: tanweer.ws7657@gmail.com / user123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
