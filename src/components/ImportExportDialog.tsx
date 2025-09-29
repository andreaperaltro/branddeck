'use client';

import React, { useState, useRef } from 'react';
import { useDeckStore } from '@/store/useDeckStore';
import { exportToCSV, downloadCSV, downloadJSON } from '@/lib/csv';
import { shareSessionURL, copyToClipboard } from '@/lib/urlshare';

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportDialog: React.FC<ImportExportDialogProps> = ({ isOpen, onClose }) => {
  const { session, language, importCSV, loadSession } = useDeckStore();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;

    setIsImporting(true);
    setImportError('');

    try {
      if (importText.includes('"session"') || importText.includes('"cards"')) {
        // JSON import
        const data = JSON.parse(importText);
        if (data.session) {
          loadSession(data.session);
        } else {
          throw new Error('Invalid JSON format');
        }
      } else {
        // CSV import
        importCSV(importText);
      }
      
      setImportText('');
      onClose();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!session) return;
    
    const csvContent = exportToCSV(session.cards);
    downloadCSV(csvContent, `${session.name}-export.csv`);
  };

  const handleExportJSON = () => {
    if (!session) return;
    
    const exportData = {
      session,
      language,
      exportedAt: new Date().toISOString()
    };
    
    downloadJSON(exportData, `${session.name}-export.json`);
  };

  const handleShareURL = async () => {
    if (!session) return;
    
    const url = shareSessionURL(session);
    const success = await copyToClipboard(url);
    
    if (success) {
      alert('Shareable URL copied to clipboard!');
    } else {
      alert('Failed to copy URL. Please copy manually: ' + url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Import / Export</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Export
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV or JSON file
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste CSV/JSON content
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your CSV or JSON content here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              {importError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {importError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importText.trim() || isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Export Options</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export your session data in different formats
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExportCSV}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-lg mb-2">📊</div>
                  <h4 className="font-medium text-gray-900">Export as CSV</h4>
                  <p className="text-sm text-gray-600">Download cards with pile assignments</p>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-lg mb-2">💾</div>
                  <h4 className="font-medium text-gray-900">Export as JSON</h4>
                  <p className="text-sm text-gray-600">Download complete session data</p>
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Share Session</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a shareable URL that contains your session data
                </p>
                <button
                  onClick={handleShareURL}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  📤 Copy Shareable URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
