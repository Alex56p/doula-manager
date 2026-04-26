import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { guardWeeksBefore: true, guardWeeksAfter: true }
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { guardWeeksBefore, guardWeeksAfter } = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        guardWeeksBefore: parseInt(guardWeeksBefore) || 0,
        guardWeeksAfter: parseInt(guardWeeksAfter) || 0
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
