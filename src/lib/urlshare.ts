import LZString from 'lz-string';
import { Session } from './types';

export const compressSession = (session: Session): string => {
  const jsonString = JSON.stringify(session);
  return LZString.compressToEncodedURIComponent(jsonString);
};

export const decompressSession = (compressed: string): Session | null => {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
    if (!jsonString) return null;
    
    const session = JSON.parse(jsonString);
    // Convert date strings back to Date objects
    session.createdAt = new Date(session.createdAt);
    session.updatedAt = new Date(session.updatedAt);
    
    return session;
  } catch (error) {
    console.error('Failed to decompress session:', error);
    return null;
  }
};

export const shareSessionURL = (session: Session): string => {
  const compressed = compressSession(session);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#${compressed}`;
};

export const loadSessionFromURL = (): Session | null => {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash.slice(1); // Remove the # character
  if (!hash) return null;
  
  return decompressSession(hash);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
