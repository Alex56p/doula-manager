import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        mother: {
          include: {
            packages: true
          }
        }
      }
    });

    if (!event) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  
  const updateData: any = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.title !== undefined) updateData.title = data.title;
  if (data.duration !== undefined) updateData.duration = parseFloat(data.duration) || 1;
  if (data.meetingTypeId !== undefined) updateData.meetingTypeId = data.meetingTypeId;

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting event" }, { status: 500 });
  }
}
