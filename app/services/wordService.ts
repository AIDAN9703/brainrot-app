import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit as firebaseLimit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Word, WordDocument } from '../types';

// Collection reference
const wordsCollection = collection(db, 'words');

// Convert Firestore document to Word
const convertWord = (doc: any): Word => {
  const data = doc.data() as WordDocument;
  
  // Helper function to safely convert any date format to a JavaScript Date
  const safeDate = (dateField: any): Date => {
    if (!dateField) return new Date(); // Default to current date if undefined
    if (dateField instanceof Date) return dateField;
    if (typeof dateField === 'number') return new Date(dateField);
    if (dateField.toDate && typeof dateField.toDate === 'function') return dateField.toDate();
    return new Date(dateField); // Try to parse as string or timestamp
  };
  
  return {
    id: doc.id,
    ...data,
    createdAt: safeDate(data.createdAt),
    updatedAt: safeDate(data.updatedAt)
  };
};

// Get all words
export const getAllWords = async (): Promise<Word[]> => {
  const snapshot = await getDocs(wordsCollection);
  return snapshot.docs.map(convertWord);
};

// Get word by ID
export const getWordById = async (id: string): Promise<Word | null> => {
  const docRef = doc(db, 'words', id);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return convertWord(snapshot);
  }
  
  return null;
};

// Get trending words
export const getTrendingWords = async (limitCount = 10): Promise<Word[]> => {
  try {
    const q = query(
      wordsCollection, 
      where('isTrending', '==', true),
      firebaseLimit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    // Sort client-side instead of using orderBy to avoid index requirement
    const trendingWords = snapshot.docs.map(convertWord)
      .sort((a, b) => {
        // Ensure both dates are Date objects with getTime method
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
    
    return trendingWords;
  } catch (error) {
    console.error('Error fetching trending words:', error);
    return [];
  }
};

// Search words
export const searchWords = async (searchTerm: string): Promise<Word[]> => {
  // Firestore doesn't support native text search,
  // so we'll fetch all and filter client-side for small datasets
  // For production use with large datasets, consider Algolia or ElasticSearch
  const snapshot = await getDocs(wordsCollection);
  
  return snapshot.docs
    .map(convertWord)
    .filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Create new word
export const createWord = async (word: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>): Promise<Word> => {
  const timestamp = Date.now();
  
  const newWord: WordDocument = {
    ...word,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const docRef = await addDoc(wordsCollection, newWord);
  return {
    id: docRef.id,
    ...newWord,
    createdAt: new Date(timestamp),
    updatedAt: new Date(timestamp)
  };
};

// Update word
export const updateWord = async (id: string, word: Partial<Omit<Word, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const docRef = doc(db, 'words', id);
  
  await updateDoc(docRef, {
    ...word,
    updatedAt: Date.now()
  });
};

// Delete word
export const deleteWord = async (id: string): Promise<void> => {
  const docRef = doc(db, 'words', id);
  await deleteDoc(docRef);
};

// Add default export to satisfy Expo Router
const wordService = {
  getAllWords,
  getWordById,
  getTrendingWords,
  searchWords,
  createWord,
  updateWord,
  deleteWord
};

export default wordService; 