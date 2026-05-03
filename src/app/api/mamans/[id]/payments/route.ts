import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { amount, invoiceNo, dueDate, status, type, isExtra, notes, paidAt } = data;

  if (!amount) {
    return NextResponse.json({ error: "Amount required" }, { status: 400 });
  }

  const newPayment = await prisma.payment.create({
    data: {
      amount: parseFloat(amount),
      invoiceNo: invoiceNo || null,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      status: status || 'PAID',
      type: type || 'MEETING',
      isExtra: !!isExtra,
      notes: notes || null,
      paidAt: paidAt ? new Date(paidAt) : null,
      motherId: id
    }
  });

  return NextResponse.json(newPayment);
}
