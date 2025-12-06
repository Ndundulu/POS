// app/(auth)/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {useColorScheme} from "react-native";

export default function AuthLayout() {
    const colorScheme = useColorScheme();

    return (
        <>
            <StatusBar style={ colorScheme === "dark"? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}