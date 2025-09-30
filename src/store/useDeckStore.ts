import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Card, Pile, Session, AppState, AxisBoard, AxisItem, AxisLabels } from '@/lib/types';
import { saveSession, loadSession, saveAppState, loadAppState } from '@/lib/storage';
import { parseCSV } from '@/lib/csv';
import { createDefaultCards } from '@/lib/data';

interface DeckStore extends AppState {
  // Actions
  createSession: (name: string) => void;
  loadSession: (session: Session) => void;
  updateSessionName: (name: string) => void;
  // Axis boards
  createAxisBoard: (name?: string, labels?: Partial<AxisLabels>) => void;
  setActiveAxisBoard: (boardId: string | null) => void;
  updateAxisLabels: (boardId: string, labels: Partial<AxisLabels>) => void;
  updateAxisBoardName: (boardId: string, name: string) => void;
  deleteAxisBoard: (boardId: string) => void;
  addAxisItem: (boardId: string, label: string, x: number, y: number) => void;
  moveAxisItem: (boardId: string, itemId: string, x: number, y: number) => void;
  updateAxisItemLabel: (boardId: string, itemId: string, label: string) => void;
  deleteAxisItem: (boardId: string, itemId: string) => void;
  // Shared word actions across all boards
  addAxisWordAllBoards: (label: string) => void;
  updateAxisWordLabelAllBoards: (itemId: string, label: string) => void;
  deleteAxisWordAllBoards: (itemId: string) => void;
  addCard: (text_en: string, text_it: string) => void;
  addCards: (cards: Omit<Card, 'id' | 'pile' | 'order'>[]) => void;
  moveCard: (cardId: string, newPile: Pile, newOrder?: number) => void;
  deleteCard: (cardId: string) => void;
  setLanguage: (language: 'en' | 'it') => void;
  undo: () => void;
  redo: () => void;
  resetSession: () => void;
  getDefaultCards: () => Promise<Card[]>;
  importCSV: (csvContent: string) => void;
  saveToHistory: () => void;
  getCardsInPile: (pile: Pile) => Card[];
  getCurrentPair: () => Card[];
  moveCardAndShowNext: (cardId: string, newPile: Pile) => void;
  bringCardBackToCenter: (cardId: string) => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  // Initial state
  session: null,
  language: 'en',
  undoStack: [],
  redoStack: [],
  activeAxisBoardId: null,

