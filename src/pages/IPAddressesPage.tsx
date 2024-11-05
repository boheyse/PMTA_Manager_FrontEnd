import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

export function IPAddressesPage() {
  const [inputString, setInputString] = useState('');
  const [interpretedString, setInterpretedString] = useState('');

  const interpretString = (str: string) => {
    try {
      // Replace escaped newlines with actual newlines
      let processed = str.replace(/\\n/g, '\n');
      
      // Replace escaped tabs with actual tabs
      processed = processed.replace(/\\t/g, '\t');
      
      // Replace escaped quotes with actual quotes
      processed = processed.replace(/\\"/g, '"');
      
      setInterpretedString(processed);
    } catch (error) {
      // If parsing fails, just show the string as-is
      setInterpretedString(str);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">String Interpreter</h1>

      <div className="mb-6">
        <Form.Group>
          <Form.Label>Input String (with escape sequences)</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={inputString}
            onChange={(e) => {
              setInputString(e.target.value);
              interpretString(e.target.value);
            }}
            className="font-mono"
            placeholder="Enter string with escape sequences (e.g., line1\nline2)"
          />
        </Form.Group>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Interpreted Output</h2>
        <pre 
          className="bg-gray-50 p-4 rounded font-mono overflow-x-auto"
          style={{ minHeight: '200px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        >
          {interpretedString}
        </pre>
      </div>
    </div>
  );
} 