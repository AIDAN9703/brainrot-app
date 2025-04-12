import { Stack, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';


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
        <View style={{ flex: 1, backgroundColor: '#084c8b' }}>
          <StatusBar style="light" />
          <Stack 
            screenOptions={{ 
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#084c8b' }, 
              contentStyle: { backgroundColor: '#084c8b' }, 
              headerTitleStyle: { fontFamily: 'Poppins-Medium', fontSize: 18 },
              headerTitleAlign: 'center',
              animation: 'fade',
              headerTintColor: '#fff',
            }} 
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: 'BRAINROT' }} />
            <Stack.Screen name="word/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerTitle: 'Edit Profile' }} />
          </Stack>
        </View>
      </AuthGuard>
    </AuthProvider>
  );
}
