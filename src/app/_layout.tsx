import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  router,
  Stack,
  ThemeProvider,
} from "expo-router";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

     useEffect(() => {
    const checkGuide = async () => {
      const hasSeenGuide = await AsyncStorage.getItem('hasSeenGuide');
      // If the user hasn't seen the guide, start there
      setInitialRoute(hasSeenGuide ? '(tabs)' : 'guide');
    };
    if (isAuthenticated) {
      checkGuide();
    }
  }, [isAuthenticated]);

    if (isLoading || initialRoute === null) {
    return <AnimatedSplashOverlay />;
  }



    // if (isLoading) {
    //   return <AnimatedSplashOverlay />;
    // }

  // if (!isAuthenticated) {
  //   router.push("/landing");
  // }

if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="landing">
        <Stack.Screen name="landing" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    );
  }


  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="guide" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );

}

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const colorScheme = useColorScheme();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthenticatedLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}
