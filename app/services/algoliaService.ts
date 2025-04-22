import algoliasearch from 'algoliasearch';
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, PLACEHOLDER_TRENDING_WORDS } from './constants';
import { Word } from '../types';

// Interface for Algolia search hits
export interface AlgoliaHit {
  objectID: string;
  word: string;
  definition: string;
  example?: string;
  categories?: string[];
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

// Initialize the Algolia client with credentials
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = client.initIndex('brainrot_dictionary');

/**
 * Search for words based on a query string
 * Falls back to placeholder data if Algolia throws an error
 */
export async function searchWords(query: string): Promise<Word[]> {
  if (!query || query.trim() === '') {
    return getTrendingWords(10);
  }
  
  try {
    const { hits } = await index.search<AlgoliaHit>(query);
    
    return hits.map((hit: AlgoliaHit) => ({
      id: hit.objectID,
      word: hit.word,
      definition: hit.definition,
      example: hit.example,
      categories: hit.categories || [],
      createdAt: new Date(hit.createdAt || Date.now()),
      updatedAt: new Date(hit.updatedAt || Date.now())
    }));
  } catch (error) {
    console.warn('Algolia search error:', error);
    
    // Handle index not existing error gracefully
    if (error instanceof Error && 
        (error.message.includes('Index brainrot_dictionary does not exist') || 
         error.message.includes('index_not_found'))) {
      console.log('Using placeholder data since Algolia index does not exist');
    }
    
    // Filter placeholder data based on query as a fallback
    const normalizedQuery = query.toLowerCase().trim();
    return PLACEHOLDER_TRENDING_WORDS.filter(word => 
      word.word.toLowerCase().includes(normalizedQuery) ||
      word.definition.toLowerCase().includes(normalizedQuery)
    );
  }
}

/**
 * Get trending words
 * Currently returns placeholder data but could use Algolia analytics in the future
 */
export function getTrendingWords(limit = 10): Word[] {
  // TODO: In the future, this could use Algolia's analytics API to get actual trending words
  return PLACEHOLDER_TRENDING_WORDS.slice(0, limit);
}

/**
 * Get a word by ID
 * Checks placeholder data first, then tries to fetch from Algolia if needed
 */
export async function getWordById(id: string): Promise<Word | null> {
  try {
    // First check placeholder data
    const placeholderWord = PLACEHOLDER_TRENDING_WORDS.find(w => w.id === id);
    if (placeholderWord) return placeholderWord;
    
    // If not found in placeholders and we have an objectID format, try to 
    // retrieve it from search results by searching for it specifically
    try {
      // Use a workaround since Algolia doesn't have a direct 'get by ID' method
      // First try searching for the exact word if ID appears to be a word slug
      const normalizedId = id.toLowerCase().replace(/-/g, ' ');
      const { hits } = await index.search<AlgoliaHit>('', {
        filters: `objectID:${id} OR word:"${normalizedId}"`
      });
      
      if (hits && hits.length > 0) {
        // Found the word in Algolia
        const hit = hits[0];
        return {
          id: hit.objectID,
          word: hit.word,
          definition: hit.definition,
          example: hit.example,
          categories: hit.categories || [],
          createdAt: new Date(hit.createdAt || Date.now()),
          updatedAt: new Date(hit.updatedAt || Date.now())
        };
      }
    } catch (error) {
      console.warn('Error fetching word from Algolia:', error);
      // Continue to fallbacks
    }
    
    // As a fallback, use the wordId parameter as the word itself
    // This helps with simple demo scenarios where the ID might be the word slug
    const similiarWords = PLACEHOLDER_TRENDING_WORDS.filter(
      w => w.word.toLowerCase() === id.toLowerCase() || 
           w.word.toLowerCase().includes(id.toLowerCase()) ||
           id.toLowerCase().includes(w.word.toLowerCase())
    );
    
    if (similiarWords.length > 0) {
      return similiarWords[0];
    }
    
    // If we got here, create a fallback word as last resort
    return {
      id: id,
      word: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
      definition: "This is a placeholder definition for a word that exists in our system but detailed information is not available.",
      categories: ["Placeholder"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error getting word by ID:', error);
    return null;
  }
}

export default {
  searchWords,
  getTrendingWords,
  getWordById
}; 