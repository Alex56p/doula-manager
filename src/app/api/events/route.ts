import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { title, type, date, motherId, notes } = data;

  if (!title || !type || !date || !motherId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const mother = await prisma.mother.findUnique({ where: { id: motherId } });
  if (!mother) return NextResponse.json({ error: "Mother not found" }, { status: 404 });

  const event = await prisma.event.create({
    data: {
      title,
      type: data.type || null,
      meetingTypeId: data.meetingTypeId || null,
      date: new Date(date),
      notes: notes || "",
      motherId,
    }
  });

  return NextResponse.json(event);
}
