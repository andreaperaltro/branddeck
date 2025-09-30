'use client';

import React, { useRef, useState } from 'react';
import { useDeckStore } from '@/store/useDeckStore';
import { Toolbar } from '@/components/Toolbar';

export default function AxesPage() {
  const {
    session,
    createAxisBoard,
    updateAxisLabels,
    updateAxisBoardName,
    deleteAxisBoard,
    addAxisItem,
    moveAxisItem,
    updateAxisItemLabel,
    deleteAxisItem,
    addAxisWordAllBoards,
    updateAxisWordLabelAllBoards,
    deleteAxisWordAllBoards,
  } = useDeckStore();

  const boards = session?.axesBoards ?? [];

  const [newWord, setNewWord] = useState('');
  const boardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    // place in center by default
    // Add shared word across all boards, so each gets the same id/label.
    addAxisWordAllBoards(newWord.trim());
    setNewWord('');
  };

  const handleDrag = (e: React.MouseEvent, boardId: string, itemId: string) => {
    const el = boardRefs.current[boardId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    e.preventDefault();

    const onMove = (moveEvent: MouseEvent) => {
      // Compute position relative to board on every move so it follows the cursor
      const relX = (moveEvent.clientX - rect.left) / rect.width;
      const relY = (moveEvent.clientY - rect.top) / rect.height;
      const px = Math.min(100, Math.max(0, relX * 100));
      const py = Math.min(100, Math.max(0, relY * 100));
      moveAxisItem(boardId, itemId, px, py);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-w-full">
        <Toolbar onImportExport={() => {}} />
        <div className="max-w-6xl mx-auto p-6">

        <div className="mb-4 flex items-center gap-2">
          <button
            className="px-3 py-2 border rounded"
            onClick={async () => {
              // lazy import to keep initial bundle smaller
              const html2canvas = await (async () => {
                try { return (await import('html2canvas')).default; } catch { /* fallthrough */ }
                try { return (await import('html2canvas/dist/html2canvas.js')).default; } catch { /* fallthrough */ }
                throw new Error('html2canvas not available');
              })();
              const jsPDFModule = await (async () => {
                try { return await import('jspdf'); } catch { /* fallthrough */ }
                try { return await import('jspdf/dist/jspdf.umd.min.js'); } catch { /* fallthrough */ }
                throw new Error('jspdf not available');
              })();
              const JsPDFCtor = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
              const pdf = new JsPDFCtor({ unit: 'pt', format: 'a4' });
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();

              for (let i = 0; i < boards.length; i++) {
                const board = boards[i];
                const el = boardRefs.current[board.id];
                if (!el) continue;
                const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 40;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, Math.min(imgHeight, pageHeight - 40));
              }
              const name = (session?.name || 'session').replace(/[^a-z0-9-_]+/gi, '_');
              pdf.save(`${name}_axes.pdf`);
            }}
          >
            Export PDF
          </button>
          <button
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => createAxisBoard('Positioning Map')}
          >
            + New Board
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="bg-white border rounded p-6 text-center text-gray-600">No boards yet. Create one to begin.</div>
        ) : (
          <div className="space-y-8">
            {/* Word input (shared) */}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add a word (shared across boards)"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
              <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleAddWord}>Add</button>
            </div>

            {boards.map(board => (
              <div key={board.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    className="font-semibold border-b focus:outline-none"
                    value={board.name}
                    onChange={(e) => updateAxisBoardName(board.id, e.target.value)}
                  />
                  <button
                    className="text-sm px-2 py-1 border rounded text-red-600"
                    onClick={() => deleteAxisBoard(board.id)}
                  >
                    Delete
                  </button>
                </div>

                {/* Labels editor per board */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <input
                    className="border rounded px-2 py-2"
                    value={board.labels.top}
                    onChange={(e) => updateAxisLabels(board.id, { top: e.target.value })}
                    placeholder="Top label"
                  />
                  <input
                    className="border rounded px-2 py-2"
                    value={board.labels.bottom}
                    onChange={(e) => updateAxisLabels(board.id, { bottom: e.target.value })}
                    placeholder="Bottom label"
                  />
                  <input
                    className="border rounded px-2 py-2"
                    value={board.labels.left}
                    onChange={(e) => updateAxisLabels(board.id, { left: e.target.value })}
                    placeholder="Left label"
                  />
                  <input
                    className="border rounded px-2 py-2"
                    value={board.labels.right}
                    onChange={(e) => updateAxisLabels(board.id, { right: e.target.value })}
                    placeholder="Right label"
                  />
                </div>

                {/* Board area */}
                <div
                  ref={(el) => { boardRefs.current[board.id] = el; }}
                  className="relative bg-white border rounded-lg h-[540px] select-none"
                >
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />

                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-gray-600">{board.labels.top}</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-600">{board.labels.bottom}</div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-2 text-xs text-gray-600">{board.labels.left}</div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 text-xs text-gray-600">{board.labels.right}</div>

                  {board.items.map(item => (
                    <div
                      key={item.id}
                      id={`axis-item-${item.id}`}
                      data-x={item.x}
                      data-y={item.y}
                      className="absolute cursor-move group"
                      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                      onMouseDown={(e) => handleDrag(e, board.id, item.id)}
                    >
                      <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm shadow">
                        {item.label}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1 justify-center">
                        <button
                          className="text-xs px-2 py-0.5 bg-white border rounded hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLabel = prompt('Edit label', item.label);
                            if (newLabel != null) updateAxisWordLabelAllBoards(item.id, newLabel);
                          }}
                        >Edit</button>
                        <button
                          className="text-xs px-2 py-0.5 bg-white border rounded hover:bg-gray-50 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAxisWordAllBoards(item.id);
                          }}
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}


