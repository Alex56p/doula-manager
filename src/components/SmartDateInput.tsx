import React, { useState, useRef, useEffect } from 'react';

interface SmartDateInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  style?: React.CSSProperties;
}

export const SmartDateInput: React.FC<SmartDateInputProps> = ({ value, onChange, label, style }) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current && value) {
      const [y, m, d] = value.split('T')[0].split('-');
      setYear(y || '');
      setMonth(m || '');
      setDay(d || '');
      prevValue.current = value;
    } else if (!value) {
      setYear('');
      setMonth('');
      setDay('');
      prevValue.current = '';
    }
  }, [value]);

  const updateParent = (y: string, m: string, d: string) => {
    if (y.length === 4 && m.length > 0 && d.length > 0) {
      const newVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      prevValue.current = newVal;
      onChange(newVal);
    } else {
      prevValue.current = '';
      onChange('');
    }
  };

  return (
    <div style={{ ...style }}>
      {label && <label style={{ fontSize: "0.85rem", display: "block", marginBottom: '4px' }}>{label}</label>}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input ref={yearRef} type="text" placeholder="AAAA" value={year} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
          setYear(v);
          if (v.length === 4) monthRef.current?.focus();
          updateParent(v, month, day);
        }} style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', textAlign: 'center' }} />
        <span>/</span>
        <input ref={monthRef} type="text" placeholder="MM" value={month} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setMonth(v);
          if (v.length === 2 && parseInt(v) > 0) dayRef.current?.focus();
          updateParent(year, v, day);
        }} onKeyDown={(e) => e.key === 'Backspace' && month === '' && yearRef.current?.focus()} style={{ width: '40px', padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', textAlign: 'center' }} />
        <span>/</span>
        <input ref={dayRef} type="text" placeholder="JJ" value={day} onInput={(e: any) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setDay(v);
          updateParent(year, month, v);
        }} onKeyDown={(e) => e.key === 'Backspace' && day === '' && monthRef.current?.focus()} style={{ width: '40px', padding: '6px', borderRadius: '6px', border: '1px solid var(--glass-border)', textAlign: 'center' }} />
      </div>
    </div>
  );
};
