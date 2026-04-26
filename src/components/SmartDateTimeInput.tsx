import React, { useState, useRef, useEffect } from 'react';

interface SmartDateTimeInputProps {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (val: string) => void;
  label?: string;
  style?: React.CSSProperties;
}

export const SmartDateTimeInput: React.FC<SmartDateTimeInputProps> = ({ value, onChange, label, style }) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current && value && value.includes('T')) {
      const [datePart, timePart] = value.split('T');
      const [y, m, d] = datePart.split('-');
      const [h, min] = (timePart || '00:00').split(':');
      setYear(y || '');
      setMonth(m || '');
      setDay(d || '');
      setHour(h || '');
      setMinute(min || '');
      prevValue.current = value;
    } else if (!value) {
      setYear('');
      setMonth('');
      setDay('');
      setHour('');
      setMinute('');
      prevValue.current = '';
    }
  }, [value]);

  const updateParent = (y: string, m: string, d: string, h: string, min: string) => {
    if (y.length === 4 && m.length > 0 && d.length > 0) {
      const newVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${min.padStart(2, '0')}`;
      prevValue.current = newVal;
      onChange(newVal);
    } else {
      prevValue.current = '';
      onChange('');
    }
  };

  const inputStyle = { width: '45px', padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', textAlign: 'center' as const };

  return (
    <div style={{ ...style }}>
      {label && <label style={{ fontSize: "0.85rem", display: "block", marginBottom: '4px' }}>{label}</label>}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input ref={yearRef} type="text" placeholder="AAAA" value={year} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
          setYear(v);
          if (v.length === 4) monthRef.current?.focus();
          updateParent(v, month, day, hour, minute);
        }} style={{ ...inputStyle, width: '60px' }} />
        <span>/</span>
        <input ref={monthRef} type="text" placeholder="MM" value={month} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setMonth(v);
          if (v.length === 2 && parseInt(v) > 0) dayRef.current?.focus();
          updateParent(year, v, day, hour, minute);
        }} style={inputStyle} onKeyDown={(e) => e.key === 'Backspace' && month === '' && yearRef.current?.focus()} />
        <span>/</span>
        <input ref={dayRef} type="text" placeholder="JJ" value={day} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setDay(v);
          if (v.length === 2 && parseInt(v) > 0) hourRef.current?.focus();
          updateParent(year, month, v, hour, minute);
        }} style={inputStyle} onKeyDown={(e) => e.key === 'Backspace' && day === '' && monthRef.current?.focus()} />
        <span style={{ marginLeft: '8px' }}>@</span>
        <input ref={hourRef} type="text" placeholder="HH" value={hour} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setHour(v);
          if (v.length === 2) minuteRef.current?.focus();
          updateParent(year, month, day, v, minute);
        }} style={inputStyle} onKeyDown={(e) => e.key === 'Backspace' && hour === '' && dayRef.current?.focus()} />
        <span>:</span>
        <input ref={minuteRef} type="text" placeholder="mm" value={minute} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setMinute(v);
          updateParent(year, month, day, hour, v);
        }} style={inputStyle} onKeyDown={(e) => e.key === 'Backspace' && minute === '' && hourRef.current?.focus()} />
      </div>
    </div>
  );
};
