import { Card, Pile } from './types';
import { nanoid } from 'nanoid';

// Load word pairs from JSON file
export const createDefaultCards = async (): Promise<Card[]> => {
  try {
    console.log('🚀 [DATA] Starting to load JSON...');
    // Add cache-busting parameter to force fresh load
    const cacheBuster = Date.now();
    console.log('🚀 [DATA] Cache buster:', cacheBuster);
    
    const response = await fetch(`/BrandDeck.json?t=${cacheBuster}`);
    console.log('🚀 [DATA] Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to load BrandDeck.json');
    }
    
    const data = await response.json();
    console.log('🚀 [DATA] JSON loaded, items count:', data.length);
    console.log('🚀 [DATA] First 3 items:', data.slice(0, 3));
    
    const cards: Card[] = [];
    let cardIndex = 0;

    data.forEach((item: any, index: number) => {
      const pairId = nanoid();
      console.log(`🚀 [DATA] Processing item ${index}:`, { ENG: item.ENG, ENG__1: item.ENG__1, pairId });
      
      // First word (white background, black text)
      const firstCard = {
        id: nanoid(),
        text_en: item.ENG,
        text_it: item.ITA.charAt(0).toUpperCase() + item.ITA.slice(1).toLowerCase(),
        pile: 'UNSORTED' as Pile,
        order: cardIndex++,
        isOpposite: false,
        pairId
      };
      cards.push(firstCard);
      console.log(`🚀 [DATA] Added first card:`, { id: firstCard.id, text: firstCard.text_en, pairId: firstCard.pairId });

      // Second word (black background, white text)
      const secondCard = {
        id: nanoid(),
        text_en: item.ENG__1,
        text_it: item.ITA__1.charAt(0).toUpperCase() + item.ITA__1.slice(1).toLowerCase(),
        pile: 'UNSORTED' as Pile,
        order: cardIndex++,
        isOpposite: true,
        pairId
      };
      cards.push(secondCard);
      console.log(`🚀 [DATA] Added second card:`, { id: secondCard.id, text: secondCard.text_en, pairId: secondCard.pairId });
    });

    console.log('🚀 [DATA] Total cards created:', cards.length);
    console.log('🚀 [DATA] Total pairs:', cards.length / 2);
    console.log('🚀 [DATA] First 6 cards:', cards.slice(0, 6).map(c => ({ id: c.id, text: c.text_en, pairId: c.pairId, isOpposite: c.isOpposite })));
    
    return cards;
  } catch (error) {
    console.error('🚀 [DATA] Failed to load BrandDeck.json:', error);
    return [];
  }
};
