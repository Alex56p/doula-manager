"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RencontreDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [meetingTypeId, setMeetingTypeId] = useState("");

  useEffect(() => {
    fetchEvent();
    fetchMeetingTypes();
  }, [id]);

  const fetchEvent = async () => {
    const res = await fetch(`/api/events/${id}`);
    if (res.ok) {
      const data = await res.json();
      setEvent(data);
      setNotes(data.notes || "");
      setStatus(data.status);
      setMeetingTypeId(data.meetingTypeId || "");
      setDate(new Date(data.date).toISOString().slice(0, 16));
    } else {
      router.push("/calendrier");
    }
  };

  const fetchMeetingTypes = async () => {
    const res = await fetch("/api/meeting-types");
    if (res.ok) {
      setMeetingTypes(await res.json());
    }
    setLoading(false);
  };

  const handleUpdate = async (fields: any) => {
    setSaving(true);
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      const updated = await res.json();
      if (fields.notes !== undefined) setNotes(updated.notes);
      if (fields.status !== undefined) setStatus(updated.status);
      if (fields.meetingTypeId !== undefined) setMeetingTypeId(updated.meetingTypeId);
      if (fields.date !== undefined) setDate(new Date(updated.date).toISOString().slice(0, 16));
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-fade-in"><h1 className="page-title">Chargement...</h1></div>;
  if (!event) return null;

  const maman = event.mother;

  const STATUS_LABELS: any = {
    SCHEDULED: "Prévue",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={() => router.push(`/mamans/${maman.id}`)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            ← Retour à la fiche de {maman.name}
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Rencontre : {maman.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {saving && <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Enregistrement...</span>}
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Statut :</label>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); handleUpdate({ status: e.target.value }); }}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'white' }}
            >
              {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Notes de rencontre</h2>
              <select 
                value={meetingTypeId} 
                onChange={(e) => { setMeetingTypeId(e.target.value); handleUpdate({ meetingTypeId: e.target.value }); }}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white' }}
              >
                <option value="">Sélectionner le type...</option>
                {meetingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => handleUpdate({ notes })}
              placeholder="Écrivez vos notes ici..."
              style={{ 
                width: '100%', height: '400px', padding: '20px', borderRadius: '12px', 
                border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.4)', 
                fontSize: '1rem', lineHeight: '1.6', resize: 'none', fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="glass-panel">
            <h3>Détails logistiques</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <label>Date & Heure :</label>
              <input 
                type="datetime-local" 
                value={date} 
                onChange={(e) => { setDate(e.target.value); handleUpdate({ date: e.target.value }); }}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h2>Client : {maman.name}</h2>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>Contact:</strong> {maman.contactInfo}</p>
              <p><strong>DPA:</strong> {maman.dueDate ? new Date(maman.dueDate).toLocaleDateString('fr-FR') : "N/D"}</p>
              <p><strong>Statut:</strong> {maman.status}</p>
              <button 
                onClick={() => router.push(`/mamans/${maman.id}`)} 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '8px' }}
              >
                Ouvrir la fiche complète
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
