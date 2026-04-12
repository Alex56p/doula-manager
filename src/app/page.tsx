export default function Home() {
  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Bienvenue dans Doula Manager</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '40px' }}>
        
        <div className="glass-panel">
          <h3>Mamans Actives</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: '16px 0' }}>12</p>
          <a href="/mamans" className="btn-secondary" style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}>Gérer</a>
        </div>

        <div className="glass-panel">
          <h3>Évènements à venir</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', margin: '16px 0' }}>4</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Prochain: Demain 14:00 (Post-natale)</p>
          <a href="/calendrier" className="btn-secondary" style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}>Voir Calendrier</a>
        </div>

        <div className="glass-panel" style={{ borderColor: 'var(--danger)' }}>
          <h3>Paiements en retard</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)', margin: '16px 0' }}>1</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Facture #004 - 150.00$</p>
          <a href="/paiements" className="btn-secondary" style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}>Gérer Paiements</a>
        </div>

      </div>

      <div className="glass-panel" style={{ marginTop: '40px' }}>
        <h2>Aperçu rapide</h2>
        <div style={{ marginTop: '20px' }}>
          <p>Ceci est votre tableau de bord. Tout votre travail y sera centralisé.</p>
          <button className="btn-primary" style={{ marginTop: '20px' }}>+ Ajouter une nouvelle Maman</button>
        </div>
      </div>
    </div>
  );
}
