// app/library/_layout.tsx
import { Stack } from 'expo-router';

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#1c131e' },
        headerTintColor: '#fff',
      }}
    />
    
  );
}
