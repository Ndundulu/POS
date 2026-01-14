import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";  // ← Keep this! Important for NativeWind/Tailwind
import { useColorScheme } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';               // Add these imports
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent splash from auto-hiding (must be outside component)
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();

    // Load your fonts here (adjust names/paths to match your project)
    // If you use Google fonts → install @expo-google-fonts/xxx and use those
    const [fontsLoaded, fontError] = useFonts({
        // Example: custom local fonts
        // 'YourFont-Regular': require('../assets/fonts/YourFont-Regular.ttf'),
        // 'YourFont-Bold': require('../assets/fonts/YourFont-Bold.ttf'),

        // Or if no custom fonts yet, at least load something basic or skip
        // For Tailwind defaults, this step still helps stabilize layout
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            // Hide splash only when ready (prevents ugly flash/unstyled UI)
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // Important: Don't render anything until fonts are ready
    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <>
            <StatusBar style={colorScheme === "dark" ? "dark" : "light"} />
            <SafeAreaView style={{ flex: 1 }}>  {/* Optional: better safe area handling */}
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </SafeAreaView>
        </>
    );
}