import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { templateId } = await req.json();

  if (!templateId) return NextResponse.json({ error: "Template ID requis" }, { status: 400 });

  const template = await prisma.packageTemplate.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: "Template non trouvé" }, { status: 404 });

  const motherPackage = await prisma.motherPackage.create({
    data: {
      motherId: id,
      name: template.name,
      prenatalCount: template.prenatalCount,
      postnatalCount: template.postnatalCount,
      guardDays: template.guardDays,
      relevailleCount: template.relevailleCount,
      price: template.price,
      meetingCounts: template.meetingCounts !== null ? template.meetingCounts : undefined,
    }
  });

  return NextResponse.json(motherPackage);
}
