// screens/ThemeSettingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    Alert,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Sun, Moon, Monitor, RotateCw } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const PALETTE = {
    gold: "#b89d63",
    tan: "#b8a48c",
    cream: "#EDEZDA",
    navy: "#283A55",
};

type Theme = "light" | "dark" | "system";

const THEME_KEY = "app-theme";

export default function ThemeSettingsScreen() {
    const systemTheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>("system");

    // Load saved theme
    useEffect(() => {
        (async () => {
            try {
                const saved = (await AsyncStorage.getItem(THEME_KEY)) as Theme | null;
                if (saved) setTheme(saved);
            } catch (e) {
                console.error("Failed to load theme", e);
            }
        })();
    }, []);

    // Save theme
    const saveTheme = async (newTheme: Theme) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, newTheme);
            setTheme(newTheme);

            // Show restart prompt on native
            if (Platform.OS !== "web") {
                Alert.alert(
                    "Theme Updated",
                    "Please restart the app to apply the new theme.",
                    [{ text: "OK" }]
                );
            }
        } catch (e) {
            Alert.alert("Error", "Failed to save theme");
        }
    };

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    const options: { label: string; value: Theme; icon: React.ReactNode }[] = [
        {
            label: "Light",
            value: "light",
            icon: <Sun size={20} color={theme === "light" ? "#fff" : PALETTE.navy} />,
        },
        {
            label: "Dark",
            value: "dark",
            icon: <Moon size={20} color={theme === "dark" ? "#fff" : PALETTE.navy} />,
        },
        {
            label: "System",
            value: "system",
            icon: <Monitor size={20} color={theme === "system" ? "#fff" : PALETTE.navy} />,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#111" : PALETTE.cream }]}>
            <Text style={[styles.title, { color: isDark ? "#fff" : PALETTE.navy }]}>
                Theme Preference
            </Text>

            <View style={styles.options}>
                {options.map((opt) => {
                    const isActive = theme === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => saveTheme(opt.value)}
                            style={{ marginBottom: 12 }}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={[PALETTE.gold, PALETTE.tan]}
                                    style={styles.activeCard}
                                >
                                    {opt.icon}
                                    <Text style={styles.activeText}>{opt.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={[styles.inactiveCard, { borderColor: PALETTE.tan + "40" }]}>
                                    {opt.icon}
                                    <Text style={[styles.inactiveText, { color: isDark ? "#aaa" : PALETTE.navy }]}>
                                        {opt.label}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? "#888" : "#666" }]}>
                    Current: {currentTheme === "light" ? "Light" : "Dark"} Mode
                    {theme === "system" && " (System)"}
                </Text>
                {Platform.OS !== "web" && (
                    <TouchableOpacity style={styles.restartBtn} onPress={() => Alert.alert("Restart", "Please close and reopen the app.")}>
                        <RotateCw size={16} color={PALETTE.gold} />
                        <Text style={styles.restartText}>Restart App</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ────── STYLES ──────
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 26, fontWeight: "800", marginBottom: 30, textAlign: "center" },
    options: { gap: 12 },
    activeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        borderRadius: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    activeText: { color: "#fff", fontSize: 17, fontWeight: "600" },
    inactiveCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    inactiveText: { fontSize: 17, fontWeight: "500" },
    footer: { marginTop: 40, alignItems: "center" },
    footerText: { fontSize: 14, marginBottom: 10 },
    restartBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
    restartText: { color: "#b89d63", fontSize: 14, fontWeight: "600" },
});