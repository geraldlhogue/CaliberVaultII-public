import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface NumericInputProps {
  label: string;
  value: number | string;
  unit: string;
  units: Array<{ code: string; name: string }>;
  onChange: (value: number | string, unit: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  allowDecimal?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  unit,
  units = [],
  onChange,
  placeholder = "0",
  required = false,
  min,
  max,
  step = 1,
  helpText,
  allowDecimal = true
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [selectedUnit, setSelectedUnit] = useState(unit || (units && units.length > 0 ? units[0]?.code : '') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    setSelectedUnit(unit || (units && units.length > 0 ? units[0]?.code : '') || '');
  }, [unit, units]);

  const validateInput = (val: string): boolean => {
    if (!val && !required) return true;
    if (!val && required) {
      setError('This field is required');
      return false;
    }

    const numVal = parseFloat(val);
    if (isNaN(numVal)) {
      setError('Please enter a valid number');
      return false;
    }

    if (min !== undefined && numVal < min) {
      setError(`Value must be at least ${min}`);
      return false;
    }

    if (max !== undefined && numVal > max) {
      setError(`Value must be no more than ${max}`);
      return false;
    }

    if (!allowDecimal && !Number.isInteger(numVal)) {
      setError('Please enter a whole number');
      return false;
    }

    setError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow empty string or valid number format
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setInputValue(val);
      
      if (validateInput(val)) {
        const numVal = val === '' ? '' : parseFloat(val);
        onChange(numVal, selectedUnit);
      }
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setSelectedUnit(newUnit);
    const numVal = inputValue === '' ? '' : parseFloat(inputValue);
    onChange(numVal, newUnit);
  };

  return (
    <div>
      <label className="block text-slate-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white`}
          />
        </div>
        {units && units.length > 0 && (
          <select
            value={selectedUnit}
            onChange={handleUnitChange}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white min-w-[80px]"
          >
            {units.map(u => (
              <option key={u.code} value={u.code}>{u.code}</option>
            ))}
          </select>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-400">{helpText}</p>
      )}
    </div>
  );
};