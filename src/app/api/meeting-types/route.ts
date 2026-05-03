import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const prisma = new PrismaClient();

const DEFAULT_TYPES = [
  { name: "Suivi prénatal", color: "#f472b6" },
  { name: "Suivi postnatal", color: "#fb923c" },
  { name: "Relevaille", color: "#3b82f6" },
  { name: "Garde", color: "#06b6d4" },
  { name: "Rencontre d'approche", color: "#8b5cf6" },
  { name: "Accompagnement à la naissance", color: "#f43f5e" }
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const types = await prisma.meetingType.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { name, color } = await req.json();

  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const newType = await prisma.meetingType.create({
    data: { name, color, userId }
  });

  return NextResponse.json(newType);
}
