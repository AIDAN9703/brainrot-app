import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  signInWithCredential,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment as firestoreIncrement
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  User, 
  UserDocument, 
  Badge, 
  UserStats, 
  UserSettings 
} from '../types';

const USERS_COLLECTION = 'users';

/**
 * Convert Firestore document to User
 */
const convertUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    bio: data.bio,
    username: data.username,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate(),
    favoriteWords: data.favoriteWords || [],
    recentWords: data.recentWords || [],
    badges: data.badges?.map((badge: any) => ({
      ...badge,
      dateEarned: badge.dateEarned?.toDate() || new Date(badge.dateEarned)
    })) || [],
    stats: data.stats ? {
      ...data.stats,
      lastActive: data.stats.lastActive?.toDate() || new Date(data.stats.lastActive)
    } : undefined,
    settings: data.settings
  };
};

/**
 * Register new user
 */
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update the profile if displayName is provided
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }
    
    // Create user document in Firestore with enhanced profile data
    const timestamp = Date.now();
    const userDoc: UserDocument = {
      email: firebaseUser.email || email,
      displayName: displayName || firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      bio: '',
      username: email.split('@')[0], // Default username from email
      createdAt: timestamp,
      lastLoginAt: timestamp,
      favoriteWords: [],
      recentWords: [],
      badges: [],
      stats: {
        wordsViewed: 0,
        wordsFavorited: 0,
        quizzesTaken: 0,
        quizzesPassed: 0,
        totalScore: 0,
        streakDays: 0,
        lastActive: timestamp
      },
      settings: {
        notificationsEnabled: true,
        darkModeEnabled: false,
        emailNotifications: true,
        quizDifficulty: 'medium',
        language: 'en'
      }
    };
    
    // Use the Firebase Auth UID as the document ID
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userDoc);
    
    // Return the user with proper type conversion
    return {
      id: firebaseUser.uid,
      ...userDoc,
      createdAt: new Date(timestamp),
      lastLoginAt: new Date(timestamp),
      stats: {
        ...userDoc.stats!,
        lastActive: new Date(timestamp)
      }
    };
    
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign in user
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update lastLoginAt in Firestore
    const userRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      'stats.lastActive': serverTimestamp()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign in with Google credential
 */
export const signInWithGoogle = async (idToken: string) => {
  try {
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign in with credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return convertUser(userDoc);
  } catch (error) {
    console.error(`Error getting user with id ${userId}:`, error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.log('No current user in Firebase Auth');
    return null;
  }
  
  try {
    console.log('Getting user data for:', currentUser.uid);
    const userRef = doc(db, USERS_COLLECTION, currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating it');
      // Create a basic user profile if it doesn't exist
      const newUser: UserDocument = {
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        bio: '',
        username: currentUser.email ? currentUser.email.split('@')[0] : '',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        favoriteWords: [],
        recentWords: [],
        badges: [],
        stats: {
          wordsViewed: 0,
          wordsFavorited: 0,
          quizzesTaken: 0,
          quizzesPassed: 0,
          totalScore: 0,
          streakDays: 0,
          lastActive: Date.now()
        },
        settings: {
          notificationsEnabled: true,
          darkModeEnabled: false,
          emailNotifications: true,
          quizDifficulty: 'medium',
          language: 'en'
        }
      };
      
      await setDoc(userRef, newUser);
      
      return {
        id: currentUser.uid,
        ...newUser,
        createdAt: new Date(newUser.createdAt),
        lastLoginAt: new Date(newUser.lastLoginAt || Date.now()),
        stats: newUser.stats ? {
          wordsViewed: newUser.stats.wordsViewed,
          wordsFavorited: newUser.stats.wordsFavorited,
          quizzesTaken: newUser.stats.quizzesTaken,
          quizzesPassed: newUser.stats.quizzesPassed,
          totalScore: newUser.stats.totalScore,
          streakDays: newUser.stats.streakDays,
          lastActive: new Date(newUser.stats.lastActive)
        } : undefined
      };
    }
    
    console.log('User document exists, returning it');
    return convertUser(userDoc);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<{
    displayName: string;
    photoURL: string;
    bio: string;
    username: string;
  }>
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      ...profileData,
      lastLoginAt: serverTimestamp()
    });
    
    // Update in Firebase Auth if this is the current user (only for displayName and photoURL)
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const authUpdateData: { displayName?: string; photoURL?: string } = {};
      
      if (profileData.displayName) {
        authUpdateData.displayName = profileData.displayName;
      }
      
      if (profileData.photoURL) {
        authUpdateData.photoURL = profileData.photoURL;
      }
      
      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(auth.currentUser, authUpdateData);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating user profile for ${userId}:`, error);
    return false;
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Use dot notation to update nested fields
    const updates: Record<string, any> = {};
    
    Object.entries(settings).forEach(([key, value]) => {
      updates[`settings.${key}`] = value;
    });
    
    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating settings for user ${userId}:`, error);
    return false;
  }
};

/**
 * Update user stats
 */
export const updateUserStats = async (
  userId: string,
  stats: Partial<UserStats>
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Use dot notation to update nested fields
    const updates: Record<string, any> = {};
    
    Object.entries(stats).forEach(([key, value]) => {
      updates[`stats.${key}`] = value;
    });
    
    // Always update lastActive
    updates['stats.lastActive'] = serverTimestamp();
    
    await updateDoc(userRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating stats for user ${userId}:`, error);
    return false;
  }
};

/**
 * Add badge to user
 */
export const addBadgeToUser = async (
  userId: string,
  badge: Omit<Badge, 'dateEarned'>
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    const newBadge = {
      ...badge,
      dateEarned: Date.now()
    };
    
    await updateDoc(userRef, {
      badges: arrayUnion(newBadge)
    });
    
    return true;
  } catch (error) {
    console.error(`Error adding badge to user ${userId}:`, error);
    return false;
  }
};

/**
 * Add word to user favorites
 */
export const addToFavorites = async (userId: string, wordId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      favoriteWords: arrayUnion(wordId),
      'stats.wordsFavorited': firestoreIncrement(1)
    });
    
    return true;
  } catch (error) {
    console.error(`Error adding word ${wordId} to favorites for user ${userId}:`, error);
    return false;
  }
};

/**
 * Remove word from user favorites
 */
export const removeFromFavorites = async (userId: string, wordId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      favoriteWords: arrayRemove(wordId)
    });
    
    return true;
  } catch (error) {
    console.error(`Error removing word ${wordId} from favorites for user ${userId}:`, error);
    return false;
  }
};

/**
 * Add word to user's recent words
 */
export const addToRecentWords = async (userId: string, wordId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    // Get current recent words
    const userData = userDoc.data();
    let recentWords = userData.recentWords || [];
    
    // Remove the word if it's already in the list
    recentWords = recentWords.filter((id: string) => id !== wordId);
    
    // Add the word to the beginning of the list
    recentWords.unshift(wordId);
    
    // Limit to 10 recent words
    if (recentWords.length > 10) {
      recentWords = recentWords.slice(0, 10);
    }
    
    // Update the user document
    await updateDoc(userRef, {
      recentWords: recentWords,
      'stats.wordsViewed': firestoreIncrement(1),
      'stats.lastActive': serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Error adding word ${wordId} to recent words for user ${userId}:`, error);
    return false;
  }
};

/**
 * Get user's favorite words IDs
 */
export const getFavoriteWords = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    return userData.favoriteWords || [];
  } catch (error) {
    console.error(`Error getting favorite words for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get user's recent words IDs
 */
export const getRecentWords = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    return userData.recentWords || [];
  } catch (error) {
    console.error(`Error getting recent words for user ${userId}:`, error);
    return [];
  }
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      'stats.lastActive': serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating last login for user ${userId}:`, error);
    return false;
  }
};

/**
 * Sign in anonymously as a guest
 */
export const signInAsGuest = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInAnonymously(auth);
    
    // Create a user document for the anonymous user
    const timestamp = Date.now();
    const anonymousUser: UserDocument = {
      email: '',
      displayName: 'Guest User',
      photoURL: '',
      bio: '',
      username: `guest_${userCredential.user.uid.substring(0, 6)}`,
      createdAt: timestamp,
      lastLoginAt: timestamp,
      favoriteWords: [],
      recentWords: [],
      badges: [],
      stats: {
        wordsViewed: 0,
        wordsFavorited: 0,
        quizzesTaken: 0,
        quizzesPassed: 0,
        totalScore: 0,
        streakDays: 0,
        lastActive: timestamp
      },
      settings: {
        notificationsEnabled: true,
        darkModeEnabled: false,
        emailNotifications: false,
        quizDifficulty: 'medium',
        language: 'en'
      }
    };
    
    // Use the Firebase Auth UID as the document ID
    await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), anonymousUser);
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

// Export default to satisfy Expo Router
export default {
  registerUser,
  signIn,
  signOut,
  getUserById,
  getCurrentUser,
  updateUserProfile,
  updateUserSettings,
  updateUserStats,
  addBadgeToUser,
  addToFavorites,
  removeFromFavorites,
  addToRecentWords,
  getFavoriteWords,
  getRecentWords,
  updateLastLogin,
  signInAsGuest
}; 