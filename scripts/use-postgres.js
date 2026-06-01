const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('✅ DATABASE_URL starts with postgres. Switched Prisma provider to postgresql.');
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('ℹ️ DATABASE_URL is local. Kept/Switched Prisma provider to sqlite.');
}