  // Actions
  createSession: (name: string) => {
    const newSession: Session = {
      id: nanoid(),
      name,
      cards: [],
      axesBoards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set({ 
      session: newSession,
      undoStack: [],
      redoStack: []
    });
    
    saveSession(newSession);
    saveAppState({ language: get().language, activeAxisBoardId: null });
  },

  loadSession: (session: Session) => {
    set({ 
      session,
      undoStack: [],
      redoStack: [],
      activeAxisBoardId: session.axesBoards && session.axesBoards.length > 0 ? session.axesBoards[0].id : null
    });
    
    saveSession(session);
    saveAppState({ language: get().language, activeAxisBoardId: get().activeAxisBoardId });
  },

  updateSessionName: (name: string) => {
    const { session } = get();
    if (!session) return;
    
    const updatedSession = {
      ...session,
      name,
      updatedAt: new Date()
    };
    
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  // Axis boards
  createAxisBoard: (name?: string, labels: Partial<AxisLabels> = {}) => {
    const { session } = get();
    if (!session) return;
    const nextIndex = (session.axesBoards?.length || 0) + 1;
    const resolvedName = (name && name.trim()) ? name : `Map ${nextIndex}`;
    const board: AxisBoard = {
      id: nanoid(),
      name: resolvedName,
      labels: {
        top: labels.top ?? 'Top',
        bottom: labels.bottom ?? 'Bottom',
        left: labels.left ?? 'Left',
        right: labels.right ?? 'Right',
      },
      // If there are existing boards, copy their unique items (ids/labels) to keep shared words
      items: (session.axesBoards && session.axesBoards.length > 0)
        ? session.axesBoards[0].items.map(it => ({ id: it.id, label: it.label, x: 50, y: 50 }))
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedSession: Session = {
      ...session,
      axesBoards: [...(session.axesBoards ?? []), board],
      updatedAt: new Date(),
    };
    set({ session: updatedSession, activeAxisBoardId: board.id });
    saveSession(updatedSession);
    saveAppState({ activeAxisBoardId: board.id });
    get().saveToHistory();
  },

  setActiveAxisBoard: (boardId: string | null) => {
    set({ activeAxisBoardId: boardId });
    saveAppState({ activeAxisBoardId: boardId });
  },

  updateAxisLabels: (boardId: string, labels: Partial<AxisLabels>) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => b.id === boardId ? {
      ...b,
      labels: { ...b.labels, ...labels },
      updatedAt: new Date(),
    } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  updateAxisBoardName: (boardId: string, name: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const boards = session.axesBoards.map(b => b.id === boardId ? { ...b, name: trimmed, updatedAt: new Date() } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  deleteAxisBoard: (boardId: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.filter(b => b.id !== boardId);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  addAxisItem: (boardId: string, label: string, x: number, y: number) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const item: AxisItem = { id: nanoid(), label, x, y };
    const boards = session.axesBoards.map(b => b.id === boardId ? {
      ...b,
      items: [...b.items, item],
      updatedAt: new Date(),
    } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  moveAxisItem: (boardId: string, itemId: string, x: number, y: number) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => b.id === boardId ? {
      ...b,
      items: b.items.map(it => it.id === itemId ? { ...it, x, y } : it),
      updatedAt: new Date(),
    } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
  },

  updateAxisItemLabel: (boardId: string, itemId: string, label: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => b.id === boardId ? {
      ...b,
      items: b.items.map(it => it.id === itemId ? { ...it, label } : it),
      updatedAt: new Date(),
    } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  deleteAxisItem: (boardId: string, itemId: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => b.id === boardId ? {
      ...b,
      items: b.items.filter(it => it.id !== itemId),
      updatedAt: new Date(),
    } : b);
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  // Shared word actions across all boards
  addAxisWordAllBoards: (label: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const sharedId = nanoid();
    const boards = session.axesBoards.map(b => ({
      ...b,
      items: [...b.items, { id: sharedId, label, x: 50, y: 50 }],
      updatedAt: new Date(),
    }));
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  updateAxisWordLabelAllBoards: (itemId: string, label: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => ({
      ...b,
      items: b.items.map(it => it.id === itemId ? { ...it, label } : it),
      updatedAt: new Date(),
    }));
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  deleteAxisWordAllBoards: (itemId: string) => {
    const { session } = get();
    if (!session || !session.axesBoards) return;
    const boards = session.axesBoards.map(b => ({
      ...b,
      items: b.items.filter(it => it.id !== itemId),
      updatedAt: new Date(),
    }));
    const updatedSession = { ...session, axesBoards: boards, updatedAt: new Date() };
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  addCard: (text_en: string, text_it: string) => {
    const { session } = get();
    if (!session) return;
    
    const newCard: Card = {
      id: nanoid(),
      text_en,
      text_it,
      pile: 'UNSORTED',
      order: session.cards.length
    };
    
    const updatedSession = {
      ...session,
      cards: [...session.cards, newCard],
      updatedAt: new Date()
    };
    
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

    addCards: (cards) => {
      console.log('📝 [STORE] addCards called with', cards.length, 'cards');
      const { session } = get();
      if (!session) {
        console.log('📝 [STORE] No session found, returning');
        return;
      }
      
      console.log('📝 [STORE] Current session has', session.cards.length, 'cards');
      console.log('📝 [STORE] First 3 incoming cards:', cards.slice(0, 3).map(c => ({ text: c.text_en, pairId: c.pairId, isOpposite: c.isOpposite })));
      
      const newCards: Card[] = cards.map((card, index) => ({
        ...card,
        id: nanoid(),
        pile: 'UNSORTED' as Pile,
        order: session.cards.length + index
      }));
      
      console.log('📝 [STORE] New cards created:', newCards.length);
      console.log('📝 [STORE] First 3 new cards:', newCards.slice(0, 3).map(c => ({ id: c.id, text: c.text_en, pairId: c.pairId, isOpposite: c.isOpposite })));
      
      const updatedSession = {
        ...session,
        cards: [...session.cards, ...newCards],
        updatedAt: new Date()
      };
      
      console.log('📝 [STORE] Updated session now has', updatedSession.cards.length, 'cards');
      console.log('📝 [STORE] Unsorted cards in updated session:', updatedSession.cards.filter(c => c.pile === 'UNSORTED').length);
      console.log('📝 [STORE] First 6 cards in updated session:', updatedSession.cards.slice(0, 6).map(c => ({ id: c.id, text: c.text_en, pairId: c.pairId, isOpposite: c.isOpposite })));
      
      set({ session: updatedSession });
      saveSession(updatedSession);
      get().saveToHistory();
      
      console.log('📝 [STORE] Session saved to localStorage');
    },

  moveCard: (cardId: string, newPile: Pile, newOrder?: number) => {
    const { session } = get();
    if (!session) return;
    
    const cardIndex = session.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    const card = session.cards[cardIndex];
    const updatedCard = { ...card, pile: newPile };
    
    // Remove card from current position
    const cardsWithoutCard = session.cards.filter(c => c.id !== cardId);
    
    // Update order for cards in the same pile
    const cardsInNewPile = cardsWithoutCard.filter(c => c.pile === newPile);
    const targetOrder = newOrder !== undefined ? newOrder : cardsInNewPile.length;
    
    // Insert card at new position
    const updatedCards = [...cardsWithoutCard];
    updatedCards.splice(targetOrder, 0, updatedCard);
    
    // Reorder all cards to maintain proper order values
    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      order: index
    }));
    
    const updatedSession = {
      ...session,
      cards: reorderedCards,
      updatedAt: new Date()
    };
    
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  deleteCard: (cardId: string) => {
    const { session } = get();
    if (!session) return;
    
    const updatedSession = {
      ...session,
      cards: session.cards.filter(card => card.id !== cardId),
      updatedAt: new Date()
    };
    
    set({ session: updatedSession });
    saveSession(updatedSession);
    get().saveToHistory();
  },

  setLanguage: (language: 'en' | 'it') => {
    set({ language });
    saveAppState({ language });
  },



  undo: () => {
    const { undoStack, session } = get();
    if (undoStack.length === 0 || !session) return;
    
    const previousSession = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    const newRedoStack = [...get().redoStack, session];
    
    set({
      session: previousSession,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });
    
    saveSession(previousSession);
  },

  redo: () => {
    const { redoStack, session } = get();
    if (redoStack.length === 0 || !session) return;
    
    const nextSession = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    const newUndoStack = [...get().undoStack, session];
    
    set({
      session: nextSession,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });
    
    saveSession(nextSession);
  },

  resetSession: () => {
    set({
      session: null,
      undoStack: [],
      redoStack: []
    });
    
    // Clear localStorage
    localStorage.removeItem('branddeck_session');
  },

  getDefaultCards: async () => {
    return await createDefaultCards();
  },

  importCSV: (csvContent: string) => {
    try {
      console.log('Importing CSV...');
      const cards = parseCSV(csvContent);
      console.log('Parsed cards:', cards.length);
      
      const { session } = get();
      
      if (!session) {
        console.log('No session, creating new one');
        get().createSession('Imported Session');
        get().addCards(cards);
      } else {
        console.log('Adding cards to existing session');
        get().addCards(cards);
      }
      
      const { session: updatedSession } = get();
      console.log('Updated session cards:', updatedSession?.cards.length);
    } catch (error) {
      console.error('Failed to import CSV:', error);
      throw error;
    }
  },

  saveToHistory: () => {
    const { session, undoStack } = get();
    if (!session) return;
    
    const newUndoStack = [...undoStack, { ...session }];
    // Keep only last 50 states
    const trimmedUndoStack = newUndoStack.slice(-50);
    
    set({
      undoStack: trimmedUndoStack,
      redoStack: []
    });
  },


  getCardsInPile: (pile: Pile) => {
    const { session } = get();
    if (!session) return [];
    
    return session.cards
      .filter(card => card.pile === pile)
      .sort((a, b) => a.order - b.order);
  },

  getCurrentPair: () => {
    console.log('🔍 [PAIR] getCurrentPair called');
    const { session } = get();
    if (!session) {
      console.log('🔍 [PAIR] No session found');
      return [];
    }
    
    console.log('🔍 [PAIR] Session has', session.cards.length, 'total cards');
    
    // Find the first unsorted pair
    const unsortedCards = session.cards.filter(card => card.pile === 'UNSORTED');
    console.log('🔍 [PAIR] Unsorted cards:', unsortedCards.length);
    console.log('🔍 [PAIR] First 6 unsorted cards:', unsortedCards.slice(0, 6).map(c => ({ id: c.id, text: c.text_en, pairId: c.pairId, isOpposite: c.isOpposite })));
    
    if (unsortedCards.length === 0) {
      console.log('🔍 [PAIR] No unsorted cards found');
      return [];
    }
    
    // Group cards by pairId to find complete pairs
    const pairGroups = new Map<string, Card[]>();
    unsortedCards.forEach(card => {
      if (card.pairId) {
        if (!pairGroups.has(card.pairId)) {
          pairGroups.set(card.pairId, []);
        }
        pairGroups.get(card.pairId)!.push(card);
      }
    });
    
    console.log('🔍 [PAIR] Pair groups found:', pairGroups.size);
    console.log('🔍 [PAIR] Pair groups:', Array.from(pairGroups.entries()).map(([pairId, cards]) => ({ pairId, count: cards.length, cards: cards.map(c => c.text_en) })));
    
    // Find the first complete pair (2 cards)
    for (const [pairId, cards] of pairGroups) {
      if (cards.length === 2) {
        console.log('🔍 [PAIR] Found complete pair:', { pairId, cards: cards.map(c => ({ id: c.id, text: c.text_en, isOpposite: c.isOpposite })) });
        return cards;
      }
    }
    
    // If no complete pairs found, return single cards without pairId
    const singleCards = unsortedCards.filter(card => !card.pairId);
    if (singleCards.length > 0) {
      console.log('🔍 [PAIR] No complete pairs, returning single card');
      return singleCards.slice(0, 1);
    }
    
    console.log('🔍 [PAIR] No cards to display');
    return [];
  },

  moveCardAndShowNext: (cardId: string, newPile: Pile) => {
    const { session, moveCard } = get();
    if (!session) return;
    
    // Get the selected card before moving it
    const selectedCard = session.cards.find(c => c.id === cardId);
    if (!selectedCard) return;
    
    // Move the selected card
    moveCard(cardId, newPile);
    
    // If it's part of a pair, hide the other card completely
    if (selectedCard.pairId) {
      const pairCard = session.cards.find(c => 
        c.pairId === selectedCard.pairId && c.id !== cardId
      );
      if (pairCard) {
        moveCard(pairCard.id, 'HIDDEN');
      }
    }
  },

  bringCardBackToCenter: (cardId: string) => {
    const { session, moveCard } = get();
    if (!session) return;
    
    // Move the selected card back to unsorted
    moveCard(cardId, 'UNSORTED');
    
    // If it's part of a pair, bring the other card back too
    const selectedCard = session.cards.find(c => c.id === cardId);
    if (selectedCard?.pairId) {
      const pairCard = session.cards.find(c => 
        c.pairId === selectedCard.pairId && c.id !== cardId
      );
      if (pairCard) {
        moveCard(pairCard.id, 'UNSORTED');
      }
    }
    
    // Move any other unsorted cards to the end so this pair becomes the current pair
    const unsortedCards = session.cards.filter(card => card.pile === 'UNSORTED');
    const otherUnsortedCards = unsortedCards.filter(card => 
      !card.pairId || card.pairId !== selectedCard?.pairId
    );
    
    // Update order of other unsorted cards to be after the returned pair
    otherUnsortedCards.forEach((card, index) => {
      const newOrder = 1000 + index; // Put them after the returned pair
      moveCard(card.id, 'UNSORTED', newOrder);
    });
  }
}));

// Initialize store from localStorage on client side
if (typeof window !== 'undefined') {
  const savedSession = loadSession();
  const savedAppState = loadAppState();
  
  if (savedSession) {
    useDeckStore.getState().loadSession(savedSession);
  }
  
  if (savedAppState.language) {
    useDeckStore.getState().setLanguage(savedAppState.language as 'en' | 'it');
  }
}
