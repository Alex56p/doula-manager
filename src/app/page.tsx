"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-fade-in"><h1 className="page-title">Chargement du tableau de bord...</h1></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Tableau de Bord</h1>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>MAMANS ACTIVES</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{data?.activeMothersCount || 0}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>clientes en cours</span>
          </div>
          <Link href="/mamans" className="btn-secondary" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '4px 12px', marginTop: '12px' }}>Voir la liste</Link>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>À VENIR</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{data?.upcomingEventsCount || 0}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>rencontres planifiées</span>
          </div>
          {data?.nextEvent && (
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Prochain: {data.nextEvent.mother.name} ({new Date(data.nextEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})
            </p>
          )}
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>REVENUS DU MOIS</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>{data?.monthlyRevenue || 0}$</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>encaissés</span>
          </div>
          <Link href="/paiements" className="btn-secondary" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '4px 12px', marginTop: '12px' }}>Détails</Link>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger)', borderColor: data?.overdueCount > 0 ? 'var(--danger)' : 'var(--glass-border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>EN RETARD</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: data?.overdueCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{data?.overdueCount || 0}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>paiements dus</span>
          </div>
          {data?.overdueTotal > 0 && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>Total : {data.overdueTotal}$</p>}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
        
        {/* Left Column: Status Breakdown */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Répartition par Statut</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.statusStats?.map((s: any) => (
              <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.status}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '10px' }}>{s.count} clientes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="glass-panel" style={{ background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', color: 'white', textAlign: 'center' }}>Actions Rapides</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link href="/mamans" className="btn-secondary" style={{ width: '100%', textAlign: 'center', background: 'white', color: 'var(--primary)', border: 'none', padding: '12px', fontSize: '1rem' }}>+ Nouvelle Maman</Link>
            <Link href="/calendrier" className="btn-secondary" style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '12px', fontSize: '1rem' }}>Planifier une rencontre</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
