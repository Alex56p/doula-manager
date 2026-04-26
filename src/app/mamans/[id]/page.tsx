"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SmartDateInput } from "@/components/SmartDateInput";
import { SmartDateTimeInput } from "@/components/SmartDateTimeInput";

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
  const [newEventDuration, setNewEventDuration] = useState("1");

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaymentInvoice, setNewPaymentInvoice] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("MEETING");
  const [newPaymentStatus, setNewPaymentStatus] = useState("PENDING");
  const [newPaymentIsExtra, setNewPaymentIsExtra] = useState(false);
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [newPaymentPaidAt, setNewPaymentPaidAt] = useState("");

  // Edit maman package state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editPackageData, setEditPackageData] = useState<any>(null);

  // Edit payment state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentData, setEditPaymentData] = useState<any>(null);

  const STATUS_LABELS: any = {
    UNCONFIRMED: "À confirmer",
    CONFIRMED: "Confirmé",
    POTENTIAL: "Potentiel",
    IN_GUARD: "En garde",
    POST_NATAL: "Post-natale",
    COMPLETED: "Terminé",
  };

  const PAY_STATUS_COLORS: any = { PAID: "#10b981", PENDING: "#f59e0b", OVERDUE: "#ef4444" };

  useEffect(() => {
    fetchMaman();
    fetchTemplates();
    fetchMeetingTypes();
  }, [id]);

  const fetchMaman = async () => {
    const res = await fetch(`/api/mamans/${id}?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setMaman(data);
      const formatDate = (d: any) => d ? new Date(d).toISOString().split('T')[0] : "";
      setEditData({
        name: data.name,
        contactInfo: data.contactInfo,
        status: data.status,
        dueDate: formatDate(data.dueDate),
        birthDate: formatDate(data.birthDate),
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

  // Improved Date Input Helper
  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>, valueSetter: (val: string) => void) => {
    const val = e.target.value;
    valueSetter(val);
    // If year has 4 digits, focus the next part (implementation depends on the specific input type)
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
    const payload = { ...editData };
    if (payload.dueDate && payload.dueDate.length === 10) payload.dueDate = new Date(payload.dueDate + 'T12:00:00').toISOString();
    if (payload.birthDate && payload.birthDate.length === 10) payload.birthDate = new Date(payload.birthDate + 'T12:00:00').toISOString();

    const res = await fetch(`/api/mamans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
    if (!newEventDate) {
      alert("Veuillez sélectionner une date.");
      return;
    }
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newEventTitle,
        meetingTypeId: newMeetingTypeId,
        date: new Date(newEventDate).toISOString(),
        duration: parseFloat(newEventDuration) || 1,
        motherId: id
      })
    });
    if (res.ok) {
      setNewEventTitle("");
      setNewEventDate("");
      setNewEventDuration("1");
      setShowEventForm(false);
      // Wait a bit to ensure DB transaction is visible in Next.js caching layers if any
      setTimeout(() => fetchMaman(), 300);
    } else {
      const err = await res.json();
      alert("Erreur lors de l'enregistrement de la rencontre : " + (err.error || "Erreur inconnue"));
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/mamans/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: newPaymentAmount,
        dueDate: newPaymentDate ? new Date(newPaymentDate + (newPaymentDate.length === 10 ? 'T12:00:00' : '')).toISOString() : undefined,
        invoiceNo: newPaymentInvoice,
        type: newPaymentType,
        status: newPaymentStatus,
        isExtra: newPaymentIsExtra,
        notes: newPaymentNotes,
        paidAt: newPaymentPaidAt ? new Date(newPaymentPaidAt + (newPaymentPaidAt.length === 10 ? 'T12:00:00' : '')).toISOString() : (newPaymentStatus === 'PAID' ? new Date().toISOString() : null)
      })
    });
    if (res.ok) {
      setNewPaymentAmount(""); 
      setNewPaymentDate(new Date().toISOString().split('T')[0]); 
      setNewPaymentInvoice(""); 
      setNewPaymentNotes(""); 
      setNewPaymentPaidAt(""); 
      setShowPaymentForm(false);
      setNewPaymentStatus("PENDING");
      setNewPaymentIsExtra(false);
      fetchMaman();
    }
  };

  const startEditPayment = (p: any) => {
    setEditingPaymentId(p.id);
    const formatDate = (d: any) => d ? new Date(d).toISOString().split('T')[0] : "";
    setEditPaymentData({
      amount: p.amount,
      dueDate: formatDate(p.dueDate),
      invoiceNo: p.invoiceNo || "",
      type: p.type,
      status: p.status,
      isExtra: p.isExtra,
      notes: p.notes || "",
      paidAt: formatDate(p.paidAt)
    });
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...editPaymentData };
    if (payload.dueDate && payload.dueDate.length === 10) payload.dueDate = new Date(payload.dueDate + 'T12:00:00').toISOString();
    if (payload.paidAt && payload.paidAt.length === 10) payload.paidAt = new Date(payload.paidAt + 'T12:00:00').toISOString();
    if (payload.status === 'PAID' && !payload.paidAt) {
      payload.paidAt = new Date().toISOString();
    }
    const res = await fetch(`/api/payments/${editingPaymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setEditingPaymentId(null);
      fetchMaman();
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    const payload: any = { status };
    if (status === 'PAID') {
      payload.paidAt = new Date().toISOString();
    } else {
      payload.paidAt = null;
    }
    const res = await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) fetchMaman();
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
    if (res.ok) fetchMaman();
  };

  const handleUpdateEventNotes = async (eventId: string, notes: string) => {
    await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      setTimeout(() => fetchMaman(), 300);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette rencontre ?")) return;
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      setTimeout(() => fetchMaman(), 300);
    } else {
      alert("Erreur lors de la suppression.");
    }
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

  const totalInvoiced = maman.packages.reduce((acc: number, p: any) => acc + p.price, 0);
  const totalPaid = maman.payments.filter((p: any) => !p.isExtra && p.status === 'PAID').reduce((acc: number, p: any) => acc + p.amount, 0);
  const totalExtras = maman.payments.filter((p: any) => p.isExtra).reduce((acc: number, p: any) => acc + p.amount, 0);
  const isAlaCarte = totalInvoiced === 0;
  const remaining = isAlaCarte ? 0 : totalInvoiced - totalPaid;
  const percentage = isAlaCarte ? (totalPaid > 0 ? 100 : 0) : Math.min(100, Math.round((totalPaid / totalInvoiced) * 100));


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
                  <SmartDateInput label="DPA (Date Prévue)" value={editData.dueDate} onChange={v => setEditData({...editData, dueDate: v})} />
                </div>
                <div>
                  <SmartDateInput label="Date de naissance (réelle)" value={editData.birthDate} onChange={v => setEditData({...editData, birthDate: v})} />
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
               <div key={p.id}>
                 {editingPackageId === p.id ? (
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     const res = await fetch(`/api/mother-packages/${p.id}`, {
                       method: "PUT",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify(editPackageData)
                     });
                     if (res.ok) {
                       setEditingPackageId(null);
                       fetchMaman();
                     }
                   }} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'white', borderRadius: '12px' }}>
                     <input type="text" value={editPackageData.name} onChange={e => setEditPackageData({...editPackageData, name: e.target.value})} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><label style={{fontSize: '0.7rem'}}>Pré-natales</label><input type="number" value={editPackageData.prenatalCount} onChange={e => setEditPackageData({...editPackageData, prenatalCount: e.target.value})} style={{width: '100%', padding: '4px'}} /></div>
                        <div><label style={{fontSize: '0.7rem'}}>Post-natales</label><input type="number" value={editPackageData.postnatalCount} onChange={e => setEditPackageData({...editPackageData, postnatalCount: e.target.value})} style={{width: '100%', padding: '4px'}} /></div>
                        <div><label style={{fontSize: '0.7rem'}}>Relevaille</label><input type="number" value={editPackageData.relevailleCount} onChange={e => setEditPackageData({...editPackageData, relevailleCount: e.target.value})} style={{width: '100%', padding: '4px'}} /></div>
                        <div><label style={{fontSize: '0.7rem'}}>Garde (jours)</label><input type="number" value={editPackageData.guardDays} onChange={e => setEditPackageData({...editPackageData, guardDays: e.target.value})} style={{width: '100%', padding: '4px'}} /></div>
                     </div>
                     <input type="number" step="0.01" value={editPackageData.price} onChange={e => setEditPackageData({...editPackageData, price: e.target.value})} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '4px' }}>Sauvegarder</button>
                        <button type="button" onClick={() => setEditingPackageId(null)} className="btn-secondary" style={{ flex: 1, padding: '4px' }}>Annuler</button>
                     </div>
                   </form>
                 ) : (
                   <div className="package-card-mini" onClick={() => { setEditingPackageId(p.id); setEditPackageData({ name: p.name, prenatalCount: p.prenatalCount, postnatalCount: p.postnatalCount, guardDays: p.guardDays, relevailleCount: p.relevailleCount, price: p.price }); }} style={{ padding: "12px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", marginBottom: "8px", cursor: 'pointer' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{p.name}{p.isCustom ? ' (Custom)' : ''}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Modifier ✎</span>
                     </div>
                     <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0" }}>{p.price}$</p>
                     <p style={{ fontSize: "0.75rem", margin: 0 }}>Quotas: {p.prenatalCount} pre / {p.postnatalCount} post / {p.relevailleCount} rel / {p.guardDays} jrs garde</p>
                   </div>
                 )}
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

          {/* Suivi des Paiements */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
              <h2 style={{ margin: 0 }}>Paiements</h2>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Facturé : </span>
                <span style={{ fontWeight: "bold" }}>{isAlaCarte ? "À la carte" : `${totalInvoiced}$`}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                <span>{isAlaCarte ? "Total payé :" : "Restant dû :"} <strong style={{ color: remaining > 0 ? 'var(--primary)' : 'inherit' }}>{isAlaCarte ? `${totalPaid}$` : (remaining > 0 ? remaining : 0) + "$"}</strong></span>
                {!isAlaCarte && <span>{percentage}% payé</span>}
              </div>
              {!isAlaCarte && (
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--success)', transition: 'width 0.5s ease' }}></div>
              </div>
              )}
            </div>

            {maman.payments.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', padding: "12px", background: "white", borderRadius: "10px", border: "1px solid var(--glass-border)", marginBottom: "8px", borderLeft: p.isExtra ? '4px solid #8b5cf6' : 'none' }}>
                
                {editingPaymentId === p.id ? (
                  <form onSubmit={handleUpdatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Montant ($)</label>
                        <input type="number" step="0.01" value={editPaymentData.amount} onChange={e => setEditPaymentData({...editPaymentData, amount: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
                      </div>
                      <div>
                        <SmartDateInput label="Date Échéance" value={editPaymentData.dueDate} onChange={v => setEditPaymentData({...editPaymentData, dueDate: v})} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Statut</label>
                        <select value={editPaymentData.status} onChange={e => setEditPaymentData({...editPaymentData, status: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}>
                          <option value="PAID">Payé</option>
                          <option value="PENDING">En attente</option>
                          <option value="OVERDUE">En retard</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Type</label>
                        <select value={editPaymentData.type} onChange={e => setEditPaymentData({...editPaymentData, type: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}>
                          <option value="PRE_NATAL">Suivi Prénatal</option>
                          <option value="POST_NATAL">Suivi Postnatal</option>
                          <option value="RELEVAILLE">Relevaille</option>
                          <option value="ACCOUCHEMENT">Accouchement</option>
                          <option value="GUARD">Garde</option>
                          <option value="MEETING">Autre/Rencontre</option>
                        </select>
                      </div>
                      <div>
                        <SmartDateInput label="Paiement Réel" value={editPaymentData.paidAt} onChange={v => setEditPaymentData({...editPaymentData, paidAt: v})} />
                      </div>
                    </div>
                    <div>
                       <input type="text" placeholder="Note (optionnel)" value={editPaymentData.notes} onChange={e => setEditPaymentData({...editPaymentData, notes: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1, padding: '4px' }}>Sauvegarder</button>
                      <button type="button" onClick={() => setEditingPaymentId(null)} className="btn-secondary" style={{ flex: 1, padding: '4px' }}>Annuler</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{p.amount}$ <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "var(--text-muted)", marginLeft: "8px", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>{getTypeName(p.type, p.type)}{p.isExtra ? ' (Ext)' : ''}</span></p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                           Echéance: {new Date(p.dueDate).toLocaleDateString()} 
                           {p.paidAt && <span style={{ marginLeft: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Payé le: {new Date(p.paidAt).toLocaleDateString()}</span>}
                           {p.invoiceNo ? ` (#${p.invoiceNo})` : ""}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <select 
                          value={p.status} 
                          onChange={(e) => updatePaymentStatus(p.id, e.target.value)} 
                          style={{ fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px', border: 'none', background: PAY_STATUS_COLORS[p.status], color: 'white' }}
                        >
                          <option value="PAID">Payé</option>
                          <option value="PENDING">En attente</option>
                          <option value="OVERDUE">Retard</option>
                        </select>
                        <button onClick={() => startEditPayment(p)} title="Modifier" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem' }}>✎</button>
                        <button onClick={() => handleDeletePayment(p.id)} style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                      </div>
                    </div>
                    {p.notes && <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.03)', padding: '4px 8px', borderRadius: '4px' }}>Note: {p.notes}</p>}
                  </>
                )}
              </div>
            ))}

            <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="btn-secondary" style={{ width: "100%", marginTop: "8px" }}>
              {showPaymentForm ? "Fermer" : "+ Ajouter Paiement"}
            </button>

            {showPaymentForm && (
              <form onSubmit={handleAddPayment} style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" step="0.01" required placeholder="Montant ($)" value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                  <SmartDateInput value={newPaymentDate} onChange={setNewPaymentDate} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select value={newPaymentType} onChange={e => setNewPaymentType(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                    <option value="PRE_NATAL">Suivi Prénatal</option>
                    <option value="POST_NATAL">Suivi Postnatal</option>
                    <option value="RELEVAILLE">Relevaille</option>
                    <option value="ACCOUCHEMENT">Accouchement</option>
                    <option value="GUARD">Garde</option>
                    <option value="MEETING">Autre/Rencontre</option>
                  </select>
                  <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                    <option value="PAID">Payé</option>
                    <option value="PENDING">En attente</option>
                    <option value="OVERDUE">En retard</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Facture #" value={newPaymentInvoice} onChange={e => setNewPaymentInvoice(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                  <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newPaymentIsExtra} onChange={e => setNewPaymentIsExtra(e.target.checked)} />
                    Hors forfait
                  </label>
                </div>
                <div>
                   <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Note (optionnel)</label>
                   <input type="text" placeholder="Ex: Chèque, Virement..." value={newPaymentNotes} onChange={e => setNewPaymentNotes(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                </div>
                <div>
                   <SmartDateInput label="Date paiement réel (si payé)" value={newPaymentPaidAt} onChange={setNewPaymentPaidAt} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>Enregistrer</button>
              </form>
            )}
          </div>
        </div>

        {/* Rencontres et Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-panel">
            <h2 style={{ marginBottom: "16px" }}>Progression du Forfait</h2>
            {maman.packages.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Aucun forfait assigné pour le suivi de progression.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {maman.packages.map((pkg: any) => {
                  const categories = [
                    { label: 'Prénatal', key: 'prenatalCount', type: 'PRE_NATAL', searchTerms: ['PRENATAL', 'PRÉNATAL'] },
                    { label: 'Postnatal', key: 'postnatalCount', type: 'POST_NATAL', searchTerms: ['POSTNATAL', 'POST-NATAL'] },
                    { label: 'Relevaille', key: 'relevailleCount', type: 'RELEVAILLE', searchTerms: ['RELEVAILLE'] },
                  ];

                  const getStats = (cat: any) => {
                    const relatedEvents = maman.events.filter((e: any) => {
                      const mType = meetingTypes.find(mt => mt.id === e.meetingTypeId);
                      if (e.type === cat.type) return true;
                      if (!mType) return false;
                      const uName = mType.name.toUpperCase();
                      return cat.searchTerms.some((term: string) => uName.includes(term));
                    });
                    const completed = relatedEvents.filter((e: any) => e.status === 'COMPLETED').reduce((acc: number, e: any) => acc + (e.duration || 1), 0);
                    const scheduled = relatedEvents.filter((e: any) => e.status === 'SCHEDULED' || e.status === 'POTENTIAL').reduce((acc: number, e: any) => acc + (e.duration || 1), 0);
                    return { completed, scheduled };
                  };

                  // Logique de progression pour la Garde : basé sur le temps par rapport à la DPA/Accouchement
                  const getGardeProgression = () => {
                    if (maman.birthDate || maman.status === 'POST_NATAL') return { percent: 100, label: "Terminée (Accouchement)" };
                    if (!maman.guardPeriodStart || !maman.dueDate) return { percent: 0, label: "Non débutée (Aucune DPA)" };
                    
                    const start = new Date(maman.guardPeriodStart).getTime();
                    const end = new Date(maman.dueDate).getTime();
                    const now = new Date().getTime();
                    
                    if (now < start) {
                      const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
                      return { percent: 0, label: `En attente (${daysUntil} jrs avant début)` };
                    }
                    if (now >= end) return { percent: 100, label: "DPA atteinte/dépassée" };
                    
                    const total = end - start;
                    const elapsed = now - start;
                    const percent = Math.round((elapsed / total) * 100);
                    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                    return { percent, label: `${daysLeft} jrs restants avant DPA` };
                  };

                  return (
                    <div key={pkg.id} style={{ background: 'rgba(255,255,255,0.3)', padding: '12px', borderRadius: '12px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '12px' }}>{pkg.name}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>


                        {/* Custom Meeting Types Progression */}
                        {Object.entries(pkg.meetingCounts || {}).map(([mtId, val]) => {
                          const total = val as number;
                          if (total <= 0) return null;
                          const mt = meetingTypes.find((t: any) => t.id === mtId);
                          if (!mt) return null;
                          
                          const relatedEvents = maman.events.filter((e: any) => e.meetingTypeId === mtId);
                          const completed = relatedEvents.filter((e: any) => e.status === 'COMPLETED').reduce((acc: number, e: any) => acc + (e.duration || 1), 0);
                          const scheduled = relatedEvents.filter((e: any) => e.status === 'SCHEDULED' || e.status === 'POTENTIAL').reduce((acc: number, e: any) => acc + (e.duration || 1), 0);
                          const remaining = Math.max(0, total - (completed + scheduled));
                          const color = mt.color || "var(--primary)";

                          return (
                            <div key={mtId} style={{ fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color}}></div>
                                  {mt.name}
                                </span>
                                <span>{completed + scheduled} / {total}</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ height: '100%', width: `${(completed / total) * 100}%`, background: 'var(--success)' }} title="Complété"></div>
                                <div style={{ height: '100%', width: `${(scheduled / total) * 100}%`, background: color, opacity: 0.6 }} title="Planifié"></div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                                <span title="Nombre de rencontres terminées">✅ {completed} Complété</span>
                                <span title="Nombre de rencontres planifiées">🕒 {scheduled} Planifié</span>
                                <span title="Reste à planifier">🆓 {remaining} Reste</span>
                              </div>
                            </div>
                          );
                        })}
                        {/* Garde special progression */}
                        {pkg.guardDays > 0 && (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>Garde (Progression)</span>
                              <span>{getGardeProgression().percent}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                              <div style={{ height: '100%', width: `${getGardeProgression().percent}%`, background: '#22d3ee', transition: 'width 0.5s ease' }} title="Temps écoulé"></div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                              <span title="Statut actuel de la garde">⏳ {getGardeProgression().label}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
                  <SmartDateTimeInput label="Date" value={newEventDate} onChange={setNewEventDate} />
                </div>
                {meetingTypes.find(t => t.id === newMeetingTypeId)?.name.toUpperCase().includes('GARDE') && (
                  <div>
                    <label style={{ display: "block", marginBottom: "4px" }}>Durée (jours)</label>
                    <input type="number" step="0.1" value={newEventDuration} onChange={e => setNewEventDuration(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                  </div>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="btn-primary">Enregistrer la rencontre</button>
                </div>
              </form>
            </div>
          )}

          {maman.events.map((event: any) => (
            <div key={event.id} className="glass-panel" style={{ borderLeft: "4px solid var(--secondary)", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                  <Link href={`/rencontres/${event.id}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                    {event.title} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>({getTypeName(event.meetingTypeId, event.type)})</span>
                  </Link>
                  <select 
                    value={event.status} 
                    onChange={(e) => handleUpdateEventStatus(event.id, e.target.value)}
                    style={{ fontSize: "0.75rem", padding: "4px", borderRadius: "6px", background: "white", border: "1px solid var(--glass-border)", color: "var(--text)" }}
                  >
                    <option value="SCHEDULED">Prévue</option>
                    <option value="COMPLETED">Terminée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "0.9rem" }}>{new Date(event.date).toLocaleDateString('fr-FR')} - {new Date(event.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <button onClick={() => handleDeleteEvent(event.id)} style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: "1rem" }} title="Supprimer">✕</button>
                </div>
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
