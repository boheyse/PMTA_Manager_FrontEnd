import React, { useRef, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

interface EditorProps {
  selectedFile: string;
  fileContent: string;
  loading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDiscard: () => void;
  onSave: () => void;
  onErrorClose: () => void;
}

export function Editor({
  selectedFile,
  fileContent,
  loading,
  error,
  hasUnsavedChanges,
  onContentChange,
  onDiscard,
  onSave,
  onErrorClose
}: EditorProps) {
  const editorRef = useRef<HTMLPreElement>(null);

  // Function to format the content with bold brackets
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Split content into lines
    const lines = content.split('\n');
    
    // Process each line
    const formattedLines = lines.map(line => {
      // Replace < and > with HTML entities
      let processedLine = line
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Bold pattern for <tag> and </tag> patterns
      processedLine = processedLine.replace(
        /(&lt;[^&]*&gt;)/g,
        '<strong class="text-blue-600">$1</strong>'
      );

      // Preserve leading spaces
      const leadingSpaces = line.match(/^[\s]*/)[0].length;
      if (leadingSpaces > 0) {
        processedLine = '&nbsp;'.repeat(leadingSpaces) + processedLine.trimLeft();
      }

      return processedLine;
    });

    return formattedLines.join('\n');
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText;
      onContentChange({ target: { value: content } } as any);
    }
  };

  // Update content when fileContent changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formatContent(fileContent);
    }
  }, [fileContent]);

  return (
    <div className="flex flex-col h-full">
      {error && (
        <Alert variant="danger" className="mb-4" onClose={onErrorClose} dismissible>
          {error}
        </Alert>
      )}

      <div className="flex-1 relative bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-full relative">
            {selectedFile ? (
              <div className="relative h-full flex flex-col">
                <div className="absolute top-0 right-0 p-2 bg-white bg-opacity-75 rounded-bl text-xs text-gray-500 z-10">
                  {selectedFile}
                </div>
                <div className="absolute inset-0 overflow-auto">
                  <pre
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="min-w-full p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      lineHeight: '1.4',
                      tabSize: 4,
                      whiteSpace: 'pre',
                    }}
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full p-4 font-mono text-sm text-gray-400 flex items-center justify-center">
                Select a file to view its content
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            onClick={onDiscard}
            disabled={!hasUnsavedChanges}
          >
            Discard
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={!hasUnsavedChanges}
            onClick={onSave}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}