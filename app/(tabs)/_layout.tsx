import { Link, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, SafeAreaView } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff66b6', // mint-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: { backgroundColor: '#084c8b' },
        headerStyle: { backgroundColor: '#084c8b' },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dictionary',
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Ionicons 
                name="search-outline" 
                size={24} 
                color="#ff66b6" 
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
          tabBarIcon: ({ color }) => <Ionicons name="help-circle-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
