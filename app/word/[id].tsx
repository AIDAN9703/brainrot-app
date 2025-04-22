import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getWordById } from '../services/wordService';
import { addToFavorites, removeFromFavorites, getFavoriteWords } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Word } from '../types';

export default function WordDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure ID is a string
        const wordId = Array.isArray(id) ? id[0] : id;
        
        if (!wordId) {
          setError('No word ID provided');
          return;
        }

        // Load the word data
        const wordData = await getWordById(wordId);
        if (!wordData) {
          setError('Word not found');
          return;
        }
        
        setWord(wordData);

        // Check if word is favorited by the user
        if (user && user.id) {
          const userFavorites = await getFavoriteWords(user.id);
          setIsFavorite(userFavorites.includes(wordId));
        }
      } catch (err) {
        console.error('Error loading word:', err);
        setError('Failed to load word details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadWord();
  }, [id, user]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!user || !user.id || !word?.id) {
      // Prompt login if not logged in
      router.push('/login');
      return;
    }

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

  return (
    <View className="flex-1 bg-brainrot-bg">
      <Stack.Screen 
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: '#121212' },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="chevron-back" size={24} color="#FF3E8A" />
            </TouchableOpacity>
          ),
          headerRight: () => word && (
            <TouchableOpacity onPress={toggleFavorite} className="p-2">
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color="#FF3E8A" 
              />
            </TouchableOpacity>
          ),
        }} 
      />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF3E8A" />
          <Text className="text-white mt-4">Loading word details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color="#FF3E8A" />
          <Text className="text-xl text-white text-center mt-4">{error}</Text>
          <Text className="text-base text-white/70 text-center mt-2">
            The word you're looking for might not exist or has been removed.
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mt-6 bg-brainrot-purple/70 px-6 py-3 rounded-lg"
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : word ? (
        <ScrollView className="flex-1 p-5">
          {/* Word Header */}
          <View className="mb-6 bg-black/20 p-5 rounded-xl border border-brainrot-purple/30">
            <Text className="text-3xl font-bold text-brainrot-pink mb-2 font-serif">
              {word.word}
            </Text>
            {word.pronunciation && (
              <Text className="text-base text-white/70 italic mb-2">
                /{word.pronunciation}/
              </Text>
            )}
          </View>

          {/* Definition Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-white mb-2">Definition</Text>
            <Text className="text-base text-white/90">
              {word.definition}
            </Text>
          </View>

          {/* Example Section */}
          {word.example && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-white mb-2">Example</Text>
              <View className="bg-black/30 px-4 py-3 rounded-lg border-l-4 border-brainrot-purple">
                <Text className="text-base text-white/80 italic">
                  "{word.example}"
                </Text>
              </View>
            </View>
          )}

          {/* Categories */}
          {word.categories && word.categories.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-white mb-2">Categories</Text>
              <View className="flex-row flex-wrap">
                {word.categories.map((category, index) => (
                  <View key={index} className="bg-brainrot-purple/20 px-3 py-1.5 rounded-lg mr-2 mb-2">
                    <Text className="text-brainrot-purple text-sm">{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata */}
          <View className="mt-4 pt-4 border-t border-t-gray-800">
            <Text className="text-sm text-white/50 text-center">
              {word.createdAt instanceof Date 
                ? `Added on ${word.createdAt.toLocaleDateString()}` 
                : 'Recently added'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="document-outline" size={64} color="#8F5AFF" opacity={0.5} />
          <Text className="text-xl text-white text-center mt-4">No word data available</Text>
        </View>
      )}
    </View>
  );
} 