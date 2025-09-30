'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDeckStore } from '@/store/useDeckStore';

interface ToolbarProps {
  onImportExport?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const {
    session,
    language,
    setLanguage,
    undo,
    redo,
    undoStack,
    redoStack,
    resetSession
  } = useDeckStore();

  const [sessionName, setSessionName] = useState(session?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNameSave = () => {
    if (sessionName.trim() && sessionName !== session?.name) {
      useDeckStore.getState().updateSessionName(sessionName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setSessionName(session?.name || '');
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Session Name and Settings Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {isEditingName ? (
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                className="text-2xl font-bold border-b-2 border-blue-500 bg-transparent focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              >
                {session?.name || 'New Session'}
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'it' : 'en')}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                {language === 'en' ? 'EN' : 'IT'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">Dashboard</Link>
            <Link href="/deck" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">Deck</Link>
            <Link href="/axes" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">Axes</Link>
          </div>
        </div>

        {/* Collapsible panel removed – Settings moved to dedicated page */}
      </div>
    </div>
  );
};
