import React from 'react';
import Form from 'react-bootstrap/Form';

interface SelectProps {
  options: string[];
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Select({ options, placeholder, value, onChange }: SelectProps) {
  return (
    <Form.Select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded-lg"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Form.Select>
  );
}