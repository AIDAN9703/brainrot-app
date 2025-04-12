import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserDocument } from '../types';
import { 
  getCurrentUser, 
  registerUser,  
  signIn, 
  signOut,
  signInAsGuest
} from '../services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  firebaseUser: null,
  register: async () => {
    throw new Error('register not implemented');
  },
  login: async () => {
    throw new Error('login not implemented');
  },
  logout: async () => {
    throw new Error('logout not implemented');
  },
  loginAsGuest: async () => {
    throw new Error('loginAsGuest not implemented');
  },
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to convert Firestore document to User
  const convertFirestoreDocToUser = (docId: string, docData: any): User => {
    // Helper function to safely convert any date format to a JavaScript Date
    const safeDate = (dateField: any): Date => {
      if (!dateField) return new Date(); // Default to current date if undefined
      if (dateField instanceof Date) return dateField;
      if (typeof dateField === 'number') return new Date(dateField);
      if (dateField.toDate && typeof dateField.toDate === 'function') return dateField.toDate();
      return new Date(dateField); // Try to parse as string or timestamp
    };

    // Parse stats with safe date conversion
    const stats = docData.stats ? {
      wordsViewed: docData.stats.wordsViewed || 0,
      wordsFavorited: docData.stats.wordsFavorited || 0,
      quizzesTaken: docData.stats.quizzesTaken || 0,
      quizzesPassed: docData.stats.quizzesPassed || 0,
      totalScore: docData.stats.totalScore || 0,
      streakDays: docData.stats.streakDays || 0,
      lastActive: docData.stats.lastActive ? safeDate(docData.stats.lastActive) : new Date()
    } : {
      wordsViewed: 0,
      wordsFavorited: 0,
      quizzesTaken: 0,
      quizzesPassed: 0,
      totalScore: 0,
      streakDays: 0,
      lastActive: new Date()
    };

    return {
      id: docId,
      email: docData.email || '',
      displayName: docData.displayName || '',
      photoURL: docData.photoURL || '',
      bio: docData.bio || '',
      username: docData.username || docData.email?.split('@')[0] || '',
      createdAt: safeDate(docData.createdAt),
      lastLoginAt: docData.lastLoginAt ? safeDate(docData.lastLoginAt) : safeDate(new Date()),
      favoriteWords: docData.favoriteWords || [],
      recentWords: docData.recentWords || [],
      badges: docData.badges || [],
      stats: stats,
      settings: docData.settings || {
        notificationsEnabled: true,
        darkModeEnabled: false,
        emailNotifications: true,
        quizDifficulty: 'medium',
        language: 'en'
      }
    };
  };

  // Function to ensure user document exists
  const ensureUserDocument = async (fbUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      console.log('Creating new user document for', fbUser.email);
      // User doesn't exist in Firestore, create document
      const newUserData: any = {
        email: fbUser.email || '',
        displayName: fbUser.displayName || '',
        photoURL: fbUser.photoURL || '',
        bio: '',
        username: fbUser.email?.split('@')[0] || '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
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
          lastActive: serverTimestamp()
        },
        settings: {
          notificationsEnabled: true,
          darkModeEnabled: false,
          emailNotifications: true,
          quizDifficulty: 'medium',
          language: 'en'
        }
      };
      
      await setDoc(userRef, newUserData);
      
      // For the return value, we need JavaScript Date objects
      return {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || '',
        photoURL: fbUser.photoURL || '',
        bio: '',
        username: fbUser.email?.split('@')[0] || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
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
          lastActive: new Date()
        },
        settings: {
          notificationsEnabled: true,
          darkModeEnabled: false,
          emailNotifications: true,
          quizDifficulty: 'medium',
          language: 'en'
        }
      };
    }
    
    // User exists, return the data
    const userData = userSnapshot.data();
    return convertFirestoreDocToUser(fbUser.uid, userData);
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    setLoading(true);
    
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('Auth state changed', fbUser?.email);
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // If user is logged in, ensure Firestore user document exists
          const userData = await ensureUserDocument(fbUser);
          console.log('User data retrieved', userData.email);
          setUser(userData);
        } catch (error: any) {
          console.error('Error getting user data:', error);
          
          // If we have network errors with Firestore, we can still use basic Firebase user
          if (error.code === 'unavailable' || error.code === 'network-request-failed') {
            console.warn('Using fallback user data from Firebase Auth');
            
            // Create a basic user object from Firebase user as fallback
            // This allows basic authentication to work even if Firestore is unavailable
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              photoURL: fbUser.photoURL || '',
              bio: '',
              username: fbUser.email?.split('@')[0] || '',
              createdAt: new Date(),
              lastLoginAt: new Date(),
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
                lastActive: new Date()
              },
              settings: {
                notificationsEnabled: true,
                darkModeEnabled: false,
                emailNotifications: true,
                quizDifficulty: 'medium',
                language: 'en'
              }
            });
            
            // Try to retry creating/getting user document in the background
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              setTimeout(async () => {
                try {
                  const userData = await ensureUserDocument(fbUser);
                  console.log('User data retrieved after retry', userData.email);
                  setUser(userData);
                  retryCount = 0;
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                }
              }, 3000 * retryCount); // Exponential backoff
            }
          } else {
            // For other errors, reset the user state
            setUser(null);
          }
        }
      } else {
        // If user is not logged in
        console.log('No Firebase user');
        setUser(null);
        retryCount = 0;
      }
      
      setLoading(false);
    }, (error) => {
      // Handle auth state observer errors
      console.error('Auth state change error:', error);
      setLoading(false);
      setUser(null);
      setFirebaseUser(null);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Register a new user
  const register = async (email: string, password: string, displayName?: string): Promise<User> => {
    try {
      console.log('Attempting registration for:', email);
      setLoading(true);
      const newUser = await registerUser(email, password, displayName);
      console.log('Registration successful for:', email);
      setUser(newUser);
      return newUser;
    } catch (error: any) {
      console.error('Error in register:', error.code, error.message);
      
      // Comprehensive error handling based on Firebase error codes
      switch(error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already in use. Try signing in instead.');
        case 'auth/invalid-email':
          throw new Error('Invalid email format.');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password registration is not enabled. Please contact support.');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please use a stronger password.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login for:', email);
      setLoading(true);
      await signIn(email, password);
      console.log('Login successful, auth state listener will update user state');
      // onAuthStateChanged will handle updating the user state
    } catch (error: any) {
      console.error('Error in login:', error.code, error.message);
      
      // Comprehensive error handling based on Firebase error codes
      switch(error.code) {
        case 'auth/invalid-email':
          throw new Error('Invalid email format.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled.');
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later or reset your password.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        case 'auth/invalid-credential':
          throw new Error('Invalid credentials. Please try again.');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password login is not enabled. Please contact support.');
        default:
          throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout the current user
  const logout = async (): Promise<void> => {
    try {
      console.log('Attempting to logout user');
      setLoading(true);
      await signOut();
      console.log('Logout successful');
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error('Error in logout:', error.code, error.message);
      
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Your data will be cleared locally, but you may still be logged in on the server.');
      } else {
        throw new Error(error.message || 'Failed to sign out. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login as guest
  const loginAsGuest = async (): Promise<void> => {
    try {
      console.log('Attempting to login as guest');
      setLoading(true);
      await signInAsGuest();
      console.log('Login as guest successful');
      // onAuthStateChanged will handle updating the user state
    } catch (error: any) {
      console.error('Error in loginAsGuest:', error.code, error.message);
      throw new Error(error.message || 'Failed to sign in as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    loginAsGuest,
    firebaseUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Add default export to satisfy Expo Router
export default { AuthProvider, useAuth }; 