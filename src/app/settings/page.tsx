'use client';

import React, { useEffect, useState } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { nanoid } from 'nanoid';

export default function SettingsPage() {
  const [tab, setTab] = useState<'deck' | 'axes'>('deck');
  // Deck words editor state
  type CardPair = { id: string; ENG: string; ITA: string; ENG__1: string; ITA__1: string };
  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tab !== 'deck') return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/BrandDeck.json');
        const data = (await res.json()) as Omit<CardPair, 'id'>[];
        setPairs(data.map(p => ({ id: nanoid(), ...p })));
      } catch (e) {
        console.error('Failed to load BrandDeck.json', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [tab]);

  const addPair = () => setPairs(prev => [...prev, { id: nanoid(), ENG: '', ITA: '', ENG__1: '', ITA__1: '' }]);
  const removePair = (id: string) => setPairs(prev => prev.filter(p => p.id !== id));
  const updatePair = (id: string, field: keyof Omit<CardPair, 'id'>, value: string) =>
    setPairs(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  const downloadJson = async () => {
    setIsSaving(true);
    try {
      const dataToSave = pairs.map(({ id: _id, ...rest }) => rest);
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BrandDeck.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar onImportExport={() => {}} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>

        <div className="flex gap-2 mb-6">
          <button
            className={`px-3 py-2 rounded ${tab === 'deck' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('deck')}
          >
            Deck
          </button>
          <button
            className={`px-3 py-2 rounded ${tab === 'axes' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('axes')}
          >
            Axes
          </button>
        </div>

        {tab === 'deck' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Brand Deck Word Pairs</h2>
              <div className="flex gap-2">
                <button onClick={addPair} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Pair</button>
                <button onClick={downloadJson} disabled={isSaving} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{isSaving ? 'Saving…' : 'Download JSON'}</button>
              </div>
            </div>
            {isLoading ? (
              <div className="text-gray-600">Loading…</div>
            ) : (
              <div className="grid gap-4">
                {pairs.map((pair, idx) => (
                  <div key={pair.id} className="bg-white rounded border p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium">Pair #{idx + 1}</div>
                      <button onClick={() => removePair(pair.id)} className="text-red-600">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">First Word (EN)</label>
                        <input value={pair.ENG} onChange={e => updatePair(pair.id, 'ENG', e.target.value)} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">First Word (IT)</label>
                        <input value={pair.ITA} onChange={e => updatePair(pair.id, 'ITA', e.target.value)} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">Opposite Word (EN)</label>
                        <input value={pair.ENG__1} onChange={e => updatePair(pair.id, 'ENG__1', e.target.value)} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600">Opposite Word (IT)</label>
                        <input value={pair.ITA__1} onChange={e => updatePair(pair.id, 'ITA__1', e.target.value)} className="w-full px-3 py-2 border rounded" />
                      </div>
                    </div>
                  </div>
                ))}
                {pairs.length === 0 && (
                  <div className="bg-white rounded border p-6 text-center text-gray-600">No pairs. Click "Add Pair" to start.</div>
                )}
              </div>
            )}
            <div className="text-xs text-gray-500">After downloading, replace the file at <code>/public/BrandDeck.json</code> and refresh.</div>
          </div>
        ) : (
          <div className="bg-white rounded border p-4 space-y-3">
            <div className="text-sm text-gray-600">Axes-specific settings will go here.</div>
          </div>
        )}
      </div>
    </div>
  );
}


