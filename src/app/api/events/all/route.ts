import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // Fetch all events
  const events = await prisma.event.findMany({
    where: role === 'ADMIN' ? {} : { mother: { userId } },
    include: {
      mother: {
        select: {
          id: true,
          name: true,
          status: true,
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  // Fetch all mothers to get their guard periods
  const mothers = await prisma.mother.findMany({
    where: role === 'ADMIN' ? {} : { userId },
    select: {
      id: true,
      name: true,
      dueDate: true,
      birthDate: true,
      guardPeriodStart: true,
      guardPeriodEnd: true,
      status: true
    }
  });

  return NextResponse.json({ events, mothers });
}
