import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderProvider } from '../contexts/FolderContext';
import { TaskProvider } from '../contexts/TaskContext';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import FloatingChatbot from './chatbot/FloatingChatbot';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.replace('/loginpage/register');
  }, []);

  return (
    <FolderProvider>
      <TaskProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ 
            headerShown: false, 
            animation: 'fade' 
          }} />
          {pathname !== '/chatbot/App' && <FloatingChatbot />}
            animation: 'none' 
<<<<<<< HEAD
              
=======
>>>>>>> ffad62ceba38258a5ad58b319fba66279e452b0c
        </SafeAreaView>
      </TaskProvider>
    </FolderProvider>
  );
}
