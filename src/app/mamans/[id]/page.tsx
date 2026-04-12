"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function MamanDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [maman, setMaman] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // New event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newMeetingTypeId, setNewMeetingTypeId] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const STATUS_LABELS: any = {
    UNCONFIRMED: "À confirmer",
    CONFIRMED: "Confirmé",
    POTENTIAL: "Potentiel",
    IN_GUARD: "En garde",
    POST_NATAL: "Post-natale",
    COMPLETED: "Terminé",
  };

  useEffect(() => {
    fetchMaman();
    fetchTemplates();
    fetchMeetingTypes();
  }, [id]);

  const fetchMaman = async () => {
    const res = await fetch(`/api/mamans/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMaman(data);
      setEditData({
        name: data.name,
        contactInfo: data.contactInfo,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : "",
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : "",
        birthDuration: data.birthDuration || "",
        childrenCount: data.childrenCount,
        partnerName: data.partnerName || "",
        partnerContact: data.partnerContact || ""
      });
    } else {
      alert("Erreur de chargement ou aucune permission.");
      router.push("/mamans");
    }
    setLoading(false);
  };

  const fetchTemplates = async () => {
    const res = await fetch("/api/packages/templates");
    if (res.ok) {
      setTemplates(await res.json());
    }
  };

  const fetchMeetingTypes = async () => {
    const res = await fetch("/api/meeting-types");
    if (res.ok) {
      const data = await res.json();
      setMeetingTypes(data);
      if (data.length > 0) setNewMeetingTypeId(data[0].id);
    }
  };

  const handleSaveMaman = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/mamans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setIsEditing(false);
      fetchMaman();
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedTemplateId) return;
    const res = await fetch(`/api/mamans/${id}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selectedTemplateId })
    });
    if (res.ok) {
      setShowPackageForm(false);
      fetchMaman();
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newEventTitle,
        meetingTypeId: newMeetingTypeId,
        date: newEventDate,
        motherId: id
      })
    });
    if (res.ok) {
      setNewEventTitle("");
      setNewEventDate("");
      setShowEventForm(false);
      fetchMaman();
    }
  };

  const handleUpdateEventNotes = async (eventId: string, notes: string) => {
    await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
  };

  const getTypeName = (typeId: string, legacyType: string) => {
    const LEGACY_MAPPING: any = {
      PRE_NATAL: "Suivi prénatal",
      POST_NATAL: "Suivi postnatal",
      RELEVAILLE: "Relevaille",
      ACCOUCHEMENT: "Accouchement",
      MEETING: "Rencontre",
      GUARD: "Garde"
    };
    const found = meetingTypes.find(t => t.id === typeId);
    if (found) return found.name;
    return LEGACY_MAPPING[legacyType] || legacyType;
  };

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette fiche ?")) {
      const res = await fetch(`/api/mamans/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/mamans");
    }
  };

  if (loading) return <div className="animate-fade-in"><h1 className="page-title">Chargement...</h1></div>;
  if (!maman) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: "32px" }}>
        <div>
          <button onClick={() => router.push("/mamans")} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            ← Retour à la liste
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Fiche Cliente : {maman.name}</h1>
        </div>
        <button onClick={handleDelete} className="btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
          Supprimer la fiche
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        
        {/* Informations Colonne */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Informations</h2>
              {!isEditing && (
                <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => setIsEditing(true)}>
                  Modifier
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSaveMaman} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Nom</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Statut</label>
                  <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "white" }}>
                    {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Contact (Mère)</label>
                  <input type="text" value={editData.contactInfo} onChange={e => setEditData({...editData, contactInfo: e.target.value})} required style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>DPA (Date Prévue)</label>
                  <input type="date" value={editData.dueDate} onChange={e => setEditData({...editData, dueDate: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Date de naissance (réelle)</label>
                  <input type="date" value={editData.birthDate} onChange={e => setEditData({...editData, birthDate: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Durée de l'accouchement</label>
                  <input type="text" placeholder="Ex: 14h" value={editData.birthDuration} onChange={e => setEditData({...editData, birthDuration: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", display: "block" }}>Enfants à charge</label>
                  <input type="number" min="0" value={editData.childrenCount} onChange={e => setEditData({...editData, childrenCount: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem" }}>Partenaire / Ressource</h3>
                  <input type="text" placeholder="Nom" value={editData.partnerName} onChange={e => setEditData({...editData, partnerName: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px", marginBottom: '8px' }} />
                  <input type="text" placeholder="Contact" value={editData.partnerContact} onChange={e => setEditData({...editData, partnerContact: e.target.value})} style={{ width: "100%", padding: "6px", borderRadius: "6px" }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: "8px" }}>Enregistrer</button>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => {setIsEditing(false); fetchMaman();}}>Annuler</button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p><strong>Statut:</strong> <span style={{ color: "var(--primary)"}}>{STATUS_LABELS[maman.status]}</span></p>
                <p><strong>Contact:</strong> {maman.contactInfo}</p>
                <p><strong>DPA:</strong> {maman.dueDate ? new Date(maman.dueDate).toLocaleDateString('fr-FR') : "Non définie"}</p>
                {maman.birthDate && (
                  <>
                    <p><strong>Date de naissance:</strong> {new Date(maman.birthDate).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Durée accouchement:</strong> {maman.birthDuration || "N/A"}</p>
                  </>
                )}
                <p><strong>Partenaire:</strong> {maman.partnerName || "N/A"} {maman.partnerContact ? `(${maman.partnerContact})` : ""}</p>
              </div>
            )}
          </div>
          
          <div className="glass-panel">
            <h2 style={{ marginBottom: "16px" }}>Forfaits</h2>
             {maman.packages.map((p: any) => (
               <div key={p.id} style={{ padding: "10px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", marginBottom: "8px" }}>
                 <p style={{ fontWeight: 600 }}>{p.name}</p>
                 <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.price}$</p>
               </div>
             ))}
             <button onClick={() => setShowPackageForm(!showPackageForm)} className="btn-secondary" style={{ width: "100%", marginTop: "8px" }}>+ Assigner Forfait</button>
             {showPackageForm && (
               <div style={{ marginTop: "12px" }}>
                 <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", marginBottom: "8px" }}>
                   <option value="">Sélectionner un modèle...</option>
                   {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
                 <button onClick={handleAssignPackage} className="btn-primary" style={{ width: "100%" }}>Confirmer</button>
               </div>
             )}
          </div>
        </div>

        {/* Rencontres et Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Rencontres</h2>
            <button className="btn-primary" onClick={() => setShowEventForm(!showEventForm)}>
              {showEventForm ? "Fermer" : "+ Nouvelle Rencontre"}
            </button>
          </div>

          {showEventForm && (
            <div className="glass-panel" style={{ borderLeft: "4px solid var(--primary)" }}>
              <form onSubmit={handleAddEvent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>Titre</label>
                  <input type="text" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px" }}>Type de rencontre</label>
                  <select value={newMeetingTypeId} onChange={e => setNewMeetingTypeId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                    {meetingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px" }}>Date</label>
                  <input type="datetime-local" required value={newEventDate} onChange={e => setNewEventDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-primary">Enregistrer la rencontre</button>
                </div>
              </form>
            </div>
          )}

          {maman.events.map((event: any) => (
            <div key={event.id} className="glass-panel" style={{ borderLeft: "4px solid var(--secondary)", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>
                  <Link href={`/rencontres/${event.id}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                    {event.title} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>({getTypeName(event.meetingTypeId, event.type)})</span>
                  </Link>
                </h3>
                <span style={{ fontSize: "0.9rem" }}>{new Date(event.date).toLocaleDateString('fr-FR')} - {new Date(event.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <EventNotesInput event={event} onUpdate={handleUpdateEventNotes} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventNotesInput({ event, onUpdate }: { event: any, onUpdate: (id: string, notes: string) => void }) {
  const [notes, setNotes] = useState(event.notes || "");
  const [saving, setSaving] = useState(false);

  const handleBlur = async () => {
    if (notes !== event.notes) {
      setSaving(true);
      await onUpdate(event.id, notes);
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Notes de la rencontre..."
        style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.4)", fontFamily: "inherit" }}
      />
      {saving && <span style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "0.7rem", color: "var(--success)" }}>Enregistré</span>}
    </div>
  );
}
