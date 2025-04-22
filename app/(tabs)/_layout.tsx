import { Link, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, SafeAreaView } from 'react-native';
import { colors } from '../styles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: 'white',
        tabBarStyle: { 
          backgroundColor: colors.bg,
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 85 : 60, // Taller for iOS to account for home indicator
          paddingBottom: Platform.OS === 'ios' ? 28 : 8, // More bottom padding on iOS
          paddingTop: 8
        },
        headerStyle: { backgroundColor: colors.bg },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dictionary',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={24} 
              color={color} 
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Ionicons 
                name="search-outline" 
                size={24} 
                color={colors.pink}
                style={{ marginRight: 15 }} 
              />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "help-circle" : "help-circle-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
