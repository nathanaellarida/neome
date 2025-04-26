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
<<<<<<< HEAD
    router.replace('/homescreen/HomeScreen');
=======
    // Change this path to the screen you're working on
    //router.replace('/neome_userdata_app/UserDataScreen1');
    router.replace('/homescreen/HomeScreen');
    //router.replace('/loginpage/SignUp');
>>>>>>> Matt
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
