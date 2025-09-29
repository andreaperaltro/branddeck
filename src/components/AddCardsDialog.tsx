'use client';

import React, { useState } from 'react';
import { useDeckStore } from '@/store/useDeckStore';

interface AddCardsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCardsDialog: React.FC<AddCardsDialogProps> = ({ isOpen, onClose }) => {
  const { addCard, addCards } = useDeckStore();
  const [singleCard, setSingleCard] = useState('');
  const [bulkCards, setBulkCards] = useState('');
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleSingleAdd = async () => {
    if (!singleCard.trim()) return;

    setIsAdding(true);
    try {
      // For single card, we'll add both EN and IT versions
      addCard(singleCard.trim(), singleCard.trim());
      setSingleCard('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkCards.trim()) return;

    setIsAdding(true);
    try {
      const lines = bulkCards
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const cards = lines.map(text => ({
        text_en: text,
        text_it: text // Default to same text for both languages
      }));

      addCards(cards);
      setBulkCards('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeMode === 'single') {
        handleSingleAdd();
      } else {
        handleBulkAdd();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Add Cards</h2>
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
            onClick={() => setActiveMode('single')}
            className={`px-6 py-3 font-medium ${
              activeMode === 'single'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Single Card
          </button>
          <button
            onClick={() => setActiveMode('bulk')}
            className={`px-6 py-3 font-medium ${
              activeMode === 'bulk'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bulk Add
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeMode === 'single' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Text
                </label>
                <input
                  type="text"
                  value={singleCard}
                  onChange={(e) => setSingleCard(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter card text..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to add the card
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSingleAdd}
                  disabled={!singleCard.trim() || isAdding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Texts (one per line)
                </label>
                <textarea
                  value={bulkCards}
                  onChange={(e) => setBulkCards(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter card texts, one per line..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each line will become a separate card. Press Ctrl+Enter to add all cards.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={!bulkCards.trim() || isAdding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Adding...' : `Add ${bulkCards.split('\n').filter(line => line.trim()).length} Cards`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
