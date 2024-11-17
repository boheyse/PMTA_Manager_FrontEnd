import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  children: { [key: string]: FileNode };
  isFile: boolean;
}

interface TreeViewProps {
  node: FileNode;
  selectedFile: string;
  onFileSelect: (path: string) => void;
  level: number;
}

export function TreeView({ node, selectedFile, onFileSelect, level }: TreeViewProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggleFolder = (name: string) => {
    setExpanded(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const sortedChildren = Object.values(node.children).sort((a, b) => {
    // Folders before files
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    // Alphabetical within same type
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ marginLeft: level ? 16 : 0 }}>
      {sortedChildren.map((child) => (
        <div key={child.path}>
          {child.isFile ? (
            <button
              onClick={() => onFileSelect(child.path)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 ${
                selectedFile === child.path ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <File className="w-4 h-4" />
              <span>{child.name}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleFolder(child.path)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
              >
                {expanded[child.path] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4" />
                <span>{child.name}</span>
              </button>
              {expanded[child.path] && (
                <TreeView
                  node={child}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                  level={level + 1}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}