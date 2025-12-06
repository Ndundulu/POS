import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useColorScheme,
} from "react-native";
import { supabase } from "@/src/lib/supabaseClient.js";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native"; // Optional: for nice icons

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state

    // Native color scheme
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const handleLogin = async () => {
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (error) {
            Alert.alert("Login failed", error.message);
            setLoading(false);
            return;
        } else if (data.session) {
            router.replace("/(tabs)");
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-black" : "bg-cream"}`}
        >
            <View className="flex-1 justify-center px-7">
                <Text
                    className={`text-4xl font-bold text-center mb-12 ${
                        isDark ? "text-white" : "text-[#1B263B]"
                    }`}
                >
                    Welcome Back
                </Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor={isDark ? "#aaa" : "#888"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`
                        p-4 rounded-xl mb-4 border text-base
                        ${isDark ? "bg-[#1e1e1e] border-gray-700 text-white" : "bg-white border-[#D4C9B0] text-black"}
                    `}
                />

                {/* Password Field with Toggle */}
                <View className={`
                    flex-row items-center rounded-xl mb-6 border
                    ${isDark ? "bg-[#1e1e1e] border-gray-700" : "bg-white border-[#D4C9B0]"}
                `}>
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={isDark ? "#aaa" : "#888"}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        className={`
                            flex-1 p-4 text-base
                            ${isDark ? "text-white" : "text-black"}
                        `}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="px-4"
                    >
                        {showPassword ? (
                            <EyeOff size={22} color={isDark ? "#aaa" : "#666"} />
                        ) : (
                            <Eye size={22} color={isDark ? "#aaa" : "#666"} />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className={`
                        p-4 rounded-xl flex-row justify-center items-center
                        ${isDark ? "bg-white" : "bg-[#1B263B]"}
                    `}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? "black" : "white"} />
                    ) : (
                        <Text className={`${isDark ? "text-black" : "text-white"} font-semibold text-lg`}>
                            Sign In
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="items-center mt-8 space-y-4">
                    <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                        <Text className={`text-lg ${isDark ? "text-white" : "text-[#1B263B]"}`}>
                            Don't have an account? <Text className="underline">Sign up</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                        <Text className={`underline text-lg ${isDark ? "text-white" : "text-[#1B263B]"}`}>
                            Forgot your password?
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}