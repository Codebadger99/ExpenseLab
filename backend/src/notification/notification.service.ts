import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, NotificationType, TransactionType } from '../generated/client/enums';
import { monthRange } from '../analytics/entities/date';

const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    // Called after an EXPENSE is saved. Creates at most one alert, and never repeats it.
    async checkBudget(userId: number, category: Category, date: Date) {
        const budget = await this.prisma.budget.findUnique({
            where: { userId_category: { userId, category } },
        });
        if (!budget || budget.limit <= 0) return; // 0 means "no budget set"

        const month = date.toISOString().slice(0, 7); // the month of the expense, not today
        const { start, end } = monthRange(month);

        const total = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { userId, category, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
        });
        const spent = total._sum.amount?.toNumber() ?? 0;
        const percent = Math.round((spent / budget.limit) * 100);

        let type: NotificationType | null = null;
        if (percent >= 100) type = NotificationType.BUDGET_EXCEEDED;
        else if (percent >= 80) type = NotificationType.BUDGET_WARNING;
        if (!type) return;

        const name = label(category);
        await this.prisma.notification.createMany({
            data: [
                {
                    userId,
                    type,
                    category,
                    month,
                    title: type === NotificationType.BUDGET_EXCEEDED ? `${name} budget exceeded` : `${name} budget at ${percent}%`,
                    message: `You have spent ${naira(spent)} of your ${naira(budget.limit)} ${name} budget for ${month}.`,
                },
            ],
            skipDuplicates: true, // the @@unique rule stops the same alert being created twice
        });

    }



    findAll(userId: number, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: { userId, ...(unreadOnly && { isRead: false }) },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async unreadCount(userId: number) {
        const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
        return { count };
    }

    async markRead(userId: number, id: number) {
        // updateMany lets us check ownership and update in one step
        const result = await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        if (result.count === 0) throw new NotFoundException('Notification not found');
        return { id, isRead: true };
    }

    async markAllRead(userId: number) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { updated: result.count };
    }
}