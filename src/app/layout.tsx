import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "./../lib/auth";
import LogoutButton from "./../components/LogoutButton";
import { Providers } from "./../components/Providers";
import Navigation from "./../components/Navigation";

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
            <Navigation session={session} />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
