import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderProvider } from '../contexts/FolderContext';
import { TaskProvider } from '../contexts/TaskContext'; // ✅ moved out of app/
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
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
  );
}
