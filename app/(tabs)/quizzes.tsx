import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Define types
interface Quiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  category: string;
  completionRate?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

// Mock data for quizzes
const QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Brainrot Basics',
    description: 'Test your knowledge of the most common brainrot terms',
    questionCount: 10,
    difficulty: 'Easy',
    imageUrl: 'https://picsum.photos/id/237/400/200',
    category: 'Popular',
    completionRate: 0,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'TikTok Terminology',
    description: 'How well do you know TikTok slang?',
    questionCount: 15,
    difficulty: 'Medium',
    imageUrl: 'https://picsum.photos/id/239/400/200',
    category: 'New',
    completionRate: 0,
    isNew: true,
  },
  {
    id: '3',
    title: 'Gen Z Jargon',
    description: 'Advanced quiz on the latest Gen Z vocabulary',
    questionCount: 20,
    difficulty: 'Hard',
    imageUrl: 'https://picsum.photos/id/240/400/200',
    category: 'Popular',
    completionRate: 65,
  },
  {
    id: '4',
    title: 'Internet Slang',
    description: 'Test your knowledge of internet abbreviations and slang',
    questionCount: 12,
    difficulty: 'Medium',
    imageUrl: 'https://picsum.photos/id/244/400/200',
    category: 'Completed',
    completionRate: 100,
  },
  {
    id: '5',
    title: 'Meme Culture',
    description: 'How well do you understand popular meme references?',
    questionCount: 18,
    difficulty: 'Medium',
    imageUrl: 'https://picsum.photos/id/250/400/200',
    category: 'Popular',
    completionRate: 30,
  },
  {
    id: '6',
    title: 'Gaming Lingo',
    description: 'Test your knowledge of gaming terminology and slang',
    questionCount: 15,
    difficulty: 'Hard',
    imageUrl: 'https://picsum.photos/id/252/400/200',
    category: 'New',
    completionRate: 0,
    isNew: true,
    isFeatured: true,
  },
];

export default function QuizzesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Popular', 'New', 'Completed'];

  const filteredQuizzes = selectedCategory === 'All' 
    ? QUIZZES 
    : QUIZZES.filter(quiz => quiz.category === selectedCategory);

  const featuredQuizzes = QUIZZES.filter(quiz => quiz.isFeatured);

  const getDifficultyColor = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getDifficultyBgColor = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100';
      case 'Medium':
        return 'bg-yellow-100';
      case 'Hard':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const renderFeaturedQuiz = (quiz: Quiz) => (
    <TouchableOpacity
      key={quiz.id}
      className="mr-4 rounded-xl overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      <Image
        source={{ uri: quiz.imageUrl }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30" />
      <View className="absolute top-0 left-0 right-0 bottom-0 p-4 flex justify-between">
        <View className="flex-row justify-between">
          <View className={`px-2 py-1 rounded-full ${getDifficultyBgColor(quiz.difficulty)}`}>
            <Text className={`text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </Text>
          </View>
          {quiz.isNew && (
            <View className="bg-mint-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">NEW</Text>
            </View>
          )}
        </View>
        <View>
          <Text className="text-white text-xl font-bold shadow-sm">{quiz.title}</Text>
          <Text className="text-white/90 mt-1">{quiz.description}</Text>
          <View className="flex-row justify-between items-center mt-3">
            <View className="flex-row items-center">
              <Ionicons name="help-circle" size={16} color="white" />
              <Text className="ml-1 text-white text-sm">{quiz.questionCount} questions</Text>
            </View>
            <TouchableOpacity className="bg-mint-500 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuizCard = (quiz: Quiz) => (
    <TouchableOpacity
      key={quiz.id}
      className="bg-white mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-100"
    >
      <View className="relative">
        <Image
          source={{ uri: quiz.imageUrl }}
          className="w-full h-32"
          resizeMode="cover"
        />
        {quiz.isNew && (
          <View className="absolute top-2 right-2 bg-mint-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">NEW</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-mint-800">{quiz.title}</Text>
          <View className={`px-2 py-1 rounded-full ${getDifficultyBgColor(quiz.difficulty)}`}>
            <Text className={`text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600 mb-3">{quiz.description}</Text>
        
        {/* Progress bar */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-gray-500">
              {quiz.completionRate === 0 ? 'Not started' : 
               quiz.completionRate === 100 ? 'Completed' : 
               `${quiz.completionRate}% completed`}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="ml-1 text-gray-500 text-xs">{quiz.questionCount} questions</Text>
            </View>
          </View>
          <View className="h-2 bg-gray-100 rounded-full w-full">
            <View 
              className={`h-2 rounded-full ${quiz.completionRate === 100 ? 'bg-green-500' : 'bg-mint-500'}`} 
              style={{ width: `${quiz.completionRate || 0}%` }} 
            />
          </View>
        </View>
        
        <TouchableOpacity 
          className={`${quiz.completionRate === 100 ? 'bg-gray-200' : 'bg-mint-500'} px-4 py-2 rounded-full w-full items-center`}
        >
          <Text className={`font-medium ${quiz.completionRate === 100 ? 'text-gray-700' : 'text-white'}`}>
            {quiz.completionRate === 100 ? 'Retake Quiz' : 'Start Quiz'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      {/* Header */}
      <View className="px-4 pb-2">
        <Text className="text-2xl font-bold text-mint-800">Quizzes</Text>
        <Text className="text-gray-600">Test your brainrot knowledge</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Featured Quizzes */}
        {featuredQuizzes.length > 0 && (
          <View className="mb-4">
            <View className="px-4 flex-row justify-between items-center mb-2">
              <Text className="text-base font-medium text-gray-500">Featured</Text>
              <TouchableOpacity>
                <Text className="text-mint-600">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
            >
              {featuredQuizzes.map(renderFeaturedQuiz)}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View className="px-4 pt-2 pb-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="py-2"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`mr-4 px-4 py-2 rounded-full ${
                  selectedCategory === category ? 'bg-mint-500' : 'bg-white border border-gray-100'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <View className="px-4 pt-2 pb-20">
          <Text className="text-base font-medium mb-3 text-gray-500">
            {selectedCategory === 'All' ? 'All Quizzes' : `${selectedCategory} Quizzes`}
          </Text>
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map(renderQuizCard)
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="help-circle-outline" size={48} color="#dcfce7" />
              <Text className="text-gray-500 mt-2">No quizzes found in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 