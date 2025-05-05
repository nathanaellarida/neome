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
    //router.replace('/loginpage/register');
    //router.replace('/Challenges/CreateNewChallenge');
    //router.replace('/components/EmailVerificationModal');
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
          {pathname !== '/chatbot/App' && <FloatingChatbot />}
        </SafeAreaView>
      </TaskProvider>
    </FolderProvider>
  );
}
