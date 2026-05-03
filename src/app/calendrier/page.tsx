"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CalendrierPage() {
  const [data, setData] = useState<{events: any[], mothers: any[], payments: any[]}>({events: [], mothers: [], payments: []});
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resEvt, resTypes] = await Promise.all([
      fetch("/api/events/all"),
      fetch("/api/meeting-types")
    ]);
    if (resEvt.ok) setData(await resEvt.json());
    if (resTypes.ok) setMeetingTypes(await resTypes.json());
    setLoading(false);
  };

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const totalSlots = firstDayOfMonth + daysInMonth;
  const numWeeks = Math.ceil(totalSlots / 7);

  const weeks = [];
  let dayCounter = 1;
  for (let w = 0; w < numWeeks; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const slotIndex = w * 7 + d;
      if (slotIndex < firstDayOfMonth || dayCounter > daysInMonth) {
        days.push(null);
      } else {
        days.push(dayCounter++);
      }
    }
    weeks.push(days);
  }

  const COLORS = ["#f472b6", "#fb923c", "#8b5cf6", "#3b82f6", "#10b981", "#f43f5e", "#06b6d4"];
  const getMamanColor = (mamanId: string) => {
    const hash = mamanId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  const isMamanInGuard = (maman: any, date: Date) => {
    if (!maman.guardPeriodStart || !maman.guardPeriodEnd) return false;
    const s = new Date(maman.guardPeriodStart);
    const e = new Date(maman.guardPeriodEnd);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    return d >= start && d <= end;
  };

  const isSameDay = (dateSource: Date | string, day: number, month: number, year: number, isDateOnly: boolean = false) => {
    const d = new Date(dateSource);
    if (isNaN(d.getTime())) return false;
    if (isDateOnly) {
      return d.getUTCDate() === day && d.getUTCMonth() === month && d.getUTCFullYear() === year;
    } else {
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    }
  };

  const isToday = (day: number) => {
    const t = new Date();
    return t.getDate() === day && t.getMonth() === month && t.getFullYear() === year;
  };

  const getTypeName = (type: string) => {
    const found = meetingTypes.find(t => t.id === type || t.name === type);
    if (found) return found.name;
    return type;
  };

  // Group events by day for list view
  const agendaItems = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = data.events.filter(e => isSameDay(e.date, d, month, year, false));
    const dayPayments = data.payments.filter(p => isSameDay(p.paidAt || p.dueDate, d, month, year, false));
    const dpaMothers = data.mothers.filter(m => m.dueDate && isSameDay(m.dueDate, d, month, year, true));
    const guards = data.mothers.filter(m => isMamanInGuard(m, new Date(year, month, d)));

    if (dayEvents.length > 0 || dayPayments.length > 0 || dpaMothers.length > 0 || guards.length > 0) {
      agendaItems.push({ day: d, events: dayEvents, payments: dayPayments, dpa: dpaMothers, guards });
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: 'wrap', gap: '16px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Calendrier Doula</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className="btn-secondary" onClick={prevMonth}>{"<"}</button>
          <h2 style={{ minWidth: "150px", textAlign: "center", margin: 0, fontSize: '1.2rem' }}>{monthNames[month]} {year}</h2>
          <button className="btn-secondary" onClick={nextMonth}>{">"}</button>
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="desktop-only">
        <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid var(--glass-border)" }}>
            {dayNames.map(d => (
              <div key={d} style={{ padding: "12px", textAlign: "center", fontWeight: "bold", fontSize: "0.85rem", color: "var(--text-muted)" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {weeks.map((week, wIdx) => {
              const segments: any[] = [];
              data.mothers.forEach(m => {
                let startIdx: number | null = null;
                week.forEach((day, dIdx) => {
                  if (day && isMamanInGuard(m, new Date(year, month, day))) {
                    if (startIdx === null) startIdx = dIdx;
                    if (dIdx === 6) { segments.push({ start: startIdx, end: 6, mamanName: m.name, mamanId: m.id }); startIdx = null; }
                  } else if (startIdx !== null) {
                    segments.push({ start: startIdx, end: dIdx - 1, mamanName: m.name, mamanId: m.id });
                    startIdx = null;
                  }
                });
                if (startIdx !== null) segments.push({ start: startIdx, end: 6, mamanName: m.name, mamanId: m.id });
              });

              return (
                <div key={wIdx} style={{ position: "relative", minHeight: "140px", borderBottom: "1px solid var(--glass-border)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                    {week.map((day, dIdx) => (
                      <div key={dIdx} style={{ padding: "8px", borderRight: dIdx < 6 ? "1px solid var(--glass-border)" : "none", background: day && isToday(day) ? "rgba(244, 114, 182, 0.05)" : "transparent" }}>
                        {day && <span style={{ fontSize: "0.85rem", color: isToday(day) ? "var(--primary)" : "var(--text-muted)", fontWeight: isToday(day) ? "bold" : "normal" }}>{day}</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "relative", zIndex: 1, paddingTop: "28px", paddingBottom: "4px" }}>
                    {segments.map((seg, sIdx) => (
                      <div key={sIdx} style={{ gridColumnStart: seg.start + 1, gridColumnEnd: seg.end + 2, background: `${getMamanColor(seg.mamanId)}15`, borderTop: `1px solid ${getMamanColor(seg.mamanId)}30`, padding: "2px 8px", fontSize: "0.65rem", color: getMamanColor(seg.mamanId), fontWeight: "600", marginBottom: '1px' }}>
                        🛡️ {seg.mamanName}
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                      {week.map((day, dIdx) => (
                        <div key={dIdx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {day && data.events.filter(e => isSameDay(e.date, day, month, year, false)).map(e => (
                            <Link key={e.id} href={`/rencontres/${e.id}`}>
                              <div style={{ fontSize: "0.7rem", padding: "2px 4px", borderRadius: "3px", background: getMamanColor(e.motherId), color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {new Date(e.date).getHours()}h {e.mother.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Agenda View */}
      <div className="mobile-only">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {agendaItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Aucun événement pour ce mois.</p>
          ) : (
            agendaItems.map(item => (
              <div key={item.day} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isToday(item.day) ? 'var(--primary)' : 'var(--text-color)' }}>{item.day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{dayNames[new Date(year, month, item.day).getDay()]}</span>
                    {isToday(item.day) && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>AUJOURD'HUI</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.guards.map((m: any) => (
                    <div key={`g-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: getMamanColor(m.id), background: `${getMamanColor(m.id)}10`, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${getMamanColor(m.id)}20` }}>
                      <span>🛡️</span> <strong>Garde active : {m.name}</strong>
                    </div>
                  ))}
                  
                  {item.events.map((e: any) => (
                    <Link key={e.id} href={`/rencontres/${e.id}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'white', border: `1px solid ${getMamanColor(e.motherId)}30` }}>
                        <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: getMamanColor(e.motherId) }}></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{getTypeName(e.type)}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.mother.name} • {new Date(e.date).getHours()}h{new Date(e.date).getMinutes().toString().padStart(2, '0')}</p>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>→</span>
                      </div>
                    </Link>
                  ))}

                  {item.payments.map((p: any) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', border: '1px dashed var(--glass-border)' }}>
                      <span style={{ fontSize: '1.2rem' }}>{p.status === 'PAID' ? '✅' : '💰'}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Paiement {p.amount}$</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.mother.name} • {p.status === 'PAID' ? 'Reçu' : 'Attendu'}</p>
                      </div>
                    </div>
                  ))}

                  {item.dpa.map((m: any) => (
                    <div key={`dpa-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'var(--bg-color)', border: '1px solid var(--primary)' }}>
                      <span style={{ fontSize: '1.2rem' }}>👶</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>DPA : {m.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
        }
        @media (min-width: 769px) {
          .desktop-only { display: block; }
          .mobile-only { display: none; }
        }
      `}</style>

      <div style={{ marginTop: "32px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <p style={{ fontSize: "0.85rem", fontStyle: "italic", marginRight: "8px" }}>Légende :</p>
        {data.mothers.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: getMamanColor(m.id) }}></div>
            <span>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
