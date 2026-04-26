import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: 'Doula Manager',
  description: 'Gestion de clientes, forfaits et rencontres pour les doulas.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="app-container">
            {session ? (
              <aside className="sidebar">
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Doula Manager</h2>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Link href="/" style={{ padding: '8px', borderRadius: '8px' }}>
                    Dashboard
                  </Link>
                  <Link href="/mamans" style={{ padding: '8px', borderRadius: '8px' }}>
                    Mamans
                  </Link>
                  <Link href="/calendrier" style={{ padding: '8px', borderRadius: '8px' }}>
                    Calendrier
                  </Link>
                  <Link href="/forfaits" style={{ padding: '8px', borderRadius: '8px' }}>
                    Forfaits
                  </Link>
                  <Link href="/paiements" style={{ padding: '8px', borderRadius: '8px' }}>
                    Paiements
                  </Link>
                  <Link href="/parametres" style={{ padding: '8px', borderRadius: '8px', marginTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                    ⚙️ Paramètres
                  </Link>
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.user?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(session.user as any)?.role}</p>
                  <LogoutButton />
                </div>
              </aside>
            ) : null}
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
