import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userId = user.id;

  // 1. Mamans Actives (Status not COMPLETED)
  const activeMothersCount = await prisma.mother.count({
    where: {
      userId,
      status: { not: "COMPLETED" }
    }
  });

  // 2. Évènements à venir
  const now = new Date();
  const upcomingEventsCount = await prisma.event.count({
    where: {
      mother: { userId },
      date: { gte: now },
      status: "SCHEDULED"
    }
  });

  const nextEvent = await prisma.event.findFirst({
    where: {
      mother: { userId },
      date: { gte: now },
      status: "SCHEDULED"
    },
    orderBy: { date: "asc" },
    include: {
      mother: { select: { id: true, name: true } },
      meetingType: { select: { name: true } }
    }
  });

  // 3. Paiements en retard
  const overduePayments = await prisma.payment.findMany({
    where: {
      mother: { userId },
      status: { in: ["PENDING", "OVERDUE"] },
      dueDate: { lt: now }
    }
  });

  const overdueCount = overduePayments.length;
  const overdueTotal = overduePayments.reduce((acc, p) => acc + p.amount, 0);

  // 4. Activités Récentes (5 dernières rencontres complétées)
  const recentActivities = await prisma.event.findMany({
    where: {
      mother: { userId },
      status: "COMPLETED"
    },
    orderBy: { date: "desc" },
    take: 5,
    include: {
      mother: { select: { name: true } },
      meetingType: { select: { name: true } }
    }
  });

  // 5. Revenus du mois en cours
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthPayments = await prisma.payment.findMany({
    where: {
      mother: { userId },
      status: "PAID",
      paidAt: { gte: startOfMonth }
    }
  });
  const monthlyRevenue = monthPayments.reduce((acc, p) => acc + p.amount, 0);

  // 6. Statistiques par statut
  const statusStats = await prisma.mother.groupBy({
    by: ['status'],
    where: { userId },
    _count: { id: true }
  });

  return NextResponse.json({
    activeMothersCount,
    upcomingEventsCount,
    nextEvent,
    overdueCount,
    overdueTotal,
    overdueFirst: overduePayments.length > 0 ? {
        amount: overduePayments[0].amount,
        invoiceNo: overduePayments[0].invoiceNo,
        motherName: (await prisma.mother.findUnique({ where: { id: overduePayments[0].motherId }, select: { name: true } }))?.name
    } : null,
    recentActivities,
    monthlyRevenue,
    statusStats: statusStats.map(s => ({ status: s.status, count: s._count.id }))
  });
}
