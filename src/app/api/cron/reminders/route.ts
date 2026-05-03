import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../../lib/email";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Simple protection pour éviter les abus (un token secret dans l'URL)
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  
  if (token !== (process.env.CRON_SECRET || "cronsecret123")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Chercher les rencontres dans les prochaines 48h
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: "SCHEDULED",
        date: {
          gt: now,
          lte: in48Hours,
        },
        reminderSent: false // On suppose qu'on ajoute ce champ au schéma ou on s'assure de ne pas spammer
      },
      include: {
        mother: {
          include: {
            user: true
          }
        },
        meetingType: true
      }
    });

    let sentCount = 0;

    for (const event of upcomingEvents) {
      const doulaEmail = event.mother.user.email;
      
      const emailSent = await sendEmail({
        to: doulaEmail,
        subject: `Rappel : Rencontre avec ${event.mother.name} demain`,
        text: `Bonjour ${event.mother.user.name},\n\nVous avez une rencontre prévue avec ${event.mother.name} le ${new Date(event.date).toLocaleString('fr-FR')}.\n\nType de rencontre: ${event.meetingType ? event.meetingType.name : (event.type || 'Rencontre')}\n\nBonne journée !`,
        html: `<p>Bonjour ${event.mother.user.name},</p><p>Vous avez une rencontre prévue avec <strong>${event.mother.name}</strong> le <strong>${new Date(event.date).toLocaleString('fr-FR')}</strong>.</p><p>Type de rencontre: ${event.meetingType ? event.meetingType.name : (event.type || 'Rencontre')}</p><p>Bonne journée !</p>`
      });

      if (emailSent) {
        // Idéalement marquer l'événement comme "rappel envoyé"
        await prisma.event.update({ where: { id: event.id }, data: { reminderSent: true } });
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, message: `${sentCount} rappels envoyés.` });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
