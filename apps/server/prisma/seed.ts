import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { code: 'lumina-demo' },
    update: {},
    create: {
      name: 'Lumina Demo Studio',
      code: 'lumina-demo',
      brandName: 'LuminaStudio',
      contactPhone: '13800138000',
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'admin' } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      username: 'admin',
      passwordHash,
      role: 'OWNER',
      displayName: 'Studio Admin',
      phone: '13800138000',
    },
  });

  const mainStore = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'MAIN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Main Studio',
      code: 'MAIN',
      address: '123 Fitness Street, Shanghai',
      phone: '13800138000',
    },
  });

  const branchStore = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'BR01' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Branch Studio',
      code: 'BR01',
      address: '456 Yoga Avenue, Shanghai',
      phone: '13900139000',
    },
  });

  const coach = await prisma.adminUser.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'coach1' } },
    update: {},
    create: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      username: 'coach1',
      passwordHash: await bcrypt.hash('coach123', 10),
      role: 'COACH',
      displayName: 'Sarah Chen',
      bio: 'Certified Pilates instructor',
      phone: '13700137000',
    },
  });

  // Delete child records before parents (Payment blocks Order via FK RESTRICT)
  await prisma.ledgerEntry.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.payment.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.booking.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.schedule.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.service.deleteMany({
    where: { tenantId: tenant.id, name: { in: ['Morning Pilates', 'Private Reformer'] } },
  });

  const groupClass = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      coachId: coach.id,
      name: 'Morning Pilates',
      type: 'GROUP_CLASS',
      description: 'Beginner-friendly group pilates session',
      price: 0,
      durationMinutes: 60,
    },
  });

  const paidClass = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      coachId: coach.id,
      name: 'Private Reformer',
      type: 'PRIVATE_SESSION',
      description: 'One-on-one reformer training',
      price: 299,
      durationMinutes: 60,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const paidStart = new Date(tomorrow);
  paidStart.setHours(14, 0, 0, 0);
  const paidEnd = new Date(paidStart);
  paidEnd.setHours(15, 0, 0, 0);

  const freeSchedule = await prisma.schedule.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      serviceId: groupClass.id,
      coachId: coach.id,
      startAt: tomorrow,
      endAt: tomorrowEnd,
      capacity: 2,
      bookedCount: 0,
    },
  });

  const paidSchedule = await prisma.schedule.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      serviceId: paidClass.id,
      coachId: coach.id,
      startAt: paidStart,
      endAt: paidEnd,
      capacity: 1,
      bookedCount: 0,
    },
  });

  const client = await prisma.client.upsert({
    where: { tenantId_openid: { tenantId: tenant.id, openid: 'dev_openid_demo' } },
    update: {},
    create: {
      tenantId: tenant.id,
      openid: 'dev_openid_demo',
      nickname: 'Demo Client',
      phone: '13600136000',
    },
  });

  await prisma.membership.deleteMany({ where: { clientId: client.id } });
  await prisma.membership.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      name: '10-Session Pack',
      type: 'COUNT_BASED',
      totalTimes: 10,
      remainingTimes: 10,
      startedAt: new Date(),
      expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seed complete:', {
    tenantId: tenant.id,
    stores: [mainStore.id, branchStore.id],
    schedules: { free: freeSchedule.id, paid: paidSchedule.id },
    clientId: client.id,
    admin: 'admin / admin123',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
