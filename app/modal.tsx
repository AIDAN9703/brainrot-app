import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AlgoliaSearch from './components/AlgoliaSearch';

export default function SearchModal() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-4 py-5 border-b border-gray-700 bg-gray-900">
        <View className="flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-800"
        >
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Image 
              source={require('../assets/brainrot-logo-text.png')} 
              className="h-7 w-28 mr-1"
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-white">Search</Text>
      </View>
      
          <View className="w-10" />
        </View>
        
        <Text className="text-gray-300 text-center mt-2">
          Find the meaning of the latest slang
        </Text>
      </View>
      
      {/* Algolia Search */}
      <AlgoliaSearch />
      
      {/* Footer */}
      <View className="py-3 px-4 border-t border-gray-700 bg-gray-900">
        <Text className="text-gray-400 text-xs text-center">
          Powered by Algolia search technology
            </Text>
          </View>
    </View>
  );
}
