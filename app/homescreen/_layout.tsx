import { Stack } from 'expo-router';

export default function HomescreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
}
