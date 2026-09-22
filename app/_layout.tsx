

// // app/_layout.js (বা আপনার RootLayout ফাইল)

// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider } from 'react-native-safe-area-context';


// import MiniPlayer from '../components/buildApp/MiniPlayer';
// import { AudioProvider } from '../context/audioContext';

// import { useColorScheme } from '@/hooks/useColorScheme';
// import { LibraryProvider } from '@/context/libraryContext';

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <SafeAreaProvider>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <LibraryProvider>
//           <AudioProvider>

//             <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//               <Stack>
//                 {/* নিশ্চিত করুন player এবং reader এখন (tabs) ফোল্ডারের বাইরে আছে */}
//                 <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//                 <Stack.Screen name="player" options={{ headerShown: false }} /> {/* <-- এটি যোগ করুন যদি player একটি স্বতন্ত্র স্ক্রিন হয় */}
//                 <Stack.Screen name="reader" options={{ headerShown: false }} /> {/* <-- এটি যোগ করুন যদি reader একটি স্বতন্ত্র স্ক্রিন হয় */}
//                 <Stack.Screen name="details" options={{ headerShown: true }} /> // ✅ এটা যোগ করো
//                 <Stack.Screen name="writer" options={{ headerShown: false }} /> // ✅ এটা যোগ করো
//                 <Stack.Screen name="writerBooks" options={{ headerShown: false }} /> // ✅ এটা যোগ করো
//                  <Stack.Screen name="library" options={{ headerShown: false }} />

//                 <Stack.Screen name="+not-found" />
//               </Stack>
//               <StatusBar style="auto" />
//               <MiniPlayer />
//             </ThemeProvider>
//           </AudioProvider>
//         </LibraryProvider>
//       </GestureHandlerRootView>
//     </SafeAreaProvider>
//   );
// }

// import AppIntro from '../components/animations/AppIntro';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppIntro from '../components/animations/AppIntro';

import { LibraryProvider } from '@/context/libraryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import MiniPlayer from '../components/buildApp/MiniPlayer';
import { AudioProvider } from '../context/audioContext';

const GOLD = '#D4AF37';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);


  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
     
      const timer = setTimeout(() => {
        setIsAppReady(true);
      }, 9000); 

      return () => clearTimeout(timer); 
    }
  }, [loaded]);

  if (!loaded) return null;

  if (!isAppReady) {
    return <AppIntro onFinish={() => setIsAppReady(true)} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LibraryProvider>
          <AudioProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="player" />
                <Stack.Screen name="reader" />
                <Stack.Screen name="details" options={{ headerShown: true }} />
                <Stack.Screen name="writer" />
                <Stack.Screen name="writerBooks" />
                <Stack.Screen name="library" />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <MiniPlayer />
          </AudioProvider>
        </LibraryProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 40,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#333',
    marginHorizontal: 15,
  },
  loaderBg: {
    width: 120,
    height: 3,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 10,
  }
});