'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { nanoid } from 'nanoid';

interface CardPair {
  id: string;
  ENG: string;
  ITA: string;
  ENG__1: string;
  ITA__1: string;
}

export default function AdminPage() {
  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing pairs from JSON
  useEffect(() => {
    const loadPairs = async () => {
      try {
        const response = await fetch('/BrandDeck.json');
        const data = await response.json() as Omit<CardPair, 'id'>[];
        const pairsWithIds = data.map((pair) => ({
          id: nanoid(),
          ...pair
        }));
        setPairs(pairsWithIds);
      } catch (error) {
        console.error('Failed to load pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPairs();
  }, []);

  // Add new pair
  const addPair = () => {
    const newPair: CardPair = {
      id: nanoid(),
      ENG: '',
      ITA: '',
      ENG__1: '',
      ITA__1: ''
    };
    setPairs([...pairs, newPair]);
  };

  // Remove pair
  const removePair = (id: string) => {
    setPairs(pairs.filter(pair => pair.id !== id));
  };

  // Update pair
  const updatePair = (id: string, field: keyof Omit<CardPair, 'id'>, value: string) => {
    setPairs(pairs.map(pair => 
      pair.id === id ? { ...pair, [field]: value } : pair
    ));
  };

  // Save to JSON file
  const saveToFile = async () => {
    setIsSaving(true);
    try {
      // Remove IDs before saving by explicitly picking fields
      const dataToSave = pairs.map(({ ENG, ITA, ENG__1, ITA__1 }) => ({ ENG, ITA, ENG__1, ITA__1 }));
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(dataToSave, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BrandDeck.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('JSON file downloaded! Replace the file in /public/BrandDeck.json and refresh the main app.');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card pairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Card Pairs Admin</h1>
              <p className="text-gray-600">Manage your brand deck word pairs</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addPair}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ➕ Add Pair
              </button>
              <button
                onClick={saveToFile}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? '💾 Saving...' : '💾 Save JSON'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                ← Back to App
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid gap-4">
          {pairs.map((pair, index) => (
            <div key={pair.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pair #{index + 1}</h3>
                <button
                  onClick={() => removePair(pair.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Word */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Word (English)
                  </label>
                  <input
                    type="text"
                    value={pair.ENG}
                    onChange={(e) => updatePair(pair.id, 'ENG', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Accomplished"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Word (Italian)
                  </label>
                  <input
                    type="text"
                    value={pair.ITA}
                    onChange={(e) => updatePair(pair.id, 'ITA', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., esperto, abile"
                  />
                </div>
                
                {/* Second Word */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Opposite Word (English)
                  </label>
                  <input
                    type="text"
                    value={pair.ENG__1}
                    onChange={(e) => updatePair(pair.id, 'ENG__1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Budding"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Opposite Word (Italian)
                  </label>
                  <input
                    type="text"
                    value={pair.ITA__1}
                    onChange={(e) => updatePair(pair.id, 'ITA__1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., in erba"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {pairs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No card pairs yet</h2>
            <p className="text-gray-600 mb-4">Add your first word pair to get started</p>
            <button
              onClick={addPair}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ➕ Add First Pair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
