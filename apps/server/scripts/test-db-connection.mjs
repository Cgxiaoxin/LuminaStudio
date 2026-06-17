import { PrismaClient } from '@prisma/client';

const urls = [
  process.env.DATABASE_URL,
  'mysql://root:@localhost:3306/mysql',
  'mysql://root:root@localhost:3306/mysql',
  'mysql://root:123456@localhost:3306/mysql',
  'mysql://root:password@localhost:3306/mysql',
].filter(Boolean);

for (const url of urls) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('OK', url);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.log('FAIL', url, e.message?.slice(0, 100));
    await prisma.$disconnect();
  }
}
process.exit(1);
