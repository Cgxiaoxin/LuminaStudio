import { PrismaClient } from '@prisma/client';

const adminUrl = process.env.DATABASE_URL?.replace(/\/[^/?]+(\?|$)/, '/mysql$1')
  ?? 'mysql://root:123789@localhost:3306/mysql';

const prisma = new PrismaClient({ datasources: { db: { url: adminUrl } } });

try {
  await prisma.$executeRawUnsafe('CREATE DATABASE IF NOT EXISTS luminastudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('Database luminastudio ready');
} finally {
  await prisma.$disconnect();
}
