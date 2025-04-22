// Constants for Algolia configuration
export const ALGOLIA_APP_ID = 'Q6EH96IRPB';
export const ALGOLIA_SEARCH_KEY = '29e903fc5c85d8d4937cb0b69fac73fb';

// Basic flag to determine if Algolia is configured
export const isAlgoliaConfigured = () => {
  return !!ALGOLIA_APP_ID && !!ALGOLIA_SEARCH_KEY;
};

// Placeholder trending words for initial display
export const PLACEHOLDER_TRENDING_WORDS = [
  {
    id: 'placeholder1',
    word: 'Rizz',
    definition: 'Charm or the ability to attract a romantic partner through style, charisma, and appeal.',
    categories: ['Social Media', 'Dating'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'placeholder2',
    word: 'Slay',
    definition: 'To do something exceptionally well or impressively.',
    categories: ['Social Media'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'placeholder3',
    word: 'Bussin',
    definition: 'Extremely good, especially referring to food.',
    categories: ['Food'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Default export
const constants = {
  ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_KEY,
  isAlgoliaConfigured,
  PLACEHOLDER_TRENDING_WORDS
};

export default constants; 