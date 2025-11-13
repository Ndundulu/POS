import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";
type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: "system",
    setTheme: () => {},
    isDark: false,
});

const THEME_KEY = "app-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemTheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>("system");

    useEffect(() => {
        (async () => {
            const saved = (await AsyncStorage.getItem(THEME_KEY)) as Theme | null;
            if (saved) setTheme(saved);
        })();
    }, []);

    const handleSetTheme = async (newTheme: Theme) => {
        await AsyncStorage.setItem(THEME_KEY, newTheme);
        setTheme(newTheme);
    };

    const isDark = theme === "system" ? systemTheme === "dark" : theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}