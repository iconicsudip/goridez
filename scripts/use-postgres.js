const fs = require('fs');
const path = require('path');

// 1. Try to read DATABASE_URL from shell environment first
let dbUrl = process.env.DATABASE_URL || '';

// 2. If not defined in shell, try to load it from local .env file
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match && match[1]) {
      // Shell variables generally take precedence, but if the local .env has a value,
      // Next.js will load it. Let's align with the active value.
      dbUrl = match[1];
    }
  }
} catch (e) {
  // Ignore read errors
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('✅ DATABASE_URL is PostgreSQL. Switched Prisma provider to postgresql.');
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('ℹ️ DATABASE_URL is SQLite. Kept/Switched Prisma provider to sqlite.');
}
