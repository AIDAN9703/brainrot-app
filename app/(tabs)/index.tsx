import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Image, StatusBar, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AlgoliaSearch from '../components/AlgoliaSearch';

// Screen constants - reduced header height to create more space
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;
const { width } = Dimensions.get('window');

export default function DictionaryScreen() {
  const [activeTab, setActiveTab] = useState<'trending' | 'favorites'>('trending');
  const { user } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const grimaceSize = useRef(new Animated.Value(0.85)).current;
  
  // Animation values
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });
  
  // Tab indicator animation
  useEffect(() => {
    Animated.timing(tabIndicatorPosition, {
      toValue: activeTab === 'trending' ? 0 : width / 2 - 20,
      duration: 250,
      useNativeDriver: true
    }).start();
  }, [activeTab, width]);
  
  return (
    <View className="flex-1 bg-brainrot-bg">
      <StatusBar barStyle="light-content" />
      
      {/* Animated header - moved up and reduced in height */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-10 px-4 overflow-visible"
        style={{
          height: HEADER_HEIGHT,
          paddingTop: Platform.OS === 'ios' ? 30 : 20, // Reduced padding to move up
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }}
      >
        {/* Grimace peeking image - repositioned higher */}
        <Animated.Image 
          source={require('../../assets/images/grimace.png')} 
          className="absolute w-28 h-28"
          style={{
            right: -5,
            top: Platform.OS === 'ios' ? 15 : 5, // Moved up
            transform: [
              { rotate: '15deg' },
              { scale: grimaceSize }
            ],
            zIndex: -1,
            opacity: 0.85
          }}
          resizeMode="contain"
        />
        
        {/* Title moved up and condensed */}
        <View className="mt-1"> 
          <Text 
            className="text-2xl font-bold text-brainrot-pink font-serif tracking-wider"
            style={{ 
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2
            }}
          >
            BRAINROT DICTIONARY
          </Text>
          <Text 
            className="text-sm text-white/75 font-serif italic"
            style={{ 
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 0.5, height: 0.5 },
              textShadowRadius: 1
            }}
          >
            Dictionary of Internet Slang
          </Text>
        </View>
      </Animated.View>
      
      {/* Tabs moved up to create more space */}
      <View className="z-5 px-4" style={{ paddingTop: HEADER_HEIGHT + 4 }}>
        <View className="flex-row bg-black/30 rounded-xl p-1 border border-brainrot-purple/30 overflow-visible">
          {/* Animated tab indicator */}
          <Animated.View 
            className="absolute h-9 rounded-lg bg-brainrot-purple/70"
            style={{
              width: width / 2 - 20, // Half width minus padding
              transform: [{ translateX: tabIndicatorPosition }],
              top: 4,
              zIndex: 0
            }}
          />
          
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg z-10"
            onPress={() => setActiveTab('trending')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={activeTab === 'trending' ? "flame" : "flame-outline"} 
              size={20} 
              color={activeTab === 'trending' ? "#fff" : "#FF9B4F"} 
            />
            <Text className={`ml-1.5 text-sm font-bold font-serif ${activeTab === 'trending' ? 'text-white' : 'text-brainrot-purple'}`}>
              Trending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg z-10"
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={activeTab === 'favorites' ? "heart" : "heart-outline"} 
              size={20} 
              color={activeTab === 'favorites' ? "#fff" : "#FF3E8A"} 
            />
            <Text className={`ml-1.5 text-sm font-bold font-serif ${activeTab === 'favorites' ? 'text-white' : 'text-brainrot-purple'}`}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main content - now has more room since header is smaller */}
      <View className="flex-1 z-1 pt-2">
        {activeTab === 'trending' ? (
          <AlgoliaSearch />
        ) : (
          <FavoritesContent />
        )}
      </View>
      
      {/* Floating action button with subtle highlight */}
      <Link href="/word/create" asChild>
        <TouchableOpacity 
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-brainrot-purple items-center justify-center"
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#fff" />
          <View className="absolute w-full h-full rounded-full bg-white/10" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// Favorites Content Component
function FavoritesContent() {
  const { user } = useAuth();
  
  // If not logged in
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="absolute w-40 h-40 rounded-full bg-brainrot-purple/10 top-10 right-0" />
        <View className="absolute w-32 h-32 rounded-full bg-brainrot-pink/10 bottom-10 left-0" />
        
        <Ionicons name="heart-outline" size={64} color="#FF3E8A" style={{ opacity: 0.7 }} />
        <Text className="mt-4 text-xl font-bold text-white font-serif">Sign in to save favorites</Text>
        <Text className="mt-2 text-base text-white/70 text-center font-serif">Keep track of your favorite slang words</Text>
        <Link href="/login" asChild>
          <TouchableOpacity 
            className="mt-6 px-8 py-3 rounded-2xl bg-brainrot-pink"
            style={{
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3.84,
            }}
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-white font-serif">Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }
  
  // No favorites yet
  if (!user.favoriteWords || user.favoriteWords.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="absolute w-40 h-40 rounded-full bg-brainrot-purple/10 top-10 right-0" />
        <View className="absolute w-32 h-32 rounded-full bg-brainrot-pink/10 bottom-10 left-0" />
        
        <Ionicons name="heart-outline" size={64} color="#FF3E8A" style={{ opacity: 0.7 }} />
        <Text className="mt-4 text-xl font-bold text-white font-serif">No favorites yet</Text>
        <Text className="mt-2 text-base text-white/70 text-center font-serif">Add words to your favorites list</Text>
      </View>
    );
  }
  
  // Show favorite words (simplified for now)
  return (
    <View className="flex-1 p-4 items-center justify-center">
      <View className="absolute w-40 h-40 rounded-full bg-brainrot-purple/10 top-10 right-0" />
      <View className="absolute w-32 h-32 rounded-full bg-brainrot-pink/10 bottom-10 left-0" />
      
      <Text className="text-2xl font-bold text-brainrot-pink mb-4">Your Favorites</Text>
      <Text className="text-base text-white text-center">Coming soon: Your saved favorite words</Text>
    </View>
  );
}
