import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { rawBodyValue, toJson } from '../../common/api/query.util';
import { userSummarySelect } from '../../common/api/prisma-selects';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(orderId: string) {
    const order = await this.prisma.storeOrder.findUnique({
      include: {
        items: { include: { product: true } },
        product: true,
        user: { select: userSummarySelect },
      },
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return toJson(order);
  }

  async byUser(userId: string) {
    return toJson(
      await this.prisma.storeOrder.findMany({
        include: { items: { include: { product: true } }, product: true },
        orderBy: { createdAt: 'desc' },
        where: { userId },
      }),
    );
  }

  async create(body: any) {
    const items = Array.isArray(body.items) ? body.items : [];
    const firstItem = items[0];
    const order = await this.prisma.storeOrder.create({
      data: {
        productId: firstItem?.productId ?? body.productId,
        quantity: firstItem?.quantity ?? body.quantity ?? 1,
        status: body.status ?? 'pending',
        totalAmount: body.totalAmount,
        userId: body.userId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity ?? 1,
            totalPrice: Number(item.price ?? item.unitPrice) * Number(item.quantity ?? 1),
            unitPrice: item.price ?? item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    return toJson(order);
  }

  async updateStatus(id: string, body: any) {
    const status = rawBodyValue<string>(body, 'status');
    return toJson(await this.prisma.storeOrder.update({ data: { status }, where: { id } }));
  }

  async cancel(id: string) {
    const order = await this.prisma.storeOrder.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    await this.prisma.storeOrder.delete({ where: { id } });
    return { deleted: true };
  }
}
