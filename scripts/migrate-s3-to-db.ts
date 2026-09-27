import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../src/lib/prisma';
import { compressImage } from '../src/lib/compressImage';
import 'dotenv/config';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET as string;

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function s3UrlToDbUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('.amazonaws.com/')) {
    const parts = url.split('.amazonaws.com/');
    const key = parts[1];
    return `/api/uploads/${key}`;
  }
  return url;
}

async function migrateAllS3Objects() {
  console.log('--- STEP 1: Listing all objects from S3 ---');
  let continuationToken: string | undefined = undefined;
  const allObjects: { Key: string; Size?: number }[] = [];

  do {
    const res: any = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    }));
    if (res.Contents) {
      for (const item of res.Contents) {
        if (item.Key) allObjects.push({ Key: item.Key, Size: item.Size });
      }
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`Found ${allObjects.length} objects in S3.`);

  // Filter out large video files from 10KB image compression
  const imageObjects = allObjects.filter(o => !o.Key.endsWith('.MP4') && !o.Key.endsWith('.mp4'));
  console.log(`Found ${imageObjects.length} image objects to migrate to DB.`);

  console.log('--- STEP 2: Downloading, compressing to <= 10KB, and saving in DB ---');
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  // Process with concurrency of 6
  const CONCURRENCY = 6;
  const queue = [...imageObjects];

  async function worker(workerId: number) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      try {
        // Check if already in DB
        const existing = await prisma.uploadedFile.findUnique({
          where: { filename: item.Key },
        });

        // Download from S3
        const getRes = await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET,
          Key: item.Key,
        }));
        const rawBuffer = await streamToBuffer(getRes.Body);
        const originalContentType = getRes.ContentType || 'image/jpeg';

        // Compress to HD (~50KB-80KB, 1200px width)
        const { buffer, contentType } = await compressImage(rawBuffer, originalContentType);

        // Save or update in DB
        await prisma.uploadedFile.upsert({
          where: { filename: item.Key },
          create: {
            filename: item.Key,
            mimeType: contentType,
            data: new Uint8Array(buffer),
            size: buffer.length,
          },
          update: {
            mimeType: contentType,
            data: new Uint8Array(buffer),
            size: buffer.length,
          },
        });

        processed++;
        if (processed % 10 === 0 || queue.length === 0) {
          console.log(`Progress: ${processed} saved to DB (skipped: ${skipped}, remaining: ${queue.length})`);
        }
      } catch (err) {
        errors++;
        console.error(`Error processing ${item.Key}:`, err);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  console.log(`Finished S3 to DB migration: ${processed} processed, ${skipped} skipped, ${errors} errors.`);

  console.log('--- STEP 3: Updating database records referencing S3 to DB URLs ---');

  // 1. Cars
  const cars = await prisma.car.findMany();
  let updatedCars = 0;
  for (const car of cars) {
    let changed = false;
    let newImage = car.image;
    let newGallery = car.gallery;

    if (newImage && newImage.includes('.amazonaws.com/')) {
      newImage = s3UrlToDbUrl(newImage);
      changed = true;
    }

    try {
      const galleryArr = JSON.parse(car.gallery || '[]');
      if (Array.isArray(galleryArr)) {
        const updatedArr = galleryArr.map(u => s3UrlToDbUrl(u));
        const updatedJson = JSON.stringify(updatedArr);
        if (updatedJson !== car.gallery) {
          newGallery = updatedJson;
          changed = true;
        }
      }
    } catch {}

    if (changed) {
      await prisma.car.update({
        where: { id: car.id },
        data: { image: newImage, gallery: newGallery },
      });
      updatedCars++;
    }
  }
  console.log(`Updated ${updatedCars} cars.`);

  // 2. Blogs
  const blogs = await prisma.blog.findMany();
  let updatedBlogs = 0;
  for (const blog of blogs) {
    if (blog.image && blog.image.includes('.amazonaws.com/')) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { image: s3UrlToDbUrl(blog.image) },
      });
      updatedBlogs++;
    }
  }
  console.log(`Updated ${updatedBlogs} blogs.`);

  // 3. Happy Customers
  const happy = await prisma.happyCustomer.findMany();
  let updatedHappy = 0;
  for (const h of happy) {
    if (h.imageUrl && h.imageUrl.includes('.amazonaws.com/')) {
      await prisma.happyCustomer.update({
        where: { id: h.id },
        data: { imageUrl: s3UrlToDbUrl(h.imageUrl) },
      });
      updatedHappy++;
    }
  }
  console.log(`Updated ${updatedHappy} happy customers.`);

  // 4. Cities
  const cities = await prisma.city.findMany();
  let updatedCities = 0;
  for (const c of cities) {
    if (c.banner && c.banner.includes('.amazonaws.com/')) {
      await prisma.city.update({
        where: { id: c.id },
        data: { banner: s3UrlToDbUrl(c.banner) },
      });
      updatedCities++;
    }
  }
  console.log(`Updated ${updatedCities} cities.`);

  // 5. HomePage
  const home = await prisma.homePage.findFirst();
  if (home) {
    const updateData: any = {};
    for (const [key, val] of Object.entries(home)) {
      if (typeof val === 'string' && val.includes('.amazonaws.com/') && !val.endsWith('.MP4') && !val.endsWith('.mp4')) {
        updateData[key] = s3UrlToDbUrl(val);
      }
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.homePage.update({
        where: { id: home.id },
        data: updateData,
      });
      console.log(`Updated HomePage fields:`, Object.keys(updateData));
    }
  }

  // 6. SiteSettings
  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    const updateData: any = {};
    for (const [key, val] of Object.entries(settings)) {
      if (typeof val === 'string' && val.includes('.amazonaws.com/')) {
        updateData[key] = s3UrlToDbUrl(val);
      }
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
      console.log(`Updated SiteSettings fields:`, Object.keys(updateData));
    }
  }

  console.log('✅ ALL S3 images successfully uploaded to DB and references updated!');
}

migrateAllS3Objects()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
