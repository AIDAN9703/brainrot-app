import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getWordById } from '../services/wordService';
import { addToFavorites, removeFromFavorites, getFavoriteWords, addToRecent } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Word } from '../types';

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const loadWord = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get word details
        const wordId = Array.isArray(id) ? id[0] : id;
        const wordData = await getWordById(wordId);
        
        if (!wordData) {
          setError('Word not found');
          return;
        }
        
        setWord(wordData);
        
        // Track this as recently viewed
        if (user && user.id) {
          await addToRecent(user.id, wordId);
          
          // Check if word is in favorites
          const favorites = await getFavoriteWords(user.id);
          setIsFavorite(favorites.includes(wordId));
        }
      } catch (err) {
        console.error('Error loading word:', err);
        setError('Failed to load word. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWord();
  }, [id, user]);
  
  const toggleFavorite = async () => {
    if (!user || !user.id || !word || !word.id) return;
    
    try {
      if (isFavorite) {
        await removeFromFavorites(user.id, word.id);
      } else {
        await addToFavorites(user.id, word.id);
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-500 mt-4">Loading word details...</Text>
      </View>
    );
  }
  
  if (error || !word) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#f43f5e" />
        <Text className="text-gray-700 mt-4 text-lg">{error || 'Word not found'}</Text>
        <TouchableOpacity 
          className="mt-6 bg-mint-500 px-6 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-mint-500 pt-12 pb-4">
        <View className="flex-row items-center px-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-mint-400 rounded-full p-2 mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">{word.word}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleFavorite}
            className="bg-mint-400 rounded-full p-2 ml-3"
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Definition */}
        <View className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
          <Text className="text-lg font-medium text-gray-800 mb-2">Definition</Text>
          <Text className="text-gray-700">{word.definition}</Text>
        </View>
        
        {/* Example */}
        {word.example && (
          <View className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
            <Text className="text-lg font-medium text-gray-800 mb-2">Example</Text>
            <Text className="text-gray-700 italic">"{word.example}"</Text>
          </View>
        )}
        
        {/* Metadata */}
        <View className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
          <Text className="text-lg font-medium text-gray-800 mb-2">Word Info</Text>
          
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500">Added on</Text>
            <Text className="text-gray-700">
              {word.createdAt instanceof Date 
                ? word.createdAt.toLocaleDateString() 
                : new Date(word.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          {word.isTrending && (
            <View className="bg-mint-100 self-start rounded-full px-3 py-1 mt-2">
              <Text className="text-xs text-mint-700">Trending</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 