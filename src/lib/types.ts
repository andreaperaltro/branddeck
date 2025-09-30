export type Pile = 'UNSORTED' | 'YOU_ARE' | 'YOU_ARE_NOT' | 'INDECISIVE' | 'DOES_NOT_APPLY' | 'HIDDEN';

export interface Card {
  id: string;
  text_en: string;
  text_it: string;
  pile: Pile;
  order: number;
  isOpposite?: boolean; // true for the second word in a pair
  pairId?: string; // groups the two opposite words together
}

export interface Session {
  id: string;
  name: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
  axesBoards?: AxisBoard[];
}

export interface AppState {
  session: Session | null;
  language: 'en' | 'it';
  undoStack: Session[];
  redoStack: Session[];
  activeAxisBoardId?: string | null;
}

export interface ImportExportData {
  session: Session;
  language: 'en' | 'it';
}

export interface CSVRow {
  text_en: string;
  text_it: string;
}

export const PILE_LABELS: Record<Pile, string> = {
  UNSORTED: 'Unsorted',
  YOU_ARE: 'You Are',
  YOU_ARE_NOT: 'You Are Not',
  INDECISIVE: 'Indecisive',
  DOES_NOT_APPLY: 'Doesn\'t Apply',
  HIDDEN: 'Hidden'
};

export const PILE_COLORS: Record<Pile, string> = {
  UNSORTED: 'bg-gray-100 border-gray-300',
  YOU_ARE: 'bg-green-100 border-green-300',
  YOU_ARE_NOT: 'bg-red-100 border-red-300',
  INDECISIVE: 'bg-yellow-100 border-yellow-300',
  DOES_NOT_APPLY: 'bg-blue-100 border-blue-300',
  HIDDEN: 'bg-gray-50 border-gray-200'
};

export const PILE_HEADER_COLORS: Record<Pile, string> = {
  UNSORTED: 'bg-gray-200 text-gray-800',
  YOU_ARE: 'bg-green-200 text-green-800',
  YOU_ARE_NOT: 'bg-red-200 text-red-800',
  INDECISIVE: 'bg-yellow-200 text-yellow-800',
  DOES_NOT_APPLY: 'bg-blue-200 text-blue-800',
  HIDDEN: 'bg-gray-100 text-gray-600'
};

// Axis Tool Types
export interface AxisLabels {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export interface AxisItem {
  id: string;
  label: string;
  // position as percentage within the board (0-100)
  x: number;
  y: number;
}

export interface AxisBoard {
  id: string;
  name: string;
  labels: AxisLabels;
  items: AxisItem[];
  createdAt: Date;
  updatedAt: Date;
}
