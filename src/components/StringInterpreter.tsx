import ReactDiffViewer from 'react-diff-viewer-continued';

interface StringInterpreterProps {
  originalString: string;
  modifiedString: string;
  title: string;
}

export function StringInterpreter({ originalString, modifiedString, title }: StringInterpreterProps) {
  function beautifyString(raw: string) {
    let clean = raw;
    if (clean.startsWith('"') && clean.endsWith('"')) {
        clean = clean.slice(1, -1);
    }
    clean = clean.replace(/\\n/g, '\n');
    return clean;
  }

  return (
    <div className="rounded-md border border-border bg-background p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">{title} Changes</h2>
      <ReactDiffViewer
        oldValue={beautifyString(originalString)}
        newValue={beautifyString(modifiedString)}
        splitView={true}
      />
    </div>
  );
} 