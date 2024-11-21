import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface SearchableSelectProps {
  options: string[];
  placeholder: string;
  onChange?: (selected: string[]) => void;
}

export default function SearchableSelect({ options, placeholder, onChange }: SearchableSelectProps) {
  return (
    <Typeahead
      id="basic-typeahead"
      labelKey="name"
      options={options}
      placeholder={placeholder}
      onChange={(selected) => onChange?.(selected as string[])}
      className="rounded-lg"
    />
  );
}