import React, { useState, useEffect } from 'react';
import { axiosGet } from '../utils/apiUtils';
import { FileList } from '../components/config-viewer/FileList';
import { Editor } from '../components/config-viewer/Editor';
import { ISPSettingsManager } from '../components/isp-settings';
import { mockApiResponses } from '../mocks/configFiles';
import { Tabs, Tab } from 'react-bootstrap';

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
  const [activeTab, setActiveTab] = useState<string>('files');

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
    
    let clean = raw;
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1);
    }

    clean = clean.replace(/\\n/g, '\n');
    
    const lines = clean.split('\n');
    
    const processedLines = lines.map(line => {
      return line.replace(/\\t/g, '\t');
    });

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
    console.log('Save functionality to be implemented');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Configuration</h1>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'files')}
        className="mb-4"
      >
        <Tab eventKey="files" title="Files">
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
        </Tab>
        <Tab eventKey="isp-settings" title="ISP Settings">
          <ISPSettingsManager />
        </Tab>
      </Tabs>
    </div>
  );
}