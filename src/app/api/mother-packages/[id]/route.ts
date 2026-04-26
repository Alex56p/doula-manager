import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const { name, prenatalCount, postnatalCount, guardDays, relevailleCount, price, meetingCounts } = data;

  const mamanPackage = await prisma.motherPackage.update({
    where: { id },
    data: {
      name,
      prenatalCount: parseInt(prenatalCount) || 0,
      postnatalCount: parseInt(postnatalCount) || 0,
      guardDays: parseInt(guardDays) || 0,
      relevailleCount: parseInt(relevailleCount) || 0,
      price: parseFloat(price) || 0.0,
      meetingCounts: meetingCounts !== undefined ? meetingCounts : undefined,
      isCustom: true // Automatically mark as custom when edited
    }
  });

  return NextResponse.json(mamanPackage);
}
