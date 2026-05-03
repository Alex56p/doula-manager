import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { status, amount, type, dueDate, invoiceNo, isExtra, notes, paidAt } = data;

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      type,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      invoiceNo,
      isExtra: isExtra !== undefined ? !!isExtra : undefined,
      notes: notes !== undefined ? notes : undefined,
      paidAt: paidAt !== undefined ? (paidAt ? new Date(paidAt) : null) : undefined
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.payment.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}
