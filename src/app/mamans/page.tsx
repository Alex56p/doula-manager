"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MamansPage() {
  const [mamans, setMamans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [status, setStatus] = useState("POTENTIAL");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchMamans();
  }, []);

  const fetchMamans = async () => {
    const res = await fetch("/api/mamans");
    if (res.ok) setMamans(await res.json());
    setLoading(false);
  };

  const handleAddMaman = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/mamans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactInfo, status, dueDate })
    });
    if (res.ok) {
      setName("");
      setContactInfo("");
      setStatus("POTENTIAL");
      setDueDate("");
      setShowAddForm(false);
      fetchMamans();
    } else {
      const error = await res.json();
      alert(`Erreur: ${error.error}`);
    }
  };

  const STATUS_COLORS: any = {
    UNCONFIRMED: "var(--text-muted)",
    CONFIRMED: "var(--secondary)",
    POTENTIAL: "var(--warning)",
    IN_GUARD: "var(--primary)",
    POST_NATAL: "var(--success)",
    COMPLETED: "var(--text-muted)",
  };

  const STATUS_LABELS: any = {
    UNCONFIRMED: "À confirmer",
    CONFIRMED: "Confirmé",
    POTENTIAL: "Potentiel",
    IN_GUARD: "En garde",
    POST_NATAL: "Post-natale",
    COMPLETED: "Terminé",
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Mamans (CRM)</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Fermer" : "+ Nouvelle Maman"}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ marginBottom: "32px", borderLeft: "4px solid var(--primary)" }}>
          <form onSubmit={handleAddMaman} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Nom de la mère</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Informations de contact (Tél/Courriel)</label>
              <input type="text" required value={contactInfo} onChange={e => setContactInfo(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Date d'accouchement prévue</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn-primary">Ajouter la cliente</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement des clientes...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {mamans.length === 0 ? <p>Aucune maman trouvée. Commencez par en ajouter une !</p> : null}
          
          {mamans.map(m => (
            <Link key={m.id} href={`/mamans/${m.id}`}>
              <div className="glass-panel" style={{ cursor: "pointer", height: "100%", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, color: "var(--text-color)" }}>{m.name}</h3>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 600, 
                    padding: "4px 8px", 
                    borderRadius: "12px", 
                    backgroundColor: `${STATUS_COLORS[m.status]}30`, 
                    color: STATUS_COLORS[m.status] 
                  }}>
                    {STATUS_LABELS[m.status]}
                  </span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📞 {m.contactInfo}</span>
                </p>
                {m.dueDate && (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                    📅 DPA: {new Date(m.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--primary)" }}>Voir la fiche complète →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
