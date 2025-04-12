import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define types
interface Post {
  id: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  hasImage?: boolean;
  imageUrl?: string;
  tags?: string[];
}

interface Topic {
  id: string;
  name: string;
  postCount: number;
}

// Mock data for trending topics
const TRENDING_TOPICS: Topic[] = [
  { id: '1', name: 'rizz', postCount: 423 },
  { id: '2', name: 'bussin', postCount: 287 },
  { id: '3', name: 'slay', postCount: 356 },
  { id: '4', name: 'mid', postCount: 198 },
  { id: '5', name: 'cap', postCount: 312 },
  { id: '6', name: 'yeet', postCount: 145 },
];

// Mock data for posts
const POSTS: Post[] = [
  {
    id: '1',
    username: 'slayqueen',
    userAvatar: 'https://picsum.photos/id/64/200',
    content: 'Just learned the word "rizz" today and I\'m already using it in every conversation. My rizz game is getting stronger! 💪',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 7,
    isLiked: false,
    tags: ['rizz', 'learning'],
  },
  {
    id: '2',
    username: 'mememaster',
    userAvatar: 'https://picsum.photos/id/65/200',
    content: 'That new movie was totally mid. Don\'t waste your time, fr fr no cap.',
    timestamp: '5 hours ago',
    likes: 128,
    comments: 24,
    isLiked: true,
    hasImage: true,
    imageUrl: 'https://picsum.photos/id/237/400/300',
    tags: ['mid', 'movies', 'nocap'],
  },
  {
    id: '3',
    username: 'vibecheck',
    userAvatar: 'https://picsum.photos/id/66/200',
    content: 'The food at that new restaurant was bussin bussin! Y\'all need to try it ASAP.',
    timestamp: '1 day ago',
    likes: 76,
    comments: 15,
    isLiked: false,
    hasImage: true,
    imageUrl: 'https://picsum.photos/id/292/400/300',
    tags: ['bussin', 'food'],
  },
  {
    id: '4',
    username: 'trendspotter',
    userAvatar: 'https://picsum.photos/id/67/200',
    content: 'Just heard someone use "yeet" in 2023. I can\'t even. 💀',
    timestamp: '2 days ago',
    likes: 215,
    comments: 43,
    isLiked: true,
    tags: ['yeet', 'outdated'],
  },
];

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'trending'>('feed');

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const handlePost = () => {
    if (newPostText.trim() === '') return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      username: 'me',
      userAvatar: 'https://picsum.photos/id/68/200',
      content: newPostText,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false,
      tags: extractHashtags(newPostText),
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    
    if (!matches) return [];
    
    return matches.map(tag => tag.substring(1));
  };

  const renderTrendingTopic = ({ item }: { item: Topic }) => (
    <TouchableOpacity className="mr-3">
      <View className="bg-mint-50 px-4 py-3 rounded-xl">
        <Text className="text-mint-800 font-bold">#{item.name}</Text>
        <Text className="text-xs text-gray-500 mt-1">{item.postCount} posts</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      {/* Header */}
      <View className="px-4 pb-2">
        <Text className="text-2xl font-bold text-mint-800">Community</Text>
        <Text className="text-gray-600">Connect with other brainrot enthusiasts</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 mx-4 mb-2">
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'feed' ? 'border-b-2 border-mint-500' : ''}`}
          onPress={() => setActiveTab('feed')}
        >
          <Text className={`text-center font-medium ${activeTab === 'feed' ? 'text-mint-800' : 'text-gray-500'}`}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'trending' ? 'border-b-2 border-mint-500' : ''}`}
          onPress={() => setActiveTab('trending')}
        >
          <Text className={`text-center font-medium ${activeTab === 'trending' ? 'text-mint-800' : 'text-gray-500'}`}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'feed' ? (
        <ScrollView className="flex-1">
          {/* New Post Input */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row">
              <Image
                source={{ uri: 'https://picsum.photos/id/68/200' }}
                className="w-10 h-10 rounded-full"
              />
              <View className="flex-1 ml-3">
                <TextInput
                  className="bg-white rounded-lg p-3 min-h-[80px] text-base border border-gray-100"
                  placeholder="What's on your mind? Use #hashtags for topics!"
                  multiline
                  value={newPostText}
                  onChangeText={setNewPostText}
                />
                <TouchableOpacity
                  className="bg-mint-500 self-end mt-2 px-4 py-2 rounded-full"
                  onPress={handlePost}
                >
                  <Text className="text-white font-medium">Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Trending Topics Horizontal Scroll */}
          <View className="py-3">
            <View className="px-4 mb-2 flex-row justify-between items-center">
              <Text className="text-base font-medium text-gray-500">Trending Topics</Text>
              <TouchableOpacity onPress={() => setActiveTab('trending')}>
                <Text className="text-mint-600">See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TRENDING_TOPICS.slice(0, 5)}
              renderItem={renderTrendingTopic}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            />
          </View>

          {/* Posts Feed */}
          <View className="pb-20">
            {posts.map((post) => (
              <View key={post.id} className="p-4 border-b border-gray-200 bg-white">
                {/* Post Header */}
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: post.userAvatar }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-bold text-mint-800">{post.username}</Text>
                      <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-xs text-gray-500">{post.timestamp}</Text>
                  </View>
                </View>
                
                {/* Post Content */}
                <Text className="text-base mb-3">{post.content}</Text>
                
                {/* Post Image (if any) */}
                {post.hasImage && post.imageUrl && (
                  <View className="mb-3 rounded-xl overflow-hidden">
                    <Image
                      source={{ uri: post.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <View className="flex-row flex-wrap mb-3">
                    {post.tags.map((tag, index) => (
                      <TouchableOpacity key={index} className="bg-mint-50 rounded-full px-3 py-1 mr-2 mb-1">
                        <Text className="text-mint-700 text-xs">#{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Post Stats */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-mint-500 w-5 h-5 rounded-full items-center justify-center">
                      <Ionicons name="heart" size={12} color="white" />
                    </View>
                    <Text className="ml-1 text-xs text-gray-500">{post.likes} likes</Text>
                  </View>
                  <Text className="text-xs text-gray-500">{post.comments} comments</Text>
                </View>

                {/* Post Actions */}
                <View className="flex-row justify-between border-t border-gray-100 pt-3">
                  <TouchableOpacity 
                    className="flex-row items-center flex-1 justify-center" 
                    onPress={() => handleLike(post.id)}
                  >
                    <Ionicons
                      name={post.isLiked ? "heart" : "heart-outline"}
                      size={20}
                      color={post.isLiked ? "#f43f5e" : "#9ca3af"}
                    />
                    <Text className={`ml-1 ${post.isLiked ? "text-red-500" : "text-gray-500"}`}>
                      Like
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-row items-center flex-1 justify-center">
                    <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
                    <Text className="ml-1 text-gray-500">Comment</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-row items-center flex-1 justify-center">
                    <Ionicons name="share-social-outline" size={20} color="#9ca3af" />
                    <Text className="ml-1 text-gray-500">Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Text className="text-base font-medium mb-4 text-gray-500">Trending Topics</Text>
          <View className="flex-row flex-wrap">
            {TRENDING_TOPICS.map((topic) => (
              <TouchableOpacity key={topic.id} className="w-1/2 p-2">
                <View className="bg-mint-50 p-4 rounded-xl">
                  <Text className="text-mint-800 font-bold text-lg">#{topic.name}</Text>
                  <Text className="text-gray-500 mt-1">{topic.postCount} posts</Text>
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs text-mint-600">Trending now</Text>
                    <Ionicons name="arrow-forward" size={16} color="#16a34a" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
} 