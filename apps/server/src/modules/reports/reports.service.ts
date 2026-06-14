import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async dashboard(tenantId: number, storeId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereBase: any = { tenantId };
    if (storeId) whereBase.storeId = storeId;

    const whereToday = { ...whereBase, createdAt: { gte: today, lt: tomorrow } };
    const whereBookingsToday = { ...whereBase, schedule: { startAt: { gte: today, lt: tomorrow } } };

    const [todayBookings, todayCheckins, todayRevenue, activeClients, totalServices, totalSchedules] = await Promise.all([
      this.prisma.booking.count({ where: { ...whereToday, schedule: { startAt: { gte: today, lt: tomorrow } } } }),
      this.prisma.booking.count({ where: { ...whereBookingsToday, status: { in: ['CHECKED_IN', 'COMPLETED'] } } }),
      this.prisma.ledgerEntry.aggregate({
        where: { ...whereBase, occurredAt: { gte: today, lt: tomorrow }, type: 'RECHARGE' },
        _sum: { amount: true },
      }),
      this.prisma.client.count({ where: { ...whereBase, status: 'ACTIVE' } }),
      this.prisma.service.count({ where: { ...whereBase, status: 'ACTIVE' } }),
      this.prisma.schedule.count({ where: { ...whereBase, startAt: { gte: today } } }),
    ]);

    return {
      todayBookings,
      todayCheckins,
      todayRevenue: todayRevenue._sum.amount || 0,
      activeClients,
      totalServices,
      upcomingSchedules: totalSchedules,
    };
  }

  async revenueReport(tenantId: number, dateFrom?: string, dateTo?: string) {
    const where: any = { tenantId, type: 'RECHARGE' };
    if (dateFrom || dateTo) {
      where.occurredAt = {};
      if (dateFrom) where.occurredAt.gte = new Date(dateFrom);
      if (dateTo) where.occurredAt.lte = new Date(dateTo);
    }

    const result = await this.prisma.ledgerEntry.groupBy({
      by: ['occurredAt'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { occurredAt: 'asc' },
    });

    return result.map(r => ({
      date: r.occurredAt,
      amount: r._sum.amount,
      count: r._count,
    }));
  }

  async bookingReport(tenantId: number, dateFrom?: string, dateTo?: string) {
    const where: any = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const total = await this.prisma.booking.count({ where });
    const byStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return { total, byStatus: byStatus.map(s => ({ status: s.status, count: s._count })) };
  }
}
