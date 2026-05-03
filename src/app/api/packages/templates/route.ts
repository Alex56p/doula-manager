import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.packageTemplate.findMany();
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { name, prenatalCount, postnatalCount, guardDays, relevailleCount, price, meetingCounts } = data;

  if (!name) return NextResponse.json({ error: "Le nom du forfait est requis" }, { status: 400 });

  const template = await prisma.packageTemplate.create({
    data: {
      name,
      prenatalCount: parseInt(prenatalCount) || 0,
      postnatalCount: parseInt(postnatalCount) || 0,
      guardDays: parseInt(guardDays) || 0,
      relevailleCount: parseInt(relevailleCount) || 0,
      price: parseFloat(price) || 0.0,
      meetingCounts: meetingCounts || {}
    }
  });

  return NextResponse.json(template);
}
