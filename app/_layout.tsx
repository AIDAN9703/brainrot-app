import { Stack, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Safe area wrapper component for consistent padding
const SafeAreaWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.safeArea}>
      {children}
    </View>
  );
};

// Function to protect routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log("AuthGuard running", {
      firebaseUser: !!firebaseUser,
      segment: segments[0],
    });

    // Check if the user is authenticated - use firebaseUser for auth state
    const isAuthenticated = !!firebaseUser;
    
    // Login is public, everything else needs authentication
    const isLoginRoute = segments[0] === 'login';

    if (!isAuthenticated && !isLoginRoute) {
      // Redirect to login if trying to access protected route while not authenticated
      console.log("Redirecting to login");
      router.replace('/login');
    } else if (isAuthenticated && isLoginRoute) {
      // Redirect to home if trying to access login while authenticated
      console.log("Redirecting to home");
      router.replace('/(tabs)');
    }
  }, [firebaseUser, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
          <StatusBar style="light" />
          <SafeAreaWrapper>
          <Stack 
            screenOptions={{ 
              headerShadowVisible: false,
                headerStyle: { backgroundColor: '#121212' }, 
                contentStyle: { backgroundColor: '#121212' }, 
                headerTitleStyle: { fontFamily: 'serif', fontSize: 20 },
              headerTitleAlign: 'center',
              animation: 'fade',
                headerTintColor: '#FF3E8A',
            }} 
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: 'BRAINROT' }} />
            <Stack.Screen name="word/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ 
                presentation: 'modal', 
                headerTitle: 'Edit Profile',
                headerStyle: { backgroundColor: '#121212' },
                contentStyle: { backgroundColor: '#121212' }
              }} />
          </Stack>
          </SafeAreaWrapper>
        </View>
      </AuthGuard>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // More padding on iOS for the notch
  }
});
