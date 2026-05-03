"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartDateInput } from "../../components/SmartDateInput";
import { SmartDateTimeInput } from "../../components/SmartDateTimeInput";

export default function MamansPage() {
  const [mamans, setMamans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  const filteredMamans = filterStatus === "ALL" 
    ? mamans 
    : mamans.filter(m => m.status === filterStatus);

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
    UNCONFIRMED: "#94a3b8",
    CONFIRMED: "#3b82f6",
    POTENTIAL: "#f59e0b",
    IN_GUARD: "#8b5cf6",
    POST_NATAL: "#10b981",
    COMPLETED: "#64748b",
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
        <h1 className="page-title" style={{ margin: 0 }}>Mamans</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Fermer" : "+ Nouvelle Maman"}
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFilterStatus("ALL")}
          style={{ 
            padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', cursor: 'pointer',
            background: filterStatus === "ALL" ? 'var(--primary)' : 'white',
            color: filterStatus === "ALL" ? 'white' : 'var(--text-color)',
            transition: 'all 0.2s'
          }}
        >
          Tous ({mamans.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = mamans.filter(m => m.status === key).length;
          if (count === 0 && filterStatus !== key) return null;
          return (
            <button 
              key={key}
              onClick={() => setFilterStatus(key)}
              style={{ 
                padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', cursor: 'pointer',
                background: filterStatus === key ? STATUS_COLORS[key] : 'white',
                color: filterStatus === key ? 'white' : 'var(--text-color)',
                transition: 'all 0.2s'
              }}
            >
              {(label as any)} ({count})
            </button>
          );
        })}
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
              <SmartDateInput
                label="Date d'accouchement prévue"
                value={dueDate}
                onChange={setDueDate}
              />
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
          {filteredMamans.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucune maman trouvée pour ce filtre.</p> : null}
          
          {filteredMamans.map(m => (
            <Link key={m.id} href={`/mamans/${m.id}`}>
              <div className="glass-panel" style={{ cursor: "pointer", height: "100%", transition: "all 0.2s", borderTop: `4px solid ${STATUS_COLORS[m.status]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, color: "var(--text-color)" }}>{m.name}</h3>
                  <span style={{ 
                    fontSize: "0.7rem", 
                    fontWeight: 700, 
                    padding: "2px 8px", 
                    borderRadius: "10px", 
                    backgroundColor: `${STATUS_COLORS[m.status]}15`, 
                    color: STATUS_COLORS[m.status],
                    border: `1px solid ${STATUS_COLORS[m.status]}40`
                  }}>
                    {STATUS_LABELS[m.status]}
                  </span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📞 {m.contactInfo}</span>
                </p>
                {m.dueDate && (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                    📅 DPA: {new Date(m.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>Détails →</span>
                  {m.packages?.length > 0 && <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{m.packages.length} Forfait(s)</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
