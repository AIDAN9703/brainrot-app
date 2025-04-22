import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { colors } from '../styles';

interface WordCardProps {
  word: Word;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  variant?: 'default' | 'highlight';
}

export default function WordCard({ word, isFavorite, onToggleFavorite, variant = 'default' }: WordCardProps) {
  const isHighlight = variant === 'highlight';
  
  return (
    <View 
      className={`bg-black/20 rounded-xl p-4 ${isHighlight ? 'border-2 border-brainrot-orange' : 'border border-brainrot-purple/30'}`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text 
          className={`font-bold font-serif ${isHighlight ? 'text-2xl text-brainrot-orange' : 'text-xl text-brainrot-blue'}`}
        >
          {word.word}
        </Text>
        <TouchableOpacity 
          onPress={() => onToggleFavorite(word.id as string)}
          className="p-2"
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={isHighlight ? 28 : 24} 
            color={isFavorite ? colors.pink : "#888"}
          />
        </TouchableOpacity>
      </View>

      {/* Definition */}
      <Text className="text-white mb-3 font-serif">
        {word.definition}
      </Text>
      
      {/* Example (if any) */}
      {word.example && (
        <View className="mb-3 bg-black/30 px-3 py-2 rounded-lg border-l-4 border-brainrot-yellow">
          <Text className="text-brainrot-yellow font-serif italic">
            "{word.example}"
          </Text>
        </View>
      )}
      
      {/* Footer with categories */}
      {word.categories && word.categories.length > 0 && (
        <View className="flex-row flex-wrap mt-2">
          {word.categories.map((category, index) => (
            <View 
              key={index} 
              className="bg-brainrot-purple/30 px-2 py-1 rounded-md mr-2 mb-2"
            >
              <Text className="text-brainrot-purple text-xs font-bold">
                {category}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
} 