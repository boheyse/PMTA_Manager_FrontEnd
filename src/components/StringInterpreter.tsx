import React from 'react';
import { Form } from 'react-bootstrap';

interface StringInterpreterProps {
  inputString: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function StringInterpreter({ inputString, onChange, readOnly = false }: StringInterpreterProps) {
  const interpretString = (str: string) => {
    try {
      // Replace escaped newlines with actual newlines
      let processed = str.replace(/\\n/g, '\n');
      
      // Replace escaped tabs with actual tabs
      processed = processed.replace(/\\t/g, '\t');
      
      // Replace escaped quotes with actual quotes
      processed = processed.replace(/\\"/g, '"');
      
      // Replace multiple consecutive newlines with a maximum of two newlines
      processed = processed.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      return processed;
    } catch (error) {
      // If parsing fails, just show the string as-is
      return str;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Interpreted Output</h2>
      <pre 
        className="bg-gray-50 p-4 rounded font-mono overflow-x-auto"
        style={{ 
          minHeight: '200px', 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word',
          cursor: readOnly ? 'default' : 'text'
        }}
      >
        {interpretString(inputString)}
      </pre>
      {!readOnly && onChange && (
        <Form.Group className="mt-4">
          <Form.Label>Edit String</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={inputString}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono"
            placeholder="Enter string with escape sequences..."
          />
        </Form.Group>
      )}
    </div>
  );
} 