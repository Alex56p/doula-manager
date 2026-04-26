import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const mamans = await prisma.mother.findMany({
    where: role === 'ADMIN' ? {} : { userId },
    include: {
      payments: true,
      packages: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(mamans);
}
