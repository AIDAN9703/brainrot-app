/**
 * Core data types for the Brainrot Dictionary app
 */

// Word type representing a dictionary word
export interface Word {
  id?: string;
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  createdAt: number | Date;
  updatedAt: number | Date;
  createdBy?: string;
  isTrending?: boolean;
  categories?: string[]; // Array of category names
}

// Firestore-specific word document
export interface WordDocument {
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  createdAt: number; // Timestamp in milliseconds
  updatedAt: number; // Timestamp in milliseconds
  createdBy?: string;
  isTrending?: boolean;
  categories?: string[]; // Array of category names
}

// User Badge
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // Ionicons name
  dateEarned: number | Date;
}

// User Stats
export interface UserStats {
  wordsViewed: number;
  wordsFavorited: number;
  quizzesTaken: number;
  quizzesPassed: number;
  totalScore: number;
  streakDays: number;
  lastActive: number | Date;
}

// User Settings
export interface UserSettings {
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  emailNotifications: boolean;
  quizDifficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

// User type representing app user
export interface User {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  username?: string;
  createdAt: Date | number;
  lastLoginAt?: Date | number;
  favoriteWords?: string[]; // Array of word IDs
  recentWords?: string[]; // Array of recently viewed word IDs
  badges?: Badge[]; // User earned badges
  stats?: UserStats; // User activity statistics
  settings?: UserSettings; // User preferences
}

// Firestore-specific user document
export interface UserDocument extends Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'badges' | 'stats'> {
  createdAt: number; // Timestamp in milliseconds
  lastLoginAt?: number; // Timestamp in milliseconds
  badges?: {
    id: string;
    name: string;
    description: string;
    iconName: string;
    dateEarned: number;
  }[];
  stats?: {
    wordsViewed: number;
    wordsFavorited: number;
    quizzesTaken: number;
    quizzesPassed: number;
    totalScore: number;
    streakDays: number;
    lastActive: number;
  };
}

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Export default empty object to satisfy Expo Router
export default {}; 