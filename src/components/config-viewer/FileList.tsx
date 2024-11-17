import React from 'react';
import { Search } from 'lucide-react';
import { TreeView } from './TreeView';

interface FileListProps {
  files: string[];
  selectedFile: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFileSelect: (fileName: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  children: { [key: string]: FileNode };
  isFile: boolean;
}

export function FileList({ 
  files, 
  selectedFile, 
  searchTerm, 
  onSearchChange, 
  onFileSelect 
}: FileListProps) {
  // Find the common prefix among all file paths
  const findCommonPrefix = (paths: string[]): string => {
    if (paths.length === 0) return '';
    
    const parts = paths[0].split('/').filter(Boolean);
    let commonPrefix = '';
    
    for (let i = 0; i < parts.length; i++) {
      const currentPath = '/' + parts.slice(0, i + 1).join('/');
      const isCommon = paths.every(path => path.startsWith(currentPath));
      if (!isCommon) break;
      commonPrefix = currentPath;
    }
    
    return commonPrefix;
  };

  // Build file tree structure
  const buildFileTree = (paths: string[]): FileNode => {
    const root: FileNode = { name: '', path: '', children: {}, isFile: false };
    const commonPrefix = findCommonPrefix(paths);
    const commonPrefixParts = commonPrefix.split('/').filter(Boolean).length;
    
    paths.forEach(path => {
      const parts = path.split('/').filter(Boolean);
      // Skip the common prefix parts
      const relevantParts = parts.slice(commonPrefixParts);
      let current = root;
      
      relevantParts.forEach((part, index) => {
        const currentPath = commonPrefix + '/' + relevantParts.slice(0, index + 1).join('/');
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            children: {},
            isFile: index === relevantParts.length - 1
          };
        }
        current = current.children[part];
      });
    });
    
    return root;
  };

  const fileTree = buildFileTree(files);

  // Filter files based on search term
  const filteredFiles = searchTerm
    ? files.filter(file => 
        file.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  return (
    <div className="flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for a file"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg">
        {searchTerm ? (
          // Show flat list when searching
          <div className="py-2">
            {filteredFiles?.map((file) => (
              <button
                key={file}
                onClick={() => onFileSelect(file)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedFile === file ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {file}
              </button>
            ))}
          </div>
        ) : (
          // Show tree view when not searching
          <div className="py-2">
            <TreeView
              node={fileTree}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              level={0}
              defaultExpanded={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}