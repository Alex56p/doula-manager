"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ParametresPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [users, setUsers] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User Form State
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("USER");

  // MeetingType Form State
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeColor, setTypeColor] = useState("#f472b6");

  // Guard Settings State
  const [guardWeeksBefore, setGuardWeeksBefore] = useState(3);
  const [guardWeeksAfter, setGuardWeeksAfter] = useState(2);

  useEffect(() => {
    fetchData();
    fetchGuardSettings();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    if (isAdmin) {
      const resUsers = await fetch("/api/users");
      if (resUsers.ok) setUsers(await resUsers.json());
    }
    const resTypes = await fetch("/api/meeting-types");
    if (resTypes.ok) setMeetingTypes(await resTypes.json());
    setLoading(false);
  };

  const fetchGuardSettings = async () => {
    const res = await fetch("/api/user/settings");
    if (res.ok) {
      const settings = await res.json();
      setGuardWeeksBefore(settings.guardWeeksBefore);
      setGuardWeeksAfter(settings.guardWeeksAfter);
    }
  };

  const handleGuardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/user/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guardWeeksBefore, guardWeeksAfter })
    });
    if (res.ok) {
      alert("Paramètres de garde mis à jour !");
    }
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editTypeId ? `/api/meeting-types/${editTypeId}` : "/api/meeting-types";
    const res = await fetch(url, {
      method: editTypeId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: typeName, color: typeColor })
    });
    if (res.ok) {
      setEditTypeId(null);
      setTypeName(""); setTypeColor("#f472b6");
      fetchData();
    }
  };

  const deleteType = async (id: string) => {
    if (!confirm("Supprimer ce type de rencontre ?")) return;
    const res = await fetch(`/api/meeting-types/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editUserId ? `/api/users/${editUserId}` : "/api/users";
    const res = await fetch(url, {
      method: editUserId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: userPassword, name: userName, role: userRole })
    });
    if (res.ok) {
      alert(editUserId ? "Utilisateur mis à jour !" : "Utilisateur créé !");
      setEditUserId(null);
      setUserName(""); setUserEmail(""); setUserPassword("");
      fetchData();
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Paramètres</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* GUARD SETTINGS SECTION */}
        <div className="glass-panel">
          <h2>Configuration de la Garde</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Définissez la durée par défaut de votre période de garde autour de la DPA (ex: 37 à 42 semaines).
          </p>
          <form onSubmit={handleGuardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Semaines avant DPA</label>
                <input type="number" value={guardWeeksBefore} onChange={e => setGuardWeeksBefore(parseInt(e.target.value))} required min="0" max="10" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ex: 3 semaines (semaine 37)</span>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Semaines après DPA</label>
                <input type="number" value={guardWeeksAfter} onChange={e => setGuardWeeksAfter(parseInt(e.target.value))} required min="0" max="10" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ex: 2 semaines (semaine 42)</span>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Enregistrer les paramètres de garde</button>
          </form>
        </div>

        {/* MEETING TYPES SECTION */}
        <div className="glass-panel">
          <h2>Types de rencontres</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Gérez vos catégories de rendez-vous et leurs couleurs.
          </p>

          <form onSubmit={handleTypeSubmit} style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Nom du type</label>
              <input type="text" value={typeName} onChange={e => setTypeName(e.target.value)} required placeholder="Ex: Rencontre d'approche" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Couleur</label>
              <input type="color" value={typeColor} onChange={e => setTypeColor(e.target.value)} style={{ width: '100%', height: '38px', padding: '2px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'white', cursor: 'pointer' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', height: '38px' }}>
              {editTypeId ? "✓" : "+"}
            </button>
            {editTypeId && <button type="button" onClick={() => { setEditTypeId(null); setTypeName(""); }} className="btn-secondary" style={{ padding: '8px' }}>✕</button>}
          </form>

          {loading ? <p>Chargement...</p> : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {meetingTypes.map(t => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.5)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }}></div>
                    <span style={{ fontWeight: 500 }}>{t.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditTypeId(t.id); setTypeName(t.name); setTypeColor(t.color || "#f472b6"); }} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => deleteType(t.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* USERS SECTION (ADMIN ONLY) */}
        {isAdmin && (
          <div className="glass-panel">
            <h2>Gestion des Utilisateurs</h2>
            <form onSubmit={handleUserSubmit} style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px", background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '12px' }}>
              <input type="text" placeholder="Nom" required value={userName} onChange={e => setUserName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
              <input type="email" placeholder="Courriel" required value={userEmail} onChange={e => setUserEmail(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
              <input type="password" placeholder="Mot de passe (laisser vide si inchangé)" required={!editUserId} value={userPassword} onChange={e => setUserPassword(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)' }} />
              <select value={userRole} onChange={e => setUserRole(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'white' }}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editUserId ? "Modifier" : "Ajouter"}</button>
                {editUserId && <button type="button" onClick={() => setEditUserId(null)} className="btn-secondary">Annuler</button>}
              </div>
            </form>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.map(u => (
                <li key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.5)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "8px" }}>({u.role})</span>
                  </div>
                  <button onClick={() => { setEditUserId(u.id); setUserName(u.name); setUserEmail(u.email); setUserRole(u.role); }} className="btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Modifier</button>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
