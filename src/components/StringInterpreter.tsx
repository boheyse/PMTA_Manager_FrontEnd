import React from 'react';
import { Diff, parseDiff, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';

interface StringInterpreterProps {
  originalDomain: string;
  modifiedDomain: string;
}

export function StringInterpreter({ originalDomain, modifiedDomain }: StringInterpreterProps) {
  // Create a unified diff format string
  const createDiffText = (oldStr: string, newStr: string) => {
    return `--- a/original
+++ b/modified
@@ -1 +1 @@
-${oldStr}
+${newStr}
`;
  };

  const diffText = createDiffText(originalDomain, modifiedDomain);
  const files = parseDiff(diffText);

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h2 className="text-lg font-semibold mb-4">Domain Changes</h2>
      {files.map(({hunks}, i) => (
        <Diff 
          key={i} 
          viewType="split" 
          diffType="modify" 
          hunks={hunks}
        >
          {hunks => hunks.map(hunk => (
            <Hunk key={hunk.content} hunk={hunk} />
          ))}
        </Diff>
      ))}
    </div>
  );
} 