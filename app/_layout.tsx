import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { FolderProvider } from './mental_activities/FolderContext';
import { TaskProvider } from './mental_activities/TaskContext'; // ✅ ensure correct import
=======
import { FolderProvider } from '../contexts/FolderContext';
import { TaskProvider } from '../contexts/TaskContext'; // ✅ moved out of app/
>>>>>>> main
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
<<<<<<< HEAD
    // Change this path to the screen you're working on
    router.replace('./app/index');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
=======
    router.replace('/homescreen/HomeScreen');
  }, []);

  return (
    <FolderProvider>
      <TaskProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ 
            headerShown: false, 
            animation: 'fade' 
                }} />
        </SafeAreaView>
      </TaskProvider>
    </FolderProvider>
>>>>>>> main
  );
}
