import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { generateOrderNo } from '../src/modules/orders/order-number.util';

async function syncScheduleBookedCounts(tenantId: number) {
  const counts = await prisma.booking.groupBy({
    by: ['scheduleId'],
    where: {
      tenantId,
      status: { notIn: ['CANCELED'] },
    },
    _count: { _all: true },
  });

  const schedules = await prisma.schedule.findMany({ where: { tenantId } });
  for (const schedule of schedules) {
    const bookedCount = counts.find((c) => c.scheduleId === schedule.id)?._count._all ?? 0;
    const status = bookedCount >= schedule.capacity ? 'FULL' : schedule.status === 'CANCELED' ? 'CANCELED' : 'OPEN';
    await prisma.schedule.update({
      where: { id: schedule.id },
      data: { bookedCount, status },
    });
  }
}

const prisma = new PrismaClient();

function atDayHour(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { code: 'lumina-demo' },
    update: { brandName: 'LuminaStudio' },
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
    update: {
      name: 'Lumina 主店',
      businessHours: { text: '周一至周日 09:00~21:00' },
    },
    create: {
      tenantId: tenant.id,
      name: 'Lumina 主店',
      code: 'MAIN',
      address: '上海市浦东新区健身路 123 号',
      phone: '13800138000',
      businessHours: { text: '周一至周日 09:00~21:00' },
    },
  });

  await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'BR01' } },
    update: {
      name: 'Lumina 分店',
      businessHours: { text: '周一至周日 10:00~20:00' },
    },
    create: {
      tenantId: tenant.id,
      name: 'Lumina 分店',
      code: 'BR01',
      address: '上海市徐汇区瑜伽大道 456 号',
      phone: '13900139000',
      businessHours: { text: '周一至周日 10:00~20:00' },
    },
  });

  const coach = await prisma.adminUser.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'coach1' } },
    update: { displayName: 'Sarah Chen' },
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

  await prisma.ledgerEntry.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.payment.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.booking.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.schedule.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.membership.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.membershipTemplate.deleteMany({ where: { tenantId: tenant.id } });

  await prisma.service.deleteMany({
    where: { tenantId: tenant.id, name: { in: ['Morning Pilates', 'Evening Flow', 'Private Reformer'] } },
  });

  const groupClass = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      coachId: coach.id,
      name: 'Morning Pilates',
      type: 'GROUP_CLASS',
      description: '适合初学者的普拉提团课，强化核心与体态',
      price: 0,
      durationMinutes: 60,
    },
  });

  const groupClassPaid = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      coachId: coach.id,
      name: 'Evening Flow',
      type: 'GROUP_CLASS',
      description: '晚间流瑜伽团课，放松身心',
      price: 99,
      durationMinutes: 60,
    },
  });

  const privateClass = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      coachId: coach.id,
      name: 'Private Reformer',
      type: 'PRIVATE_SESSION',
      description: '一对一 Reformer 私教，定制训练计划',
      price: 299,
      durationMinutes: 60,
    },
  });

  const scheduleSlots = [
    { day: 0, hour: 10, service: groupClass, capacity: 8 },
    { day: 0, hour: 18, service: groupClassPaid, capacity: 6 },
    { day: 0, hour: 14, service: privateClass, capacity: 1 },
    { day: 1, hour: 9, service: groupClass, capacity: 8 },
    { day: 1, hour: 15, service: privateClass, capacity: 1 },
    { day: 2, hour: 10, service: groupClassPaid, capacity: 6 },
    { day: 3, hour: 11, service: groupClass, capacity: 8 },
    { day: 4, hour: 16, service: privateClass, capacity: 1 },
    { day: 5, hour: 10, service: groupClass, capacity: 8 },
    { day: 6, hour: 14, service: groupClassPaid, capacity: 6 },
  ];

  const createdSchedules = [];
  for (const slot of scheduleSlots) {
    const startAt = atDayHour(slot.day, slot.hour);
    const endAt = new Date(startAt.getTime() + slot.service.durationMinutes * 60 * 1000);
    createdSchedules.push(
      await prisma.schedule.create({
        data: {
          tenantId: tenant.id,
          storeId: mainStore.id,
          serviceId: slot.service.id,
          coachId: coach.id,
          startAt,
          endAt,
          capacity: slot.capacity,
          bookedCount: 0,
        },
      }),
    );
  }

  await prisma.membershipTemplate.createMany({
    data: [
      {
        tenantId: tenant.id,
        storeId: mainStore.id,
        name: '10 次普拉提卡',
        type: 'COUNT_BASED',
        description: '计次卡，按次消费，适合规律练习',
        price: 1990,
        totalTimes: 10,
        validDays: 180,
        sortOrder: 1,
      },
      {
        tenantId: tenant.id,
        storeId: mainStore.id,
        name: '30 天畅练卡',
        type: 'DURATION_BASED',
        description: '期限卡，30 天内不限次数团课',
        price: 899,
        validDays: 30,
        sortOrder: 2,
      },
      {
        tenantId: tenant.id,
        storeId: mainStore.id,
        name: '储值卡 2000',
        type: 'STORED_VALUE',
        description: '储值卡，充值后按课程价格扣费',
        price: 2000,
        balanceAmount: 2000,
        validDays: 365,
        sortOrder: 3,
      },
    ],
  });

  const client = await prisma.client.upsert({
    where: { tenantId_openid: { tenantId: tenant.id, openid: 'dev_openid_demo' } },
    update: { nickname: 'Demo 学员', phone: '13600136000' },
    create: {
      tenantId: tenant.id,
      openid: 'dev_openid_demo',
      nickname: 'Demo 学员',
      phone: '13600136000',
    },
  });

  await prisma.membership.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      name: '10 次普拉提卡',
      type: 'COUNT_BASED',
      totalTimes: 10,
      remainingTimes: 8,
      startedAt: new Date(),
      expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.membership.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      name: '30 天畅练卡',
      type: 'DURATION_BASED',
      startedAt: new Date(),
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Demo attendance records for profile stats
  const statsSchedule = createdSchedules[0];
  const now = new Date();
  for (let i = 0; i < 6; i += 1) {
    const checkinAt = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - i * 2), 10, 0, 0);
    await prisma.booking.create({
      data: {
        tenantId: tenant.id,
        storeId: mainStore.id,
        clientId: client.id,
        serviceId: groupClass.id,
        scheduleId: statsSchedule.id,
        status: 'COMPLETED',
        source: 'WECHAT_MINIAPP',
        bookingNo: `DEMO-C-${Date.now()}-${i}`,
        checkinAt,
      },
    });
  }
  for (let i = 0; i < 4; i += 1) {
    const checkinAt = new Date(now.getFullYear(), now.getMonth() - 1, 5 + i * 3, 10, 0, 0);
    await prisma.booking.create({
      data: {
        tenantId: tenant.id,
        storeId: mainStore.id,
        clientId: client.id,
        serviceId: groupClass.id,
        scheduleId: statsSchedule.id,
        status: 'COMPLETED',
        source: 'WECHAT_MINIAPP',
        bookingNo: `DEMO-P-${Date.now()}-${i}`,
        checkinAt,
      },
    });
  }
  await prisma.booking.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      serviceId: groupClass.id,
      scheduleId: statsSchedule.id,
      status: 'CONFIRMED',
      source: 'WECHAT_MINIAPP',
      bookingNo: `DEMO-A-${Date.now()}`,
    },
  });

  const missedStart = atDayHour(-3, 10);
  const missedEnd = atDayHour(-3, 11);
  const missedSchedule = await prisma.schedule.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      serviceId: groupClass.id,
      coachId: coach.id,
      startAt: missedStart,
      endAt: missedEnd,
      capacity: 8,
      bookedCount: 1,
    },
  });
  await prisma.booking.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      serviceId: groupClass.id,
      scheduleId: missedSchedule.id,
      status: 'CONFIRMED',
      source: 'WECHAT_MINIAPP',
      bookingNo: `DEMO-MISS-${Date.now()}`,
    },
  });

  // Demo pending-payment booking for pay-retry testing
  const paidSchedule = createdSchedules[1];
  const pendingBooking = await prisma.booking.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      serviceId: groupClassPaid.id,
      scheduleId: paidSchedule.id,
      status: 'PENDING_PAYMENT',
      source: 'WECHAT_MINIAPP',
      bookingNo: `DEMO-PAY-${Date.now()}`,
    },
  });
  await prisma.order.create({
    data: {
      tenantId: tenant.id,
      storeId: mainStore.id,
      clientId: client.id,
      bookingId: pendingBooking.id,
      serviceId: groupClassPaid.id,
      orderNo: generateOrderNo(),
      status: 'PENDING',
      orderType: 'BOOKING',
      originalAmount: groupClassPaid.price,
      discountAmount: 0,
      paidAmount: 0,
    },
  });

  await syncScheduleBookedCounts(tenant.id);

  console.log('Seed complete:', {
    tenantId: tenant.id,
    storeId: mainStore.id,
    schedules: createdSchedules.length,
    clientId: client.id,
    admin: 'admin / admin123',
    tip: '小程序 dev 登录后若需 demo 会员卡，请使用 seed 中的 dev_openid_demo 对应账号',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
