import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogs = [
  {
    title: 'Top 10 Places to Visit in Udaipur',
    slug: 'top-10-places-udaipur',
    category: 'Travel Guide',
    content: '<p>Udaipur, the City of Lakes, is a crown jewel of Rajasthan. From the majestic City Palace to the serene Lake Pichola, every corner tells a story. When you book a luxury car with GoRidez, you can explore these sites with unparalleled comfort and style.</p><h3>1. City Palace</h3><p>A magnificent blend of Rajasthani and Mughal architecture.</p><h3>2. Lake Pichola</h3><p>Enjoy a sunset boat ride with a view of the Taj Lake Palace.</p>',
    isDraft: false,
  },
  {
    title: 'Why Rent a Luxury SUV for Your Rajasthan Tour?',
    slug: 'rent-luxury-suv-rajasthan',
    category: 'Fleet',
    content: '<p>When exploring the vast landscapes of Rajasthan, comfort is key. A luxury SUV offers the perfect combination of space, power, and elegance. Whether you are driving through the Thar desert or the Aravalli hills, our fleet ensures a smooth and regal journey.</p>',
    isDraft: false,
  },
  {
    title: 'The Ultimate Guide to Luxury Villa Stays',
    slug: 'luxury-villa-stays',
    category: 'Accommodation',
    content: '<p>Experience true royalty by staying in one of our handpicked luxury villas. Equipped with private pools, personal chefs, and stunning views, our villas provide the perfect escape from the bustling city life.</p>',
    isDraft: false,
  }
];

async function main() {
  console.log('Seeding blogs...');
  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    });
  }
  console.log('Blogs seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
