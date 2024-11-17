import React, { useState, useEffect } from 'react';
import { axiosGet } from '../utils/apiUtils';
import { FileList } from '../components/config-viewer/FileList';
import { Editor } from '../components/config-viewer/Editor';
import { mockApiResponses } from '../mocks/configFiles';

const USE_MOCK_DATA = false; // Toggle this to switch between mock and real API

export function ConfigViewerPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        setFiles(mockApiResponses.fileList.data);
      } else {
        const response = await axiosGet('/v1/config-files?fileNameList=true');
        setFiles(response.data || []);
        console.log(`Fetched file list: ${response.data}`);
      }
    } catch (err) {
      setError('Failed to fetch file list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (fileName: string) => {
    if (hasUnsavedChanges) {
      const proceed = window.confirm('You have unsaved changes. Do you want to proceed without saving?');
      if (!proceed) {
        return;
      }
    }

    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const beautifiedContent = beautifyString(mockApiResponses.fileContent.data);
        setFileContent(beautifiedContent);
        setOriginalContent(beautifiedContent);
      } else {
        console.log(`Fetching file content for ${fileName}`);
        const response = await axiosGet(`/v1/config-files?fileName=${fileName}&rawString=true`);
        const beautifiedContent = beautifyString(response.data);
        setFileContent(beautifiedContent);
        setOriginalContent(beautifiedContent);
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      setError('Failed to fetch file content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const beautifyString = (raw: string): string => {
    if (!raw) return '';
    
    // Remove any surrounding quotes
    let clean = raw;
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1);
    }

    // Replace escaped newlines with actual newlines while preserving indentation
    clean = clean.replace(/\\n/g, '\n');
    
    // Split into lines and preserve indentation
    const lines = clean.split('\n');
    
    // Process each line to preserve leading spaces and handle escaped characters
    const processedLines = lines.map(line => {
      // Preserve leading spaces and tabs
      return line.replace(/\\t/g, '\t');
    });

    // Join lines back together
    return processedLines.join('\n');
  };

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleDiscard = () => {
    setFileContent(originalContent);
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save functionality to be implemented');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Configuration</h1>
      
      <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-200px)]">
        <FileList
          files={files}
          selectedFile={selectedFile}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFileSelect={handleFileSelect}
        />

        <Editor
          selectedFile={selectedFile}
          fileContent={fileContent}
          loading={loading}
          error={error}
          hasUnsavedChanges={hasUnsavedChanges}
          onContentChange={handleContentChange}
          onDiscard={handleDiscard}
          onSave={handleSave}
          onErrorClose={() => setError(null)}
        />
      </div>
    </div>
  );
}