import { Injectable } from '@nestjs/common';
import { rawBodyValue, toJson } from '../../common/api/query.util';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ShoppingCartService {
  constructor(private readonly prisma: PrismaService) {}

  async byUser(userId: string) {
    const items = await this.prisma.shoppingCart.findMany({
      include: { product: true },
      where: { userId },
    });
    const totalItems = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.product.price) * (item.quantity ?? 0),
      0,
    );
    return toJson({ items, totalAmount, totalItems });
  }

  async add(currentUserId: string, body: any) {
    const userId = body.userId ?? currentUserId;
    const quantity = Number(body.quantity ?? 1);
    const existing = await this.prisma.shoppingCart.findFirst({
      where: { productId: body.productId, userId },
    });

    if (existing) {
      return toJson(
        await this.prisma.shoppingCart.update({
          data: { quantity: (existing.quantity ?? 0) + quantity },
          where: { id: existing.id },
        }),
      );
    }

    return toJson(
      await this.prisma.shoppingCart.create({
        data: { productId: body.productId, quantity, userId },
      }),
    );
  }

  async updateQuantity(id: string, body: any) {
    const quantity = Number(rawBodyValue<number>(body, 'quantity'));
    return toJson(
      await this.prisma.shoppingCart.update({
        data: { quantity },
        where: { id },
      }),
    );
  }

  async clear(userId: string) {
    const result = await this.prisma.shoppingCart.deleteMany({ where: { userId } });
    return { count: result.count };
  }

  async delete(id: string) {
    await this.prisma.shoppingCart.delete({ where: { id } });
    return { deleted: true };
  }
}
