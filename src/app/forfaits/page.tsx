"use client";

import { useEffect, useState } from "react";

export default function ForfaitsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [meetingCounts, setMeetingCounts] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Global State
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/packages/templates");
    if (res.ok) {
      setTemplates(await res.json());
    }
    const resMt = await fetch("/api/meeting-types");
    if (resMt.ok) setMeetingTypes(await resMt.json());
    
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/packages/templates/${editingId}` : "/api/packages/templates";
    const method = editingId ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price,
        meetingCounts
      })
    });
    if (res.ok) {
      resetForm();
      fetchTemplates();
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("0");
    setMeetingCounts({});
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (t: any) => {
    setName(t.name);
    setPrice(t.price.toString());
    setMeetingCounts(t.meetingCounts || {});
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce modèle ?")) return;
    const res = await fetch(`/api/packages/templates/${id}`, { method: "DELETE" });
    if (res.ok) fetchTemplates();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Modèles de Forfaits</h1>
        <button className="btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? "Fermer" : "+ Nouveau Modèle"}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: "32px", borderLeft: "4px solid var(--primary)" }}>
                  <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>Nom du Forfait (ex: Accompagnement Complet)</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: "12px" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "var(--primary)" }}>Types de Rencontres Inclus</h4>
              {meetingTypes.length === 0 && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Vous n'avez aucun type de rencontre configuré dans vos paramètres.</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                {meetingTypes.map(mt => (
                  <div key={mt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: mt.color || "#ccc" }}></div>
                      <span style={{ fontSize: "0.9rem" }}>{mt.name}</span>
                    </div>
                    <input 
                      type="number" 
                      min="0" 
                      value={meetingCounts[mt.id] || ""} 
                      placeholder="0"
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setMeetingCounts(prev => {
                          const n = { ...prev };
                          if (isNaN(val) || val <= 0) delete n[mt.id];
                          else n[mt.id] = val;
                          return n;
                        });
                      }} 
                      style={{ width: "70px", padding: "8px", borderRadius: "6px", border: "1px solid var(--glass-border)", textAlign: "center" }} 
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>Prix Total ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingId ? "Mettre à jour" : "Enregistrer le modèle"}</button>
              {editingId && <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>}
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
            <div key={t.id} className="glass-panel" style={{ borderTop: "4px solid var(--secondary)", position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ marginTop: 0, color: "var(--primary)" }}>{t.name}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(t)} title="Modifier" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>✎</button>
                  <button onClick={() => handleDelete(t.id)} title="Supprimer" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "16px 0" }}>{t.price} $</p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.95rem" }}>
                {Object.entries(t.meetingCounts || {}).map(([mtId, qty]) => {
                  const mt = meetingTypes.find(type => type.id === mtId);
                  return mt ? (
                    <li key={mt.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: mt.color }}></div>
                      {mt.name} : <strong>{qty as any}</strong>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
