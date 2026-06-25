import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipsService } from '../memberships/memberships.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: {
    $transaction: jest.Mock;
    schedule: { findUnique: jest.Mock; updateMany: jest.Mock; update: jest.Mock };
    booking: { create: jest.Mock };
    membership: { findFirst: jest.Mock; update: jest.Mock };
    order: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (cb) => cb(prisma)),
      schedule: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      booking: { create: jest.fn() },
      membership: { findFirst: jest.fn(), update: jest.fn() },
      order: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MembershipsService, useValue: {} },
      ],
    }).compile();

    service = module.get(BookingsService);
  });

  it('rejects booking when schedule is full', async () => {
    prisma.schedule.findUnique.mockResolvedValue({
      id: 1,
      tenantId: 1,
      storeId: 1,
      serviceId: 1,
      capacity: 1,
      bookedCount: 1,
      status: 'OPEN',
      service: { id: 1, price: 0, name: 'Free Class' },
    });
    prisma.schedule.updateMany.mockResolvedValue({ count: 0 });
    prisma.schedule.update.mockResolvedValue({});

    await expect(
      service.create({ scheduleId: 1, clientId: 1 }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates confirmed booking for free class', async () => {
    prisma.schedule.findUnique.mockResolvedValue({
      id: 1,
      tenantId: 1,
      storeId: 1,
      serviceId: 1,
      capacity: 2,
      bookedCount: 0,
      status: 'OPEN',
      service: { id: 1, price: 0, name: 'Free Class' },
    });
    prisma.schedule.updateMany.mockResolvedValue({ count: 1 });
    prisma.booking.create.mockResolvedValue({ id: 10, status: 'CONFIRMED' });

    const result = await service.create({ scheduleId: 1, clientId: 1 }, 1);
    expect(result.booking.status).toBe('CONFIRMED');
    expect(result.order).toBeNull();
  });

  it('creates pending payment booking and order for paid class', async () => {
    prisma.schedule.findUnique.mockResolvedValue({
      id: 2,
      tenantId: 1,
      storeId: 1,
      serviceId: 2,
      capacity: 1,
      bookedCount: 0,
      status: 'OPEN',
      service: { id: 2, price: 299, name: 'Paid Class' },
    });
    prisma.schedule.updateMany.mockResolvedValue({ count: 1 });
    prisma.booking.create.mockResolvedValue({ id: 11, status: 'PENDING_PAYMENT' });
    prisma.order.create.mockResolvedValue({ id: 20, status: 'PENDING' });

    const result = await service.create({ scheduleId: 2, clientId: 1 }, 1);
    expect(result.booking.status).toBe('PENDING_PAYMENT');
    expect(result.order).toEqual({ id: 20, status: 'PENDING' });
  });

  it('filters bookings by comma-separated statuses', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    (service as any).prisma = {
      booking: { findMany, count },
    };

    await service.findAll(1, { status: 'CONFIRMED,PENDING_PAYMENT' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        }),
      }),
    );
  });
});

describe('BookingsService concurrency', () => {
  it('only allows one booking when capacity is 1', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();
    const membershipsService = new MembershipsService(db as any);
    const bookingsService = new BookingsService(db as any, membershipsService);

    const schedule = await db.schedule.findFirst({
      where: { capacity: 1, status: 'OPEN' },
      include: { service: true },
    });
    if (!schedule) {
      await db.$disconnect();
      return;
    }

    const client = await db.client.findFirst({ where: { tenantId: schedule.tenantId } });
    if (!client) {
      await db.$disconnect();
      return;
    }

    await db.schedule.update({
      where: { id: schedule.id },
      data: { bookedCount: 0, status: 'OPEN' },
    });
    await db.booking.deleteMany({ where: { scheduleId: schedule.id } });

    const results = await Promise.allSettled([
      bookingsService.create({ scheduleId: schedule.id, clientId: client.id }, schedule.tenantId),
      bookingsService.create({ scheduleId: schedule.id, clientId: client.id }, schedule.tenantId),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const updated = await db.schedule.findUnique({ where: { id: schedule.id } });
    expect(updated?.bookedCount).toBe(1);

    await db.$disconnect();
  });
});
