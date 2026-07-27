import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [localValue, setLocalValue] = useState(value || '');
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    clearTimeout(timerRef.current);
    onChange('');
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
      <input
        type="text"
        className="input input-bordered w-full pl-9 pr-8 input-sm bg-base-200"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
      {localValue && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
          onClick={handleClear}
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
