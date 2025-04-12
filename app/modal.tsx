import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define types
interface WordItem {
  id: string;
  word: string;
  definition: string;
}

// Mock data for dictionary words
const DICTIONARY_WORDS: WordItem[] = [
  { id: '1', word: 'rizz', definition: 'Charisma or the ability to attract a romantic partner' },
  { id: '2', word: 'bussin', definition: 'Something that is extremely good or delicious' },
  { id: '3', word: 'slay', definition: 'To do something exceptionally well' },
  { id: '4', word: 'mid', definition: 'Something that is mediocre or of average quality' },
  { id: '5', word: 'cap', definition: 'A lie or to lie about something' },
  { id: '6', word: 'no cap', definition: 'No lie, telling the truth' },
  { id: '7', word: 'sus', definition: 'Suspicious or questionable' },
  { id: '8', word: 'bet', definition: 'An affirmation or agreement' },
  { id: '9', word: 'yeet', definition: 'To throw something with force' },
  { id: '10', word: 'vibe check', definition: 'Assessing someone\'s mood or energy' },
  { id: '11', word: 'based', definition: 'Being yourself and not caring about others\' opinions' },
  { id: '12', word: 'cringe', definition: 'Something embarrassing or awkward' },
  { id: '13', word: 'simp', definition: 'Someone who is overly attentive to someone they\'re attracted to' },
  { id: '14', word: 'stan', definition: 'An overly enthusiastic fan' },
  { id: '15', word: 'rent free', definition: 'When someone or something occupies your thoughts constantly' },
];

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredWords = DICTIONARY_WORDS.filter(item => 
    item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Custom Header */}
      <View className="px-4 pb-4 flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-100"
          style={{ 
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#166534" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-mint-800">Search Dictionary</Text>
        <View className="w-10" />
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
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Search Results */}
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/word/${item.id}`} asChild>
            <TouchableOpacity 
              className="p-4 mx-4 mb-2 bg-white rounded-xl border border-gray-100"
              style={{ 
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Text className="text-lg font-semibold text-mint-800">{item.word}</Text>
              <Text className="text-gray-600" numberOfLines={1}>{item.definition}</Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Ionicons name="search-outline" size={48} color="#dcfce7" />
            <Text className="text-gray-500 mt-4">
              {searchQuery.length > 0 
                ? 'No words found. Try a different search.' 
                : 'Start typing to search for brainrot words.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
