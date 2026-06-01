import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Production Database Seeding (Safe Mode)...');

  // 1. Upsert Default Admin User
  const adminEmail = 'admin@goridezz.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin GoRidezz',
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        phone: '+91 98000 00001'
      }
    });
    console.log('✅ Default admin user created (admin@goridezz.com / admin123)');
  } else {
    console.log('ℹ️ Admin user already exists, skipping...');
  }

  // 2. Upsert Pricing Rules
  const ruleCount = await prisma.pricingRule.count();
  if (ruleCount === 0) {
    await prisma.pricingRule.create({
      data: { weekendMarkup: 15, festivalSurge: 30, dynamicSurgeActive: true }
    });
    console.log('✅ Pricing rules initialized');
  } else {
    console.log('ℹ️ Pricing rules already exist, skipping...');
  }

  // 3. Upsert Global Package Tiers (checking by name)
  const tiers = [
    { name: '12 Hours Limit Package', type: 'HOURS', basePricingInfo: 'Standard Base Pricing', limitInfo: '150 KM included limit' },
    { name: '24 Hours Limit Package', type: 'HOURS', basePricingInfo: 'Standard 24H Daily Loop', limitInfo: '300 KM included limit' },
    { name: '120 KM Distance Tier',  type: 'KM',    basePricingInfo: '120 KM ceiling cap',    limitInfo: 'Unlimited hours (max 24)' },
    { name: '250 KM Distance Tier',  type: 'KM',    basePricingInfo: '250 KM premium range',  limitInfo: 'Extra ₹50/km thereafter' },
    { name: '350 KM Distance Tier',  type: 'KM',    basePricingInfo: '350 KM long haul',      limitInfo: 'Extra ₹60/km thereafter' },
    { name: 'Airport Transfer',      type: 'TRANSFER', basePricingInfo: 'One-way flat rate',  limitInfo: 'Fixed airport run' },
    { name: 'Custom Package',        type: 'CUSTOM', basePricingInfo: 'Dynamic scaling',      limitInfo: 'Surcharges dynamically preloaded' },
  ];
  for (const tier of tiers) {
    const exists = await prisma.globalPackageTier.findFirst({ where: { name: tier.name } });
    if (!exists) {
      await prisma.globalPackageTier.create({ data: tier });
    }
  }
  console.log('✅ Global package tiers checked/seeded');

  // 4. Upsert Cities (checking by unique name)
  const cities = [
    { name: 'Udaipur', slug: '/self-drive-cars-in-udaipur', faqQuestion: 'Is pickup available at Udaipur airport?', faqAnswer: 'Yes, we provide premium airport pickup directly at Maharana Pratap Airport with zero waiting time.' },
    { name: 'Jaipur', slug: '/self-drive-cars-in-jaipur', faqQuestion: 'Do you offer one-way drops from Jaipur to Udaipur?', faqAnswer: 'Absolutely. One-way intercity drops are available at a flat premium rate with GPS-tracked vehicles.' },
    { name: 'Jodhpur', slug: '/self-drive-cars-in-jodhpur', faqQuestion: 'Can I pick up a car near Jodhpur Railway Station?', faqAnswer: 'Yes, we have a delivery point within 1 km of Jodhpur Railway Station for all bookings.' },
    { name: 'Mount Abu', slug: '/self-drive-cars-in-mount-abu', faqQuestion: 'Do you deliver vehicles to Mount Abu hill station?', faqAnswer: 'Yes, we deliver vehicles to Mount Abu with hill-terrain-ready SUVs available on request.' }
  ];
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: {},
      create: city
    });
  }
  console.log('✅ Default cities upserted');

  // 5. Upsert About Page Settings
  await prisma.aboutPage.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
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
  console.log('✅ About page settings initialized/upserted');

  // 6. Upsert Default FAQs (checking by question)
  const faqs = [
    { question: "What documents are required to book a self-drive car?", answer: "You need a valid Driving License (held for at least 2 years), a government-approved Photo ID (Aadhar Card, Passport, etc.), and a matching Credit/Debit card for the security deposit.", isActive: true },
    { question: "Is there a security deposit required for booking a self-drive vehicle?", answer: "Yes, a security deposit starting from ₹3,000 to ₹15,000 (depending on the vehicle class) is charged at checkout. This is fully refunded within 24–48 hours of vehicle return if no new damages are identified.", isActive: true },
    { question: "Are fuel charges included in the booking price?", answer: "By default, fuel charges are not included. The vehicle is provided with a full tank (or a specific fuel level) and must be returned with the same level. Any fuel shortfall will be charged at actual rate plus a small service fee.", isActive: true },
    { question: "Can I cancel my reservation or request a refund?", answer: "Yes, cancellations made at least 48 hours before the trip start time are eligible for a full refund. Cancellations between 24 and 48 hours receive a 50% refund. No refunds are processed for cancellations under 24 hours.", isActive: true },
    { question: "Do you provide professional chauffeur-driven cars?", answer: "Yes, we offer a dedicated Chauffeur Service option for all our premium vehicles. Chauffeur services include zero security deposit requirements and professional drivers fluent in local routes.", isActive: true },
    { question: "Can I extend my booking period mid-journey?", answer: "Extensions are permitted subject to vehicle availability. Please request extensions via your User Dashboard or contact our 24x7 support desk at least 4 hours before your scheduled drop-off time.", isActive: true }
  ];
  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!exists) {
      await prisma.fAQ.create({ data: faq });
    }
  }
  console.log('✅ Default FAQs checked/seeded');

  console.log('🎉 Production Seeding Complete! Safe initialization finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Production Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
