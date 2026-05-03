import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // Auto-sync IN_GUARD statuses
  const today = new Date();
  await prisma.mother.updateMany({
    where: {
      guardPeriodStart: { lte: today },
      guardPeriodEnd: { gte: today },
      status: {
        in: ['CONFIRMED', 'POTENTIAL', 'UNCONFIRMED']
      }
    },
    data: {
      status: 'IN_GUARD'
    }
  });

  const mamans = await prisma.mother.findMany({
    where: role === 'ADMIN' ? {} : { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } } // so admin sees who owns what
    }
  });

  return NextResponse.json(mamans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin can technically assign to other users, but default to current user
  const userId = (session.user as any).id;

  const data = await req.json();

  if (!data.name || !data.contactInfo) {
    return NextResponse.json({ error: "Nom et contact requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { guardWeeksBefore: true, guardWeeksAfter: true }
  });
  const weeksBefore = user?.guardWeeksBefore ?? 3;
  const weeksAfter = user?.guardWeeksAfter ?? 2;

  const dueDate = data.dueDate && data.dueDate.trim() !== "" ? new Date(data.dueDate) : null;
  
  let guardStart: Date | null = null;
  let guardEnd: Date | null = null;

  if (dueDate) {
    const start = new Date(dueDate);
    start.setDate(start.getDate() - (weeksBefore * 7));
    
    const end = new Date(dueDate);
    end.setDate(end.getDate() + (weeksAfter * 7));
    guardStart = start;
    guardEnd = end;
  }

  const newMaman = await prisma.mother.create({
    data: {
      name: data.name,
      contactInfo: data.contactInfo,
      age: data.age ? parseInt(data.age) : null,
      childrenCount: data.childrenCount ? parseInt(data.childrenCount) : 0,
      status: data.status || 'POTENTIAL',
      dueDate: dueDate,
      guardPeriodStart: guardStart,
      guardPeriodEnd: guardEnd,
      notes: data.notes || '',
      userId: userId,
    }
  });

  return NextResponse.json(newMaman);
}
