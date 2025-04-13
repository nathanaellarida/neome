import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderProvider } from './mental_activities/FolderContext';
import { TaskProvider } from './mental_activities/TaskContext'; // ✅ ensure correct import

export default function Layout() {
  return (
    <FolderProvider>
      <TaskProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </TaskProvider>
    </FolderProvider>
  );
}
