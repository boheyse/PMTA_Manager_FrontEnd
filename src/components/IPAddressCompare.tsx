import React, { useState } from 'react';
import { Diff, parseDiff, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';

export function IPAddressCompare() {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');

  // Create a unified diff format string
  const createDiffText = (oldStr: string, newStr: string) => {
    return `--- a/original
+++ b/modified
@@ -1 +1 @@
-${oldStr}
+${newStr}
`;
  };

  const diffText = createDiffText(leftInput, rightInput);
  const files = parseDiff(diffText);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Original IP List</label>
          <textarea
            className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            placeholder="Enter IP addresses (one per line)"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">New IP List</label>
          <textarea
            className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            placeholder="Enter IP addresses (one per line)"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto border rounded-md bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">IP Address Changes</h2>
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
      </div>
    </div>
  );
} 