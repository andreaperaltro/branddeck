'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useDeckStore } from '@/store/useDeckStore';
import { Card as CardType, Pile } from '@/lib/types';
import { Toolbar } from '@/components/Toolbar';
import { Column } from '@/components/Column';
import { CardPair } from '@/components/CardPair';
import { ImportExportDialog } from '@/components/ImportExportDialog';
import { loadSessionFromURL } from '@/lib/urlshare';

export default function DeckPage() {
  const {
    session,
    language,
    getCardsInPile,
    getCurrentPair,
    moveCard,
    createSession,
    loadSession
  } = useDeckStore();

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const initializeSession = useCallback(async () => {
      const urlSession = loadSessionFromURL();
      if (urlSession) {
        loadSession(urlSession);
        setIsLoading(false);
        return;
      }

      const currentSession = useDeckStore.getState().session;
      if (currentSession) {
        // Keep existing session name; just ensure default cards are loaded if empty
        if (currentSession.cards.length === 0) {
          try {
            const defaultCards = await useDeckStore.getState().getDefaultCards();
            useDeckStore.getState().addCards(defaultCards);
          } catch (error) {
            console.error('Failed to load default cards:', error);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        createSession('New Session');
        const defaultCards = await useDeckStore.getState().getDefaultCards();
        useDeckStore.getState().addCards(defaultCards);
      } catch (error) {
        console.error('Failed to initialize session/cards:', error);
        createSession('New Session');
      }
      setIsLoading(false);
    }, [createSession, loadSession]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useDeckStore.getState().undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useDeckStore.getState().redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = session?.cards.find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || !session) return;
    const cardId = active.id as string;
    const overId = over.id as string;
    if (['UNSORTED', 'YOU_ARE', 'YOU_ARE_NOT', 'INDECISIVE', 'DOES_NOT_APPLY'].includes(overId)) {
      const newPile = overId as Pile;
      useDeckStore.getState().moveCardAndShowNext(cardId, newPile);
      return;
    }
    const targetCard = session.cards.find(c => c.id === overId);
    if (!targetCard) return;
    const newPile = targetCard.pile;
    const cardsInPile = session.cards.filter(c => c.pile === newPile);
    const targetIndex = cardsInPile.findIndex(c => c.id === overId);
    const draggedCard = session.cards.find(c => c.id === cardId);
    if (!draggedCard) return;
    if (draggedCard.pile === newPile) {
      const oldIndex = cardsInPile.findIndex(c => c.id === cardId);
      if (oldIndex !== -1 && targetIndex !== -1) {
        const reorderedCards = arrayMove(cardsInPile, oldIndex, targetIndex);
        const newOrder = reorderedCards.findIndex(c => c.id === cardId);
        moveCard(cardId, newPile, newOrder);
      }
    } else {
      moveCard(cardId, newPile, targetIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Deck Sorter</h1>
          <p className="text-gray-600 mb-4">No session found. Please create a new session.</p>
          <button
            onClick={async () => {
              createSession('New Session');
              const defaultCards = await useDeckStore.getState().getDefaultCards();
              useDeckStore.getState().addCards(defaultCards);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Session
          </button>
        </div>
      </div>
    );
  }

  const youAreCards = getCardsInPile('YOU_ARE');
  const youAreNotCards = getCardsInPile('YOU_ARE_NOT');
  const indecisiveCards = getCardsInPile('INDECISIVE');
  const doesNotApplyCards = getCardsInPile('DOES_NOT_APPLY');

  return (
    <div className="min-h-screen bg-gray-100">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Toolbar onImportExport={() => setIsImportExportOpen(true)} />

        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-end mb-4">
            <button
              className="px-3 py-2 border rounded"
              onClick={async () => {
                try {
                  const { default: html2canvas } = await import('html2canvas');
                  const jsPDFLib = await import('jspdf');
                  const PdfCtor = (jsPDFLib as any).jsPDF || (jsPDFLib as any).default;
                  const pdf = new PdfCtor({ unit: 'pt', format: 'a4' });
                  const el = resultsRef.current;
                  if (!el) return;
                  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
                  const imgData = canvas.toDataURL('image/png');
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const pageHeight = pdf.internal.pageSize.getHeight();
                  const imgWidth = pageWidth - 40;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, Math.min(imgHeight, pageHeight - 40));
                  const name = (useDeckStore.getState().session?.name || 'session').replace(/[^a-z0-9-_]+/gi, '_');
                  // Robust save: use blob URL to avoid popup blockers
                  const blob = pdf.output('blob');
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${name}_deck_results.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setTimeout(() => URL.revokeObjectURL(url), 1000);

                  // Also export CSV of the results
                  const rows: string[] = [];
                  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
                  rows.push(['Pile','EN','IT'].join(','));
                  const addPile = (pileName: string, cardsArr: CardType[]) => {
                    cardsArr.forEach(c => rows.push([pileName, c.text_en || '', c.text_it || ''].map(esc).join(',')));
                  };
                  addPile('You Are', youAreCards);
                  addPile('You Are Not', youAreNotCards);
                  addPile('Indecisive', indecisiveCards);
                  addPile("Doesn't Apply", doesNotApplyCards);
                  const csvBlob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                  const csvUrl = URL.createObjectURL(csvBlob);
                  const a = document.createElement('a');
                  a.href = csvUrl;
                  a.download = `${name}_deck_results.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(csvUrl), 1000);
                } catch (err) {
                  console.error('Export failed', err);
                  alert('Export failed. Please try again.');
                }
              }}
            >
              Export PDF
            </button>
          </div>
          <div className="mb-8">
            <CardPair cards={getCurrentPair()} />
          </div>

          <div ref={resultsRef} className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
            <Column pile="YOU_ARE" cards={youAreCards} />
            <Column pile="YOU_ARE_NOT" cards={youAreNotCards} />
            <Column pile="INDECISIVE" cards={indecisiveCards} />
            <Column pile="DOES_NOT_APPLY" cards={doesNotApplyCards} />
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className={`
              w-80 h-48 rounded-2xl border-4 cursor-grabbing
              transition-all duration-300 scale-105 shadow-2xl
              flex items-center justify-center text-center
              ${activeCard.isOpposite 
                ? 'bg-black text-white border-gray-800' 
                : 'bg-white text-black border-gray-300'
              }
            `}>
              <div className="px-6">
                <span className="text-2xl font-bold leading-tight">
                  {language === 'en' ? activeCard.text_en : activeCard.text_it}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ImportExportDialog
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />
    </div>
  );
}


