import { Stack, Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();
  
  // Use useEffect to navigate after the component is mounted
  useEffect(() => {
    // Change this path to the screen you're working on
    //router.replace('/neome_userdata_app/UserDataScreen1');
    router.replace('/homescreen/HomeScreen');
    //router.replace('/loginpage/SignUp');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaView>
  );
}