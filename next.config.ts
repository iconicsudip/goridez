import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Run database provider conversion dynamically during Next.js initialization
const dbUrl = process.env.DATABASE_URL || '';
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
    if (schema.includes('provider = "sqlite"')) {
      schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, schema, 'utf8');
      console.log('✅ DATABASE_URL is PostgreSQL. Switched Prisma provider to postgresql.');
      execSync('npx prisma generate', { stdio: 'inherit' });
    }
  } else {
    if (schema.includes('provider = "postgresql"')) {
      schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, schema, 'utf8');
      console.log('ℹ️ DATABASE_URL is SQLite. Kept/Switched Prisma provider to sqlite.');
      execSync('npx prisma generate', { stdio: 'inherit' });
    }
  }
} catch (e) {
  console.error('Failed to update prisma provider:', e);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;

// Trigger dev server config reload after schema update

