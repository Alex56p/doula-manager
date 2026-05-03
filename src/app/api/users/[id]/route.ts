import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { name, email, role, password } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
  }

  const updateData: any = { name, email, role };

  // Only update password if a new one is provided (reset password)
  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
