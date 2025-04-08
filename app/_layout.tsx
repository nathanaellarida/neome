import { Stack, Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();
  
  // Use useEffect to navigate after the component is mounted
  useEffect(() => {
    // Change this path to the screen you're working on
    router.replace('/loginpage/login');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
  );
}