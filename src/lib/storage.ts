import { Session, AppState, AxisBoard } from './types';

const STORAGE_KEYS = {
  SESSION: 'branddeck_session',
  APP_STATE: 'branddeck_app_state'
} as const;

export const saveSession = (session: Session): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

export const loadSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    // Convert date strings back to Date objects
    session.createdAt = new Date(session.createdAt);
    session.updatedAt = new Date(session.updatedAt);
    if (session.axesBoards && Array.isArray(session.axesBoards)) {
      session.axesBoards = (session.axesBoards as Array<{
        id: string;
        name: string;
        labels: AxisBoard['labels'];
        items: AxisBoard['items'];
        createdAt: string | Date;
        updatedAt: string | Date;
      }>).map((b) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      })) as AxisBoard[];
    }
    
    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
};

export const saveAppState = (appState: Partial<AppState>): void => {
  try {
    const currentState = loadAppState();
    const newState = { ...currentState, ...appState };
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(newState));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const loadAppState = (): Partial<AppState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!stored) return {};
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load app state:', error);
    return {};
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

export const exportSession = (session: Session): string => {
  return JSON.stringify(session, null, 2);
};

export const importSession = (jsonString: string): Session | null => {
  try {
    const session = JSON.parse(jsonString);
    // Validate session structure
    if (!session.id || !session.name || !Array.isArray(session.cards)) {
      throw new Error('Invalid session format');
    }
    
    // Convert date strings back to Date objects
    session.createdAt = new Date(session.createdAt);
    session.updatedAt = new Date(session.updatedAt);
    if (session.axesBoards && Array.isArray(session.axesBoards)) {
      session.axesBoards = session.axesBoards.map((b: {
        id: string;
        name: string;
        labels: AxisBoard['labels'];
        items: AxisBoard['items'];
        createdAt: string | Date;
        updatedAt: string | Date;
      }) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      }));
    }
    
    return session;
  } catch (error) {
    console.error('Failed to import session:', error);
    return null;
  }
};
