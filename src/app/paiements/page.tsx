"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaiementsPage() {
  const [mamans, setMamans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment form state
  const [activeMamanId, setActiveMamanId] = useState<string | null>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaymentInvoice, setNewPaymentInvoice] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("MEETING");
  const [newPaymentStatus, setNewPaymentStatus] = useState("PENDING");
  const [newPaymentIsExtra, setNewPaymentIsExtra] = useState(false);
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [newPaymentPaidAt, setNewPaymentPaidAt] = useState("");

  // Edit payment state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentData, setEditPaymentData] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const res = await fetch("/api/payments");
    if (res.ok) {
      setMamans(await res.json());
    }
    setLoading(false);
  };

  const handleAddPayment = async (e: React.FormEvent, mamanId: string) => {
    e.preventDefault();
    const res = await fetch(`/api/mamans/${mamanId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: newPaymentAmount,
        dueDate: newPaymentDate,
        invoiceNo: newPaymentInvoice,
        type: newPaymentType,
        status: newPaymentStatus,
        isExtra: newPaymentIsExtra,
        notes: newPaymentNotes,
        paidAt: newPaymentPaidAt || (newPaymentStatus === 'PAID' ? new Date().toISOString().split('T')[0] : null)
      })
    });
    if (res.ok) {
      setNewPaymentAmount(""); 
      setNewPaymentDate(new Date().toISOString().split('T')[0]); 
      setNewPaymentInvoice(""); 
      setNewPaymentNotes(""); 
      setNewPaymentPaidAt("");
      setActiveMamanId(null);
      setNewPaymentStatus("PENDING");
      setNewPaymentIsExtra(false);
      fetchPayments();
    }
  };

  const startEditPayment = (p: any) => {
    setEditingPaymentId(p.id);
    // Safer date splitting to avoid timezone offset
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
    const payload = { ...editPaymentData };
    if (payload.status === 'PAID' && !payload.paidAt) {
      payload.paidAt = new Date().toISOString().split('T')[0];
    }
    const res = await fetch(`/api/payments/${editingPaymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setEditingPaymentId(null);
      fetchPayments();
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    const payload: any = { status };
    if (status === 'PAID') {
      payload.paidAt = new Date().toISOString().split('T')[0];
    } else {
      payload.paidAt = null;
    }
    const res = await fetch(`/api/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) fetchPayments();
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
    if (res.ok) fetchPayments();
  };

  const getTypeName = (type: string) => {
    const TYPES: any = { PRE_NATAL: "Suivi Prénatal", POST_NATAL: "Suivi Postnatal", RELEVAILLE: "Relevaille", ACCOUCHEMENT: "Accouchement", GUARD: "Garde", MEETING: "Autre" };
    return TYPES[type] || type;
  };

  const STATUS_COLORS: any = { PAID: "#10b981", PENDING: "#f59e0b", OVERDUE: "#ef4444" };

  if (loading && mamans.length === 0) return <div className="animate-fade-in"><h1 className="page-title">Chargement...</h1></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Suivi Financier</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {mamans.map(maman => {
          const totalInvoiced = maman.packages.reduce((acc: number, p: any) => acc + p.price, 0);
          const totalPaid = maman.payments.filter((p: any) => !p.isExtra && p.status === 'PAID').reduce((acc: number, p: any) => acc + p.amount, 0);
          const totalExtras = maman.payments.filter((p: any) => p.isExtra).reduce((acc: number, p: any) => acc + p.amount, 0);
          
          // Removed filter to show all mamans
          
          const isAlaCarte = totalInvoiced === 0;
          const percentage = isAlaCarte ? (totalPaid > 0 ? 100 : 0) : Math.min(100, Math.round((totalPaid / totalInvoiced) * 100));
          const remaining = isAlaCarte ? 0 : totalInvoiced - totalPaid;
          const isAddFormOpen = activeMamanId === maman.id;

          return (
            <div key={maman.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Link href={`/mamans/${maman.id}`}>
                  <h2 style={{ margin: 0, color: 'var(--text)', textDecoration: 'none' }}>{maman.name}</h2>
                </Link>
                <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Facturé</span>
                    <div style={{ fontWeight: 'bold' }}>{isAlaCarte ? "À la carte" : `${totalInvoiced} $`}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payé (Forfait)</span>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>{totalPaid} $</div>
                  </div>
                  {totalExtras > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Extras</span>
                      <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{totalExtras} $</div>
                    </div>
                  )}
                  { !isAlaCarte && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reste dû</span>
                    <div style={{ fontWeight: 'bold', color: remaining > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{remaining > 0 ? remaining : 0} $</div>
                  </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {!isAlaCarte && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span>Progression Forfait ({percentage}%)</span>
                  <span>{percentage >= 100 ? 'Complété' : 'En cours'}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
              )}

              {/* Versements & Status */}
              {maman.payments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Versements :</span>
                  {maman.payments.map((p: any) => (
                    <div key={p.id} className="payment-row" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', position: 'relative', borderLeft: p.isExtra ? '4px solid #8b5cf6' : 'none' }}>
                      
                      {editingPaymentId === p.id ? (
                        <form onSubmit={handleUpdatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <div>
                               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Montant ($)</label>
                               <input type="number" step="0.01" value={editPaymentData.amount} onChange={e => setEditPaymentData({...editPaymentData, amount: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
                            </div>
                            <div>
                               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date Échéance</label>
                               <input type="date" value={editPaymentData.dueDate} onChange={e => setEditPaymentData({...editPaymentData, dueDate: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
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
                               <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date Paiement Réel</label>
                               <input type="date" value={editPaymentData.paidAt} onChange={e => setEditPaymentData({...editPaymentData, paidAt: e.target.value})} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }} />
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
                            <div>
                               <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{p.amount}$</span>
                               <span style={{ color: 'var(--text-muted)', marginLeft: "8px" }}>({getTypeName(p.type)}{p.isExtra ? ' - Hors forfait' : ''})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <select 
                                value={p.status} 
                                onChange={(e) => updatePaymentStatus(p.id, e.target.value)} 
                                style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', border: 'none', background: STATUS_COLORS[p.status], color: 'white', cursor: 'pointer' }}
                              >
                                <option value="PAID">Payé</option>
                                <option value="PENDING">En attente</option>
                                <option value="OVERDUE">En retard</option>
                              </select>
                              <button onClick={() => startEditPayment(p)} title="Modifier" style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>✎</button>
                              <button onClick={() => handleDeletePayment(p.id)} title="Supprimer" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                            </div>
                          </div>
                          <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                               Echéance: {new Date(p.dueDate).toLocaleDateString()} 
                               {p.paidAt && <span style={{ marginLeft: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Payé le: {new Date(p.paidAt).toLocaleDateString()}</span>}
                               {p.invoiceNo ? ` (#${p.invoiceNo})` : ''}
                             </span>
                             {p.notes && <span style={{ fontStyle: 'italic', color: 'var(--text)', background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '4px' }}>{p.notes}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton ou formulaire d'ajout */}
              {isAddFormOpen ? (
                 <form onSubmit={(e) => handleAddPayment(e, maman.id)} style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontWeight: 600, fontSize: "1rem" }}>Nouveau Versement</span>
                     <button type="button" onClick={() => setActiveMamanId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                   </div>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                     <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Montant ($)</label>
                        <input type="number" step="0.01" required placeholder="0.00" value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Date</label>
                        <input type="date" required value={newPaymentDate} onChange={e => setNewPaymentDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                     </div>
                   </div>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                     <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Type</label>
                        <select value={newPaymentType} onChange={e => setNewPaymentType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                          <option value="PRE_NATAL">Suivi Prénatal</option>
                          <option value="POST_NATAL">Suivi Postnatal</option>
                          <option value="RELEVAILLE">Relevaille</option>
                          <option value="ACCOUCHEMENT">Accouchement</option>
                          <option value="GUARD">Garde</option>
                          <option value="MEETING">Autre/Rencontre</option>
                        </select>
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Statut</label>
                        <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "white" }}>
                          <option value="PAID">Payé</option>
                          <option value="PENDING">En attente</option>
                          <option value="OVERDUE">En retard</option>
                        </select>
                     </div>
                   </div>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                         <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Note (optionnel)</label>
                         <input type="text" placeholder="Ex: Chèque, Virement..." value={newPaymentNotes} onChange={e => setNewPaymentNotes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                      </div>
                      <div>
                         <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Date paiement réel (si payé)</label>
                         <input type="date" value={newPaymentPaidAt} onChange={e => setNewPaymentPaidAt(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>N° Facture / Reçu</label>
                        <input type="text" placeholder="FAC-2024-..." value={newPaymentInvoice} onChange={e => setNewPaymentInvoice(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)" }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', marginTop: '18px' }}>
                        <input type="checkbox" checked={newPaymentIsExtra} onChange={e => setNewPaymentIsExtra(e.target.checked)} />
                        Hors forfait
                      </label>
                   </div>
                   <button type="submit" className="btn-primary" style={{ padding: "12px", marginTop: '8px' }}>Enregistrer</button>
                 </form>
              ) : (
                <button onClick={() => {setActiveMamanId(maman.id); setNewPaymentAmount(""); setNewPaymentDate(new Date().toISOString().split('T')[0]); setNewPaymentInvoice(""); setNewPaymentNotes(""); setNewPaymentStatus("PENDING"); setNewPaymentIsExtra(false); }} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem' }}>
                  + Nouveau Paiement
                </button>
              )}

            </div>
          );
        })}
        {mamans.length > 0 && mamans.every(m => m.packages.length === 0 && m.payments.length === 0) && (
          <p style={{ color: 'var(--text-muted)' }}>Aucun forfait ou paiement enregistré pour vos clientes.</p>
        )}
      </div>
    </div>
  );
}
