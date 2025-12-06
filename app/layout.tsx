// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { useColorScheme} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <>
            <StatusBar style={colorScheme === "dark"? "dark" : "light"}/> {/* "auto" respects isDark from ThemeProvider */}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>


    );
}