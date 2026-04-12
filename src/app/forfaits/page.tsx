"use client";

import { useEffect, useState } from "react";

export default function ForfaitsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [prenatalCount, setPrenatalCount] = useState("0");
  const [postnatalCount, setPostnatalCount] = useState("0");
  const [guardHours, setGuardHours] = useState("0");
  const [relevailleCount, setRelevailleCount] = useState("0");
  const [price, setPrice] = useState("0");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/packages/templates");
    if (res.ok) {
      setTemplates(await res.json());
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/packages/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        prenatalCount,
        postnatalCount,
        guardHours,
        relevailleCount,
        price
      })
    });
    if (res.ok) {
      setName("");
      setPrenatalCount("0");
      setPostnatalCount("0");
      setGuardHours("0");
      setRelevailleCount("0");
      setPrice("0");
      setShowForm(false);
      fetchTemplates();
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Modèles de Forfaits</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Fermer" : "+ Nouveau Modèle"}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: "32px", borderLeft: "4px solid var(--primary)" }}>
          <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>Nom du Forfait (ex: Accompagnement Complet)</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Rencontres Pré-natales</label>
              <input type="number" min="0" value={prenatalCount} onChange={e => setPrenatalCount(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Rencontres Post-natales</label>
              <input type="number" min="0" value={postnatalCount} onChange={e => setPostnatalCount(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Heures de Garde</label>
              <input type="number" min="0" value={guardHours} onChange={e => setGuardHours(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Rencontres Relevaille</label>
              <input type="number" min="0" value={relevailleCount} onChange={e => setRelevailleCount(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Prix Total ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn-primary" style={{ width: "100%" }}>Enregistrer le modèle</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {templates.length === 0 ? <p>Aucun modèle de forfait créé.</p> : null}
          {templates.map(t => (
            <div key={t.id} className="glass-panel" style={{ borderTop: "4px solid var(--secondary)" }}>
              <h3 style={{ marginTop: 0, color: "var(--primary)" }}>{t.name}</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "16px 0" }}>{t.price} $</p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.95rem" }}>
                <li>📅 Pré-natales : <strong>{t.prenatalCount}</strong></li>
                <li>🍼 Post-natales : <strong>{t.postnatalCount}</strong></li>
                <li>🏠 Relevaille : <strong>{t.relevailleCount}</strong></li>
                <li>🛡️ Garde : <strong>{t.guardHours}h</strong></li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
