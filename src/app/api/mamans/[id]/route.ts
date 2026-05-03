import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

async function checkAccess(mamanId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  const maman = await prisma.mother.findUnique({ where: { id: mamanId } });
  
  if (!maman) return null;
  if (role !== 'ADMIN' && maman.userId !== userId) return null;

  return maman;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(id);
  if (!access) return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });

  const maman = await prisma.mother.findUnique({
    where: { id },
    include: {
      packages: true,
      events: { orderBy: { date: 'asc' } },
      payments: { orderBy: { dueDate: 'asc' } }
    }
  });

  return NextResponse.json(maman);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(id);
  if (!access) return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });

  const data = await req.json();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
  if (data.age !== undefined) updateData.age = data.age ? parseInt(data.age) : null;
  if (data.childrenCount !== undefined) updateData.childrenCount = parseInt(data.childrenCount);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.partnerName !== undefined) updateData.partnerName = data.partnerName;
  if (data.partnerContact !== undefined) updateData.partnerContact = data.partnerContact;

  if (data.birthDate !== undefined) {
    const bDate = data.birthDate ? new Date(data.birthDate) : null;
    updateData.birthDate = bDate;
    if (bDate) {
      updateData.guardPeriodEnd = bDate;
      // Only auto-change to POST_NATAL if status not explicitly set by user
      if (data.status === undefined) {
        updateData.status = 'POST_NATAL';
      }
    }
  }

  if (data.birthDuration !== undefined) updateData.birthDuration = data.birthDuration;

  if (data.dueDate !== undefined) {
    const newDueDate = data.dueDate ? new Date(data.dueDate) : null;
    updateData.dueDate = newDueDate;

    if (newDueDate && !updateData.birthDate) {
      // Use user-defined configuration
      const user = await prisma.user.findUnique({
        where: { id: (access as any).userId },
        select: { guardWeeksBefore: true, guardWeeksAfter: true }
      });
      const weeksBefore = user?.guardWeeksBefore ?? 3;
      const weeksAfter = user?.guardWeeksAfter ?? 2;

      const guardStart = new Date(newDueDate);
      guardStart.setDate(guardStart.getDate() - (weeksBefore * 7));

      const guardEnd = new Date(newDueDate);
      guardEnd.setDate(guardEnd.getDate() + (weeksAfter * 7));

      updateData.guardPeriodStart = guardStart;
      updateData.guardPeriodEnd = guardEnd;
    } else if (!newDueDate) {
      updateData.guardPeriodStart = null;
      updateData.guardPeriodEnd = null;
    }
  }

  const updated = await prisma.mother.update({
    where: { id },
    data: updateData
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(id);
  if (!access) return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });

  await prisma.mother.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
