import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllWords, searchWords, getTrendingWords } from '../services/wordService';
import { addToFavorites, removeFromFavorites, getFavoriteWords } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Word } from '../types';


export default function DictionaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'favorites'>('trending');
  const [words, setWords] = useState<Word[]>([]);
  const [favoriteWords, setFavoriteWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  // Load words from Firebase
  useEffect(() => {
    const loadWords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get trending words
        const trendingWordsData = await getTrendingWords(10);
        setWords(trendingWordsData);
        
        // Load favorite words if user is logged in
        if (user && user.id) {
          const userFavoriteIds = await getFavoriteWords(user.id);
          const allWords = await getAllWords();
          const userFavorites = allWords.filter(word => 
            userFavoriteIds.includes(word.id as string)
          );
          setFavoriteWords(userFavorites);
        }
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load words. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWords();
  }, [user]);
  
  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim() === '') return;
      
      try {
        setIsLoading(true);
        const results = await searchWords(searchQuery);
        setWords(results);
      } catch (err) {
        console.error('Error searching words:', err);
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Toggle favorite
  const toggleFavorite = async (wordId: string) => {
    if (!user || !user.id) {
      // Handle not logged in state
      return;
    }
    
    try {
      const isFavorite = favoriteWords.some(word => word.id === wordId);
      
      if (isFavorite) {
        await removeFromFavorites(user.id, wordId);
        setFavoriteWords(favoriteWords.filter(word => word.id !== wordId));
      } else {
        await addToFavorites(user.id, wordId);
        const wordToAdd = words.find(word => word.id === wordId);
        if (wordToAdd) {
          setFavoriteWords([...favoriteWords, wordToAdd]);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  // Get active words based on tab
  const getActiveWords = () => {
    return activeTab === 'trending' ? words : favoriteWords;
  };
  
  // Check if a word is favorited
  const isWordFavorite = (wordId: string) => {
    return favoriteWords.some(word => word.id === wordId);
  };

  const renderWordCard = ({ item }: { item: Word }) => (
    <Link href={`/word/${item.id}`} asChild>
      <TouchableOpacity 
        className="mb-4 bg-white rounded-xl overflow-hidden border border-gray-100"
        style={{ 
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        }}
      >
        <View className="p-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-blue-primary">{item.word}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                if (item.id) toggleFavorite(item.id);
              }}
            >
              <Ionicons 
                name={isWordFavorite(item.id as string) ? "heart" : "heart-outline"} 
                size={20} 
                color="#f43f5e" 
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-700 mt-2" numberOfLines={2}>{item.definition}</Text>
          <View className="flex-row justify-end mt-3">
            <View className="bg-mint-50 rounded-full p-2">
              <Ionicons name="arrow-forward" size={16} color="#16a34a" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 pt-24" style={{ backgroundColor: '#084c8b' }}>
      <StatusBar barStyle="light-content" backgroundColor="#084c8b" />
      
      {/* Fixed Header */}
      <View className="px-4 pb-2">
        <Text className="text-gray-200">Discover the latest brainrot words</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4">
        <View 
          className="flex-row items-center bg-white rounded-full px-4 py-2 border border-gray-100"
          style={{ 
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search brainrot words..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mini Tabs */}
      <View className="px-4 mb-4">
        <View 
          className="flex-row bg-white rounded-full p-1 border border-gray-100"
          style={{ 
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <TouchableOpacity 
            className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'trending' ? 'bg-blue-primary' : 'bg-transparent'}`}
            onPress={() => setActiveTab('trending')}
          >
            <Text className={`text-center font-medium ${activeTab === 'trending' ? 'text-white' : 'text-gray-700'}`}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'favorites' ? 'bg-mint-500' : 'bg-transparent'}`}
            onPress={() => setActiveTab('favorites')}
          >
            <Text className={`text-center font-medium ${activeTab === 'favorites' ? 'text-white' : 'text-gray-700'}`}>
              Favorites {user ? `(${favoriteWords.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-500 mt-4">Loading words...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="alert-circle-outline" size={48} color="#f43f5e" />
            <Text className="text-gray-500 mt-4">{error}</Text>
          </View>
        ) : (
          <>
            {/* Word of the Day */}
            {!searchQuery && (
              <View className="px-4 py-2 mb-4">
                <Text className="text-base font-medium mb-3 text-white">Word of the Day</Text>
                <View 
                  className="bg-white p-4 rounded-xl border border-gray-100"
                  style={{ 
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-pink-primary">rizz</Text>
                    <TouchableOpacity onPress={() => toggleFavorite('1')}>
                      <Ionicons 
                        name={isWordFavorite('1') ? "heart" : "heart-outline"} 
                        size={20} 
                        color="#f43f5e" 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className=" text-pink-primary mt-2">Charisma or the ability to attract a romantic partner</Text>
                  <Text className="text-pink-primary text-xs mt-3">Example: "He has so much rizz, he got her number in five minutes."</Text>
                  <View className="flex-row justify-end mt-3">
                    <Link href="/word/1" asChild>
                      <TouchableOpacity className=" bg-blue-primary px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Learn More</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>
            )}

            {/* Words List */}
            <View className="px-4 py-2 pb-20">
              <Text className="text-base font-medium mb-3 text-white">
                {searchQuery 
                  ? 'Search Results' 
                  : activeTab === 'trending' 
                    ? 'Trending Words' 
                    : 'Your Favorites'}
              </Text>
              
              {getActiveWords().length > 0 ? (
                getActiveWords().map(item => (
                  <View key={item.id} className="mb-3">
                    {renderWordCard({ item })}
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  {activeTab === 'favorites' ? (
                    <>
                      <Ionicons name="heart-outline" size={48} color="#dcfce7" />
                      <Text className="text-gray-500 mt-2">No favorite words yet</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="search-outline" size={48} color="#dcfce7" />
                      <Text className="text-gray-500 mt-2">No words found</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
