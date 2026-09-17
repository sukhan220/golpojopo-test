import { Stack } from 'expo-router';

export default function WriterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="writerBooks" />
      <Stack.Screen name="audioDetails" />
    </Stack>
  );
}
