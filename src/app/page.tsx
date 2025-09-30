"use client";

import React, { useRef, useState } from 'react';
import { useDeckStore } from '@/store/useDeckStore';
import Link from 'next/link';
import { exportSession, importSession } from '@/lib/storage';

export default function DashboardPage() {
  const { session, createSession, loadSession } = useDeckStore();
  const [clientName, setClientName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportText = async (text: string) => {
    setImportError(null);
    const imported = importSession(text);
    if (!imported) {
      setImportError('Invalid or unreadable JSON file.');
      return;
    }
    loadSession(imported);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Branding Sessions</h1>
          <Link href="/settings" className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Settings</Link>
        </div>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Create a new session</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Client name (e.g., Acme Inc.)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <button
              onClick={() => {
                const name = clientName.trim() || 'New Session';
                createSession(name);
                setClientName('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        {session ? (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Current session</h3>
                <p className="text-gray-600">{session.name}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/deck" className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Open Deck</Link>
                <Link href="/axes" className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Open Axes</Link>
                <button
                  className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={() => {
                    const json = exportSession(session);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${session.name.replace(/[^a-z0-9-_]+/gi, '_')}_session.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">No active session yet.</div>
        )}

        {/* Import JSON (Drag & Drop + Button) */}
        <div className="bg-white border rounded-lg p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Import a saved session (JSON)</h2>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                await handleImportText(text);
              } catch {
                setImportError('Failed to import the JSON file.');
              }
            }}
          >
            <div className="mb-3 text-sm">Drag & drop your session JSON here</div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Choose file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  await handleImportText(text);
                } catch {
                  setImportError('Failed to import the JSON file.');
                } finally {
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          {importError && <div className="text-red-600 text-sm mt-2">{importError}</div>}
        </div>
      </div>
    </div>
  );
}