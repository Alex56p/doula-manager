import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    // First, unlink any events that use this meeting type (set meetingTypeId to null)
    await prisma.event.updateMany({
      where: { meetingTypeId: id },
      data: { meetingTypeId: null }
    });
    // Then delete the meeting type
    await prisma.meetingType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting type:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, color } = await req.json();

  try {
    const updated = await prisma.meetingType.update({
      where: { id },
      data: { name, color }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}
