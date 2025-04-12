import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, 
  Platform, ScrollView, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register, loginAsGuest } = useAuth();
  const router = useRouter();
  
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (isRegistering && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      Alert.alert(
        'Authentication Error', 
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      await loginAsGuest();
      // The auth listener will handle redirection
    } catch (error: any) {
      Alert.alert(
        'Guest Login Error', 
        error.message || 'Failed to sign in as guest. Please try again.'
      );
    } finally {
      setIsGuestLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setPassword('');
    setConfirmPassword('');
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-12 justify-center">
          {/* Header */}
          <View className="items-center">
            <Image 
              source={require('../assets/brainrot-logo-text.png')} 
              className="w-80 h-80"
              resizeMode="contain"
            />
          </View>
          
          {/* Form */}
          <View className="space-y-4">
            {isRegistering && (
              <View>
                <Text className="text-sm font-medium text-white mb-1">Display Name</Text>
                <View className="flex-row items-center rounded-lg px-4 py-3 border bg-white border-gray-200">
                  <Ionicons name="person-outline" size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-gray-800"
                    placeholder="Your name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="off"
                    textContentType="oneTimeCode"
                  />
                </View>
              </View>
            )}
            
            <View>
              <Text className="text-sm font-medium text-white mb-1">Email</Text>
              <View className="flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-2 text-base text-gray-800"
                  placeholder="Your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="oneTimeCode"
                />
              </View>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-white mb-1">Password</Text>
              <View className="flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-2 text-base text-gray-800"
                  placeholder="Your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {isRegistering && (
              <View>
                <Text className="text-sm font-medium text-white mb-1">Confirm Password</Text>
                <View className="flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-200">
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-gray-800"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    textContentType="oneTimeCode"
                  />
                </View>
              </View>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity
              className="bg-pink-primary py-3 rounded-lg items-center mt-4"
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Guest Login Button */}
            <TouchableOpacity
              className="bg-gray-600 py-3 rounded-lg items-center mt-2"
              onPress={handleGuestLogin}
              disabled={isGuestLoading}
            >
              {isGuestLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Continue as Guest
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Toggle Auth Mode */}
            <TouchableOpacity
              className="py-3 items-center"
              onPress={toggleAuthMode}
              disabled={isLoading}
            >
              <Text className="text-white text-sm">
                {isRegistering 
                  ? 'Already have an account? Sign In' 
                  : 'Don\'t have an account? Create one'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 