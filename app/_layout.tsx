import { Stack, Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { FolderProvider } from './mental_activities/FolderContext';
import { TaskProvider } from './mental_activities/TaskContext'; // ✅ ensure correct import
=======
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
>>>>>>> jhoanne's_Branch

export default function Layout() {
  const router = useRouter();
  
  // Use useEffect to navigate after the component is mounted
  useEffect(() => {
    // Change this path to the screen you're working on
    router.replace('/loginpage/login');
  }, []);

  return (
<<<<<<< HEAD
    <FolderProvider>
      <TaskProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </TaskProvider>
    </FolderProvider>
=======
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'fade'
        }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
>>>>>>> jhoanne's_Branch
  );
}
