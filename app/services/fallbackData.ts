import { Word } from '../types';

// Sample trending data for fallback when Algolia isn't configured
export const TRENDING_WORDS: Word[] = [
  { 
    id: '1', 
    word: 'rizz', 
    definition: 'Charisma or the ability to attract a romantic partner',
    example: 'He has so much rizz, he got her number in five minutes.',
    categories: ['slang', 'dating'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '2', 
    word: 'bussin', 
    definition: 'Something that is extremely good or delicious',
    example: 'This food is bussin!',
    categories: ['slang', 'food'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '3', 
    word: 'slay', 
    definition: 'To do something exceptionally well',
    example: 'You really slayed that presentation!',
    categories: ['slang', 'achievements'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '4', 
    word: 'mid', 
    definition: 'Something that is mediocre or of average quality',
    example: 'The movie was pretty mid, not great but not terrible.',
    categories: ['slang', 'criticism'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '5', 
    word: 'cap', 
    definition: 'A lie or to lie about something',
    example: 'That\'s cap! I know you weren\'t there.',
    categories: ['slang'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '6', 
    word: 'no cap', 
    definition: 'No lie, telling the truth',
    example: 'No cap, that was the best concert I\'ve ever been to.',
    categories: ['slang'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '7', 
    word: 'sus', 
    definition: 'Suspicious or questionable',
    example: 'The way he left early was kinda sus.',
    categories: ['slang', 'gaming'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '8', 
    word: 'bet', 
    definition: 'An affirmation or agreement',
    example: 'Want to go to the movies tonight? Bet!',
    categories: ['slang'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '9', 
    word: 'yeet', 
    definition: 'To throw something with force',
    example: 'He yeeted his phone across the room when he got scared.',
    categories: ['slang', 'actions'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  },
  { 
    id: '10', 
    word: 'vibe check', 
    definition: 'Assessing someone\'s mood or energy',
    example: 'Just doing a vibe check to see how everyone\'s feeling.',
    categories: ['slang', 'mood'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTrending: true
  }
];

// Get a word by ID from the fallback data
export const getFallbackWordById = (id: string): Word | null => {
  const word = TRENDING_WORDS.find(word => word.id === id);
  return word || null;
};

// Search words in fallback data
export const searchFallbackWords = (query: string): Word[] => {
  if (!query || query.trim() === '') {
    return TRENDING_WORDS;
  }
  
  const lowerQuery = query.toLowerCase();
  return TRENDING_WORDS.filter(word => 
    word.word.toLowerCase().includes(lowerQuery) || 
    word.definition.toLowerCase().includes(lowerQuery) ||
    (word.example && word.example.toLowerCase().includes(lowerQuery)) ||
    (word.categories && word.categories.some(cat => cat.toLowerCase().includes(lowerQuery)))
  );
};

// Get words by category
export const getFallbackWordsByCategory = (category: string): Word[] => {
  return TRENDING_WORDS.filter(word => 
    word.categories && word.categories.includes(category)
  );
};

// Default export
const fallbackData = {
  TRENDING_WORDS,
  getFallbackWordById,
  searchFallbackWords,
  getFallbackWordsByCategory
};

export default fallbackData; 