"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CalendrierPage() {
  const [data, setData] = useState<{events: any[], mothers: any[]}>({events: [], mothers: []});
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
    const LEGACY_MAPPING: any = {
      PRE_NATAL: "Suivi prénatal",
      POST_NATAL: "Suivi postnatal",
      RELEVAILLE: "Relevaille",
      ACCOUCHEMENT: "Accouchement",
      MEETING: "Rencontre",
      GUARD: "Garde"
    };

    const found = meetingTypes.find(t => t.id === type || t.name === type);
    if (found) return found.name;
    
    return LEGACY_MAPPING[type] || type;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Calendrier Doula</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className="btn-secondary" onClick={prevMonth}>{"<"}</button>
          <h2 style={{ minWidth: "200px", textAlign: "center", margin: 0 }}>{monthNames[month]} {year}</h2>
          <button className="btn-secondary" onClick={nextMonth}>{">"}</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid var(--glass-border)" }}>
          {dayNames.map(d => (
            <div key={d} style={{ padding: "12px", textAlign: "center", fontWeight: "bold", fontSize: "0.85rem", color: "var(--text-muted)" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {weeks.map((week, wIdx) => {
            const segments: {start: number, end: number, mamanName: string, mamanId: string}[] = [];

            data.mothers.forEach(m => {
              let startIdx: number | null = null;
              week.forEach((day, dIdx) => {
                if (day) {
                  const date = new Date(year, month, day);
                  if (isMamanInGuard(m, date)) {
                    if (startIdx === null) startIdx = dIdx;
                    // If it's the last day of the week, close the segment
                    if (dIdx === 6) {
                      segments.push({ start: startIdx, end: 6, mamanName: m.name, mamanId: m.id });
                      startIdx = null;
                    }
                  } else {
                    if (startIdx !== null) {
                      segments.push({ start: startIdx, end: dIdx - 1, mamanName: m.name, mamanId: m.id });
                      startIdx = null;
                    }
                  }
                } else {
                  if (startIdx !== null) {
                    segments.push({ start: startIdx, end: dIdx - 1, mamanName: m.name, mamanId: m.id });
                    startIdx = null;
                  }
                }
              });
              if (startIdx !== null) {
                segments.push({ start: startIdx, end: 6, mamanName: m.name, mamanId: m.id });
              }
            });

            return (
              <div key={wIdx} style={{ position: "relative", minHeight: "160px", borderBottom: "1px solid var(--glass-border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                  {week.map((day, dIdx) => {
                    const today = day ? isToday(day) : false;
                    return (
                      <div key={dIdx} style={{ 
                        padding: "8px", 
                        borderRight: dIdx < 6 ? "1px solid var(--glass-border)" : "none",
                        background: today ? "rgba(255, 235, 59, 0.1)" : (day ? "transparent" : "rgba(0,0,0,0.02)"),
                        boxShadow: today ? "inset 0 0 0 2px rgba(255, 202, 40, 0.5)" : "none"
                      }}>
                        {day && <span style={{ fontSize: "0.9rem", color: today ? "var(--primary)" : "var(--text-muted)", fontWeight: today ? "bold" : "normal" }}>{day}</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ position: "relative", zIndex: 1, paddingTop: "32px", paddingBottom: "8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" }}>
                    {segments.map((seg, sIdx) => {
                      const barColor = getMamanColor(seg.mamanId);
                      return (
                        <div key={sIdx} style={{ 
                          gridColumnStart: seg.start + 1, 
                          gridColumnEnd: seg.end + 2,
                          background: `${barColor}20`,
                          borderTop: `1px solid ${barColor}50`,
                          borderBottom: `1px solid ${barColor}50`,
                          padding: "2px 12px",
                          fontSize: "0.7rem",
                          color: barColor,
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: "1px 0"
                        }}>
                          Garde: {seg.mamanName}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
                    {week.map((day, dIdx) => {
                      if (!day) return <div key={dIdx} />;
                      const dayEvents = data.events.filter(e => isSameDay(e.date, day, month, year, false));
                      const dpaMothers = data.mothers.filter(m => m.dueDate && isSameDay(m.dueDate, day, month, year, true));
                      const birthMothers = data.mothers.filter(m => m.birthDate && isSameDay(m.birthDate, day, month, year, true));

                      return (
                        <div key={dIdx} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "4px" }}>
                          {dayEvents.map(e => (
                             <Link key={e.id} href={`/rencontres/${e.id}`}>
                              <div style={{ 
                                fontSize: "0.75rem", 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                background: getMamanColor(e.motherId), 
                                color: "white",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}>
                                <strong>{new Date(e.date).getHours()}h</strong> - {e.mother.name} ({getTypeName(e.type || "")})
                              </div>
                            </Link>
                          ))}
                          
                          {dpaMothers.map(m => (
                            <Link key={`dpa-${m.id}`} href={`/mamans/${m.id}`}>
                              <div style={{ 
                                fontSize: "0.75rem", 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                border: `2px solid ${getMamanColor(m.id)}`, 
                                color: getMamanColor(m.id),
                                background: "white",
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer"
                              }}>
                                DPA: {m.name}
                              </div>
                            </Link>
                          ))}

                          {birthMothers.map(m => (
                            <Link key={`birth-${m.id}`} href={`/mamans/${m.id}`}>
                              <div style={{ 
                                fontSize: "0.75rem", 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                border: `2px solid ${getMamanColor(m.id)}`,
                                color: getMamanColor(m.id),
                                background: "white",
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer"
                              }}>
                                Naissance: {m.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
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
