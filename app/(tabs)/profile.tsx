import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Badge, UserStats, UserSettings } from '../types';
import { updateProfilePhoto } from '../services/imagePickerService';

// Define types
interface UserActivity {
  id: string;
  type: 'quiz' | 'word' | 'post';
  title: string;
  timestamp: string;
  description: string;
}

// Default user stats if not available
const DEFAULT_STATS: UserStats = {
  wordsViewed: 0,
  wordsFavorited: 0,
  quizzesTaken: 0,
  quizzesPassed: 0,
  totalScore: 0,
  streakDays: 0,
  lastActive: new Date()
};

// Default badges if none available
const DEFAULT_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Newcomer',
    description: 'Join the Brainrot Dictionary',
    iconName: 'rocket',
    dateEarned: new Date()
  }
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'activity' | 'badges'>('activity');
  const { user, loading, logout, firebaseUser } = useAuth();
  const router = useRouter();
  const [photoUploadModal, setPhotoUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('Profile screen auth state:', { 
      hasUser: !!user, 
      hasFirebaseUser: !!firebaseUser,
      loading,
      userId: user?.id,
      firebaseUserId: firebaseUser?.uid,
      email: user?.email || firebaseUser?.email,
      displayName: user?.displayName || firebaseUser?.displayName
    });
    
    if (firebaseUser && !user) {
      console.warn('Firebase user exists but no user document found');
    }
    
    if (user) {
      // Log critical user fields for debugging
      console.log('User document data:', {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        hasStats: !!user.stats,
        hasFavorites: Array.isArray(user.favoriteWords),
        favoritesCount: user.favoriteWords?.length || 0,
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null
      });
    }
  }, [user, firebaseUser, loading]);
  
  // Calculate level based on words viewed and favorited
  const calculateLevel = (): number => {
    if (!user || !user.stats) return 1;
    
    const totalActions = user.stats.wordsViewed + 
                         user.stats.wordsFavorited * 2 +
                         user.stats.quizzesTaken * 5 + 
                         user.stats.quizzesPassed * 10;
    
    return Math.max(1, Math.floor(totalActions / 50) + 1);
  };
  
  // Calculate XP based on user actions
  const calculateXP = (): { current: number, next: number, percentage: number } => {
    if (!user || !user.stats) {
      return { current: 0, next: 100, percentage: 0 };
    }
    
    const totalActions = user.stats.wordsViewed + 
                         user.stats.wordsFavorited * 2 +
                         user.stats.quizzesTaken * 5 + 
                         user.stats.quizzesPassed * 10;
    
    const level = Math.max(1, Math.floor(totalActions / 50) + 1);
    const xpInLevel = totalActions % 50;
    const xpForNextLevel = 50;
    const percentage = (xpInLevel / xpForNextLevel) * 100;
    
    return { 
      current: xpInLevel, 
      next: xpForNextLevel,
      percentage: percentage
    };
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // No need to navigate, AuthContext will handle redirecting
    } catch (error) {
      Alert.alert('Logout Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleProfilePhotoUpload = async (source: 'gallery' | 'camera') => {
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to update your profile photo.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const success = await updateProfilePhoto(user.id, source);
      
      if (success) {
        Alert.alert('Success', 'Your profile photo has been updated.');
      } else {
        Alert.alert('Error', 'Failed to update profile photo. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleProfilePhotoUpload:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
      setPhotoUploadModal(false);
    }
  };

  const renderBadge = ({ item }: { item: Badge }) => {
    // Pick a color based on badge name (for demo)
    const color = getBadgeColor(item.name);
    
    return (
      <TouchableOpacity className="mr-4 items-center">
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mb-1"
          style={{ backgroundColor: `${color}20` }} // Using hex with 20% opacity
        >
          <Ionicons name={item.iconName as any} size={32} color={color} />
        </View>
        <Text className="text-xs text-center text-gray-200">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderBadgeCard = (badge: Badge) => {
    // Pick a color based on badge name (for demo)
    const color = getBadgeColor(badge.name);
    
    return (
      <View key={badge.id} className="bg-gray-800 mb-3 p-4 rounded-lg border border-gray-700 flex-row">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={badge.iconName as any} size={24} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-white">{badge.name}</Text>
            <Text className="text-xs text-gray-400">
              {formatDate(badge.dateEarned)}
            </Text>
          </View>
          <Text className="text-gray-300 text-sm mt-1">{badge.description}</Text>
        </View>
      </View>
    );
  };
  
  // Helper to assign colors to badges
  const getBadgeColor = (badgeName: string): string => {
    const colors = {
      'Slang Master': '#f59e0b',
      'Word Collector': '#3b82f6',
      'Streak Warrior': '#ef4444',
      'Social Butterfly': '#8b5cf6',
      'Newcomer': '#10b981',
      'default': '#6366f1'
    };
    
    return colors[badgeName as keyof typeof colors] || colors.default;
  };
  
  // Format date for display
  const formatDate = (date: Date | number): string => {
    const now = new Date();
    const badgeDate = new Date(date);
    
    const diffTime = Math.abs(now.getTime() - badgeDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    } else {
      return badgeDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Check only for user object
  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Ionicons name="person-circle-outline" size={64} color="#ffffff" />
        <Text className="text-xl font-bold text-white mt-4">Not Signed In</Text>
        <Text className="text-gray-200 text-center mt-2 mb-6">
          Sign in to track your progress, save favorite words, and earn badges.
        </Text>
        <TouchableOpacity 
          className="bg-pink-primary px-6 py-3 rounded-full w-full items-center"
          onPress={() => router.push('/login')}
        >
          <Text className="text-white font-medium text-center">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="mt-4 px-6 py-3 rounded-full w-full items-center border border-white"
          onPress={() => router.push('/login')}
        >
          <Text className="text-white font-medium text-center">Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Calculate level and XP
  const level = calculateLevel();
  const xp = calculateXP();
  const stats = user.stats || DEFAULT_STATS;
  const badges = user.badges || DEFAULT_BADGES;

  return (
    <ScrollView className="flex-1 pt-12 bg-background">
      {/* Photo Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoUploadModal}
        onRequestClose={() => setPhotoUploadModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-gray-800 rounded-t-xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Update Profile Photo</Text>
              <TouchableOpacity onPress={() => setPhotoUploadModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="bg-gray-700 p-4 rounded-lg mb-3 flex-row items-center"
              onPress={() => handleProfilePhotoUpload('camera')}
              disabled={isUploading}
            >
              <Ionicons name="camera" size={24} color="#ffffff" className="mr-3" />
              <Text className="text-white text-lg ml-3">Take New Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-700 p-4 rounded-lg mb-3 flex-row items-center"
              onPress={() => handleProfilePhotoUpload('gallery')}
              disabled={isUploading}
            >
              <Ionicons name="images" size={24} color="#ffffff" className="mr-3" />
              <Text className="text-white text-lg ml-3">Choose from Gallery</Text>
            </TouchableOpacity>
            
            {isUploading && (
              <View className="items-center py-3">
                <ActivityIndicator size="large" color="#ff66b6" />
                <Text className="text-white mt-2">Uploading...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Profile Header */}
      <View className="p-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="relative" 
            onPress={() => setPhotoUploadModal(true)}
          >
            <Image
              source={{ uri: user.photoURL || 'https://picsum.photos/id/64/400' }}
              className="w-24 h-24 rounded-full border-2 border-white"
            />
            <View className="absolute bottom-0 right-0 bg-pink-primary rounded-full w-8 h-8 items-center justify-center border-2 border-white">
              <Text className="text-white font-bold">{level}</Text>
            </View>
            <View className="absolute bottom-1 left-1 bg-gray-800 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={16} color="#ffffff" />
          </View>
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-white">{user.displayName || 'User'}</Text>
            <Text className="text-gray-200">@{user.username || user.email.split('@')[0]}</Text>
            <View className="mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-200">Level {level}</Text>
                <Text className="text-xs text-gray-200">{xp.current}/{xp.next} XP</Text>
              </View>
              <View className="h-2 bg-gray-600 rounded-full w-full mt-1">
                <View 
                  className="h-2 bg-pink-primary rounded-full" 
                  style={{ width: `${xp.percentage}%` }} 
                />
              </View>
            </View>
          </View>
          <TouchableOpacity 
            className="bg-pink-primary px-4 py-2 rounded-full"
            onPress={() => router.push('/modal')}
          >
            <Text className="text-white font-medium">Edit</Text>
          </TouchableOpacity>
        </View>
        <Text className="mt-3 text-gray-200">{user.bio || "No bio yet."}</Text>
      </View>

      {/* Stats Section */}
      <View className="flex-row justify-between px-4 py-5 border-b border-gray-700">
        <View className="items-center">
          <Text className="text-2xl font-bold text-white">{stats.quizzesTaken}</Text>
          <Text className="text-gray-300">Quizzes</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-white">{stats.wordsViewed}</Text>
          <Text className="text-gray-300">Words</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-white">{badges.length}</Text>
          <Text className="text-gray-300">Badges</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-white">{stats.streakDays}</Text>
          <Text className="text-gray-300">Streak</Text>
        </View>
      </View>

      {/* Top Badges Scroll */}
      <View className="py-4 bg-background border-b border-gray-700">
        <View className="flex-row justify-between items-center px-4 mb-3">
          <Text className="text-lg font-semibold text-white">Badges</Text>
          <TouchableOpacity onPress={() => setActiveTab('badges')}>
            <Text className="text-pink-primary">View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
        >
          {badges.map(badge => renderBadge({ item: badge }))}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-background border-b border-gray-700">
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'activity' ? 'border-b-2 border-pink-primary' : ''}`}
          onPress={() => setActiveTab('activity')}
        >
          <Text className={`text-center font-medium ${activeTab === 'activity' ? 'text-white' : 'text-gray-400'}`}>
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'badges' ? 'border-b-2 border-pink-primary' : ''}`}
          onPress={() => setActiveTab('badges')}
        >
          <Text className={`text-center font-medium ${activeTab === 'badges' ? 'text-white' : 'text-gray-400'}`}>
            Badges
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="p-4">
        {activeTab === 'activity' ? (
          <>
            <Text className="text-lg font-semibold text-white mb-3">Recent Activity</Text>
            {/* Create some sample activity data for now */}
            {[
              {
                id: '1',
                type: 'quiz',
                title: 'Completed "Brainrot Basics" Quiz',
                timestamp: '2 hours ago',
                description: 'Scored 9/10 - Earned "Slang Master" badge',
              },
              {
                id: '2',
                type: 'word',
                title: 'Learned 5 new words',
                timestamp: '1 day ago',
                description: 'rizz, bussin, slay, mid, cap',
              },
              {
                id: '3',
                type: 'post',
                title: 'Created a new post',
                timestamp: '2 days ago',
                description: 'That new movie was totally mid. Don\'t waste your time, fr fr no cap.',
              }
            ].map((activity) => (
              <View key={activity.id} className="bg-gray-800 mb-3 p-4 rounded-lg border border-gray-700">
                <View className="flex-row justify-between items-center mb-1">
                  <View className="flex-row items-center">
                    <View className={`
                      w-8 h-8 rounded-full items-center justify-center mr-2
                      ${activity.type === 'quiz' ? 'bg-blue-900' : activity.type === 'word' ? 'bg-green-900' : 'bg-purple-900'}
                    `}>
                      <Ionicons 
                        name={activity.type === 'quiz' ? 'help' : activity.type === 'word' ? 'book' : 'chatbubble'} 
                        size={16} 
                        color={activity.type === 'quiz' ? '#3b82f6' : activity.type === 'word' ? '#10b981' : '#8b5cf6'} 
                      />
                    </View>
                    <Text className="font-medium text-white">{activity.title}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">{activity.timestamp}</Text>
                </View>
                <Text className="text-gray-300 pl-10">{activity.description}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text className="text-lg font-semibold text-white mb-3">All Badges</Text>
            {badges.map((badge) => renderBadgeCard(badge))}
          </>
        )}
      </View>

      {/* Settings Buttons */}
      <View className="p-4 bg-gray-800 mt-4 rounded-lg mx-4 mb-8">
        <TouchableOpacity className="py-3 flex-row items-center border-b border-gray-700">
          <Ionicons name="settings-outline" size={22} color="#d1d5db" className="mr-3" />
          <Text className="text-gray-300 flex-1">Settings</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
        
        <TouchableOpacity className="py-3 flex-row items-center border-b border-gray-700">
          <Ionicons name="help-circle-outline" size={22} color="#d1d5db" className="mr-3" />
          <Text className="text-gray-300 flex-1">Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="py-3 flex-row items-center"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" className="mr-3" />
          <Text className="text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 