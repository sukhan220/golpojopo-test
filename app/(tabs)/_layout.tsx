

// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
let tabSize=24

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ffd700',
          tabBarInactiveTintColor: '#f0e5d8',
          tabBarStyle: { backgroundColor: '#1c131e', borderTopWidth: 0 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={tabSize} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <Ionicons name="search" size={tabSize} color={color} />,
            headerShown: true,
            headerTitle: 'All Categories',
          }}
        />

        <Tabs.Screen
          name="Library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="library" size={tabSize} color={color} />,
            headerShown: false,
          }}

        />

        <Tabs.Screen
          name="writer"
          options={{
            title: 'Writer',
            tabBarIcon: ({ color }) => <FontAwesome name="edit" size={tabSize} color={color} />,
            headerShown: false,
          }}

        />

        <Tabs.Screen
          name="details"
          options={{
            headerShown: false,
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null, // ✅ Tab item দেখাবে না
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
