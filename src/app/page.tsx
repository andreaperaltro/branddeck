'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useDeckStore } from '@/store/useDeckStore';
import { Card as CardType, Pile } from '@/lib/types';
import { Toolbar } from '@/components/Toolbar';
import { Column } from '@/components/Column';
import { UnsortedTray } from '@/components/UnsortedTray';
import { Card } from '@/components/Card';
import { CardPair } from '@/components/CardPair';
import { ImportExportDialog } from '@/components/ImportExportDialog';
import { loadSessionFromURL } from '@/lib/urlshare';

export default function HomePage() {
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

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🎯 [PAGE] initializeSession called');
      
      // Check for URL-shared session first
      const urlSession = loadSessionFromURL();
      if (urlSession) {
        console.log('🎯 [PAGE] URL session found, loading it');
        loadSession(urlSession);
        setIsLoading(false);
        return;
      }

      // Check if we already have a session with cards
      const currentSession = useDeckStore.getState().session;
      console.log('🎯 [PAGE] Current session check:', { hasSession: !!currentSession, cardCount: currentSession?.cards.length || 0 });
      
      if (currentSession && currentSession.cards.length > 0) {
        console.log('🎯 [PAGE] Using existing session with', currentSession.cards.length, 'cards');
        setIsLoading(false);
        return;
      }

        // Load default cards if no session exists
        try {
          console.log('🎯 [PAGE] Loading default cards...');
          createSession('Brand Deck');
          console.log('🎯 [PAGE] Session created, now loading cards...');
        
        // Add default cards immediately after session creation
        const defaultCards = await useDeckStore.getState().getDefaultCards();
        console.log('🎯 [PAGE] Default cards loaded:', defaultCards.length);
        
        useDeckStore.getState().addCards(defaultCards);
        console.log('🎯 [PAGE] Cards added to session');
      } catch (error) {
        console.error('🎯 [PAGE] Failed to load default cards:', error);
        createSession('New Session');
      }
      
      setIsLoading(false);
      console.log('🎯 [PAGE] Initialization complete');
    };

    initializeSession();
  }, []); // Empty dependency array - run only once on mount

  // Keyboard shortcuts for undo/redo
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

    // If dropping on a pile (from CardPair component)
    if (['UNSORTED', 'YOU_ARE', 'YOU_ARE_NOT', 'INDECISIVE', 'DOES_NOT_APPLY'].includes(overId)) {
      const newPile = overId as Pile;
      // Use moveCardAndShowNext for card pair experience
      useDeckStore.getState().moveCardAndShowNext(cardId, newPile);
      return;
    }

    // If dropping on another card, find the target card and its pile
    const targetCard = session.cards.find(c => c.id === overId);
    if (!targetCard) return;

    const newPile = targetCard.pile;
    const cardsInPile = session.cards.filter(c => c.pile === newPile);
    const targetIndex = cardsInPile.findIndex(c => c.id === overId);

    const draggedCard = session.cards.find(c => c.id === cardId);
    if (!draggedCard) return;

    if (draggedCard.pile === newPile) {
      // Reordering within the same pile
      const oldIndex = cardsInPile.findIndex(c => c.id === cardId);
      if (oldIndex !== -1 && targetIndex !== -1) {
        const reorderedCards = arrayMove(cardsInPile, oldIndex, targetIndex);
        const newOrder = reorderedCards.findIndex(c => c.id === cardId);
        moveCard(cardId, newPile, newOrder);
      }
    } else {
      // Moving to a different pile
      moveCard(cardId, newPile, targetIndex);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This is handled by the droppable areas
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
                      // Load default cards for new session
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

  // Get cards for each pile
  const unsortedCards = getCardsInPile('UNSORTED');
  const youAreCards = getCardsInPile('YOU_ARE');
  const youAreNotCards = getCardsInPile('YOU_ARE_NOT');
  const indecisiveCards = getCardsInPile('INDECISIVE');
  const doesNotApplyCards = getCardsInPile('DOES_NOT_APPLY');

  // Use cards directly without filtering
  const filteredUnsortedCards = unsortedCards;
  const filteredYouAreCards = youAreCards;
  const filteredYouAreNotCards = youAreNotCards;
  const filteredIndecisiveCards = indecisiveCards;
  const filteredDoesNotApplyCards = doesNotApplyCards;

  return (
    <div className="min-h-screen bg-gray-50">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Toolbar
          onImportExport={() => setIsImportExportOpen(true)}
        />

        <div className="max-w-7xl mx-auto p-4">
          {/* Card-by-Card Experience */}
          <div className="mb-8">
            <CardPair cards={getCurrentPair()} />
          </div>

          {/* Sorting Columns - Show Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Column pile="YOU_ARE" cards={filteredYouAreCards} />
            <Column pile="YOU_ARE_NOT" cards={filteredYouAreNotCards} />
            <Column pile="INDECISIVE" cards={filteredIndecisiveCards} />
            <Column pile="DOES_NOT_APPLY" cards={filteredDoesNotApplyCards} />
          </div>

          {/* Empty State */}
          {session.cards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cards Yet</h2>
              <p className="text-gray-600 mb-6">
                Start by importing a CSV file or adding cards manually
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsImportExportOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Import CSV
                </button>
                <button
                  onClick={() => setIsAddCardsOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Cards
                </button>
              </div>
            </div>
          )}
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

      {/* Dialogs */}
          <ImportExportDialog
            isOpen={isImportExportOpen}
            onClose={() => setIsImportExportOpen(false)}
          />
    </div>
  );
}