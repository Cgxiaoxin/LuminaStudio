import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private bookingsService: BookingsService,
  ) {}

  async createPayment(orderId: number, channel: string, tenantId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending');
    }

    return this.prisma.payment.create({
      data: {
        tenantId,
        storeId: order.storeId,
        orderId,
        channel,
        status: 'PENDING',
        amount: order.originalAmount,
      },
    });
  }

  async handleNotify(
    paymentId: number,
    transactionId: string,
    success: boolean,
    tenantId: number,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { order: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment is not pending');
    }

    if (!success) {
      return this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', transactionId },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'PAID', transactionId },
      });

      // Update order
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paidAmount: payment.amount,
          paidAt: new Date(),
          payChannel: payment.channel,
        },
      });

      // Confirm booking if linked
      if (payment.order.bookingId) {
        await tx.booking.update({
          where: { id: payment.order.bookingId },
          data: {
            status: 'CONFIRMED',
            paidAmount: payment.amount,
          },
        });
      }

      // Create ledger entry
      await tx.ledgerEntry.create({
        data: {
          tenantId,
          storeId: payment.storeId,
          clientId: payment.order.clientId,
          orderId: payment.orderId,
          paymentId,
          bookingId: payment.order.bookingId,
          type: 'RECHARGE',
          amount: payment.amount,
          occurredAt: new Date(),
          source: 'PAYMENT',
          remark: `Payment ${transactionId}`,
        },
      });

      return { success: true };
    });
  }

  async findByOrder(orderId: number, tenantId: number) {
    return this.prisma.payment.findMany({
      where: { orderId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
