import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import { Card, Pile, CSVRow } from './types';

export const parseCSV = (csvContent: string): Card[] => {
  const result = Papa.parse<any>(csvContent, {
    header: false, // Don't use header, we'll handle columns manually
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
    throw new Error('Failed to parse CSV file');
  }

  const cards: Card[] = [];
  let cardIndex = 0;

  result.data.forEach((row, rowIndex) => {
    // Skip header row
    if (rowIndex === 0) return;
    
    // Handle your specific CSV format: ENG,ITA,ENG,ITA
    // Row is an array: [textEn1, textIt1, textEn2, textIt2]
    const textEn1 = row[0] || '';
    const textIt1 = row[1] || '';
    const textEn2 = row[2] || '';
    const textIt2 = row[3] || '';

    if (textEn1 && textEn2) {
      // Create pair of opposite words
      const pairId = nanoid();
      
      // First word (white background, black text)
      cards.push({
        id: nanoid(),
        text_en: textEn1.trim(),
        text_it: textIt1.trim().charAt(0).toUpperCase() + textIt1.trim().slice(1).toLowerCase(),
        pile: 'UNSORTED' as Pile,
        order: cardIndex++,
        isOpposite: false,
        pairId
      });

      // Second word (black background, white text)
      cards.push({
        id: nanoid(),
        text_en: textEn2.trim(),
        text_it: textIt2.trim().charAt(0).toUpperCase() + textIt2.trim().slice(1).toLowerCase(),
        pile: 'UNSORTED' as Pile,
        order: cardIndex++,
        isOpposite: true,
        pairId
      });
    } else if (textEn1) {
      // Single word - still create a pair with itself
      const pairId = nanoid();
      cards.push({
        id: nanoid(),
        text_en: textEn1.trim(),
        text_it: textIt1.trim(),
        pile: 'UNSORTED' as Pile,
        order: cardIndex++,
        isOpposite: false,
        pairId
      });
    }
  });

  return cards;
};

export const exportToCSV = (cards: Card[]): string => {
  // Filter out hidden cards and organize by piles
  const visibleCards = cards.filter(card => card.pile !== 'HIDDEN');
  
  // Group cards by pile
  const piles = {
    'UNSORTED': visibleCards.filter(card => card.pile === 'UNSORTED'),
    'YOU_ARE': visibleCards.filter(card => card.pile === 'YOU_ARE'),
    'YOU_ARE_NOT': visibleCards.filter(card => card.pile === 'YOU_ARE_NOT'),
    'INDECISIVE': visibleCards.filter(card => card.pile === 'INDECISIVE'),
    'DOES_NOT_APPLY': visibleCards.filter(card => card.pile === 'DOES_NOT_APPLY')
  };

  // Find the maximum number of cards in any pile
  const maxCards = Math.max(...Object.values(piles).map(pile => pile.length));

  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push([
    'Unsorted',
    'You Are',
    'You Are Not', 
    'Indecisive',
    'Doesn\'t Apply'
  ]);

  // Add data rows
  for (let i = 0; i < maxCards; i++) {
    const row = [
      piles.UNSORTED[i]?.text_en || '',
      piles.YOU_ARE[i]?.text_en || '',
      piles.YOU_ARE_NOT[i]?.text_en || '',
      piles.INDECISIVE[i]?.text_en || '',
      piles.DOES_NOT_APPLY[i]?.text_en || ''
    ];
    csvRows.push(row);
  }

  return Papa.unparse(csvRows, {
    header: false
  });
};

export const downloadCSV = (csvContent: string, filename: string = 'branddeck-export.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadJSON = (data: any, filename: string = 'branddeck-export.json'): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
