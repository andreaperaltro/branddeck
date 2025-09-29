'use client';

import React, { useState } from 'react';
import { useDeckStore } from '@/store/useDeckStore';

interface ToolbarProps {
  onImportExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onImportExport }) => {
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
                {session?.name || 'Brand Deck'}
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
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Collapsible Settings Panel */}
        {isSettingsOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Undo/Redo */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ↷ Redo
                </button>
              </div>

              {/* Import/Export */}
              <div>
                <button
                  onClick={onImportExport}
                  className="w-full px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                >
                  📁 Import/Export
                </button>
              </div>

              {/* Admin */}
              <div>
                <a
                  href="/admin"
                  className="w-full px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm inline-block text-center"
                >
                  ⚙️ Admin
                </a>
              </div>

              {/* Reset */}
              <div>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset and reload all cards?')) {
                      resetSession();
                      // Force reload with fresh JSON data
                      const defaultCards = await useDeckStore.getState().getDefaultCards();
                      useDeckStore.getState().addCards(defaultCards);
                    }
                  }}
                  className="w-full px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  🔄 Reset & Reload
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <strong>Keyboard Shortcuts:</strong> Focus a card and press 1-4 to move to piles, 0 for unsorted, Del to remove. 
              <span className="ml-4">⌘/Ctrl+Z: Undo</span>
              <span className="ml-2">⌘/Ctrl+Shift+Z: Redo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
