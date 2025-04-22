import { Word } from '../types';
import { searchWords, getTrendingWords, getWordById } from './algoliaService';

/**
 * WordService
 * 
 * This service handles word-related operations and might involve multiple data sources
 * in the future. For now, it's primarily a pass-through to algoliaService, but is kept
 * as a separate layer for potential extensions like:
 * 
 * - Combining search results from multiple sources
 * - Adding business logic around word operations
 * - Managing word caching and offline access
 * - Creating, updating, or deleting words (admin functionality)
 */

// Re-export base functions from algoliaService for convenience
export { searchWords, getTrendingWords, getWordById };

// Add word (future functionality)
export const addWord = async (wordData: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>): Promise<Word | null> => {
  // TODO: Implement word creation functionality
  console.log('Word creation not yet implemented', wordData);
  return null;
};

// Update word (future functionality)
export const updateWord = async (id: string, wordData: Partial<Word>): Promise<Word | null> => {
  // TODO: Implement word update functionality
  console.log('Word update not yet implemented', id, wordData);
  return null;
};

// Delete word (future functionality)
export const deleteWord = async (id: string): Promise<boolean> => {
  // TODO: Implement word deletion functionality
  console.log('Word deletion not yet implemented', id);
  return false;
};

// Add default export to satisfy Expo Router
const wordService = {
  searchWords,
  getWordById,
  getTrendingWords,
  addWord,
  updateWord,
  deleteWord
};

export default wordService; 