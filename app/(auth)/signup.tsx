// app/(auth)/signup.tsx
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
import { supabase } from "@/src/lib/supabaseClient";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const passwordsMatch = password === confirmPassword && password.length > 0;
    const isPasswordValid = password.length >= 6;

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Missing fields", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords don't match", "Please make sure both passwords are the same");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak password", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        });

        setLoading(false);

        if (error) {
            Alert.alert("Sign up failed", error.message);
        } else {
            Alert.alert(
                "Check your email!",
                "We've sent you a confirmation link. Please verify your email to continue.",
                [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
            );
        }
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
                    Create Account
                </Text>

                {/* Email */}
                <TextInput
                    placeholder="Email"
                    placeholderTextColor={isDark ? "#aaa" : "#888"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`
            p-4 rounded-xl mb-4 border text-base
            ${isDark
                        ? "bg-[#1e1e1e] border-gray-700 text-white"
                        : "bg-white border-[#D4C9B0] text-black"
                    }
          `}
                />

                {/* Password */}
                <View
                    className={`
            flex-row items-center rounded-xl mb-4 border
            ${isDark ? "bg-[#1e1e1e] border-gray-700" : "bg-white border-[#D4C9B0]"}
          `}
                >
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={isDark ? "#aaa" : "#888"}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        className={`flex-1 p-4 text-base ${isDark ? "text-white" : "text-black"}`}
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

                {/* Confirm Password */}
                <View
                    className={`
            flex-row items-center rounded-xl mb-4 border
            ${passwordsMatch
                        ? isDark
                            ? "border-green-500"
                            : "border-green-600"
                        : confirmPassword && !passwordsMatch
                            ? "border-red-500"
                            : isDark
                                ? "border-gray-700"
                                : "border-[#D4C9B0]"
                    }
            ${isDark ? "bg-[#1e1e1e]" : "bg-white"}
          `}
                >
                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor={isDark ? "#aaa" : "#888"}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        className={`flex-1 p-4 text-base ${isDark ? "text-white" : "text-black"}`}
                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="px-4"
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={22} color={isDark ? "#aaa" : "#666"} />
                        ) : (
                            <Eye size={22} color={isDark ? "#aaa" : "#666"} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                    <Text
                        className={`text-sm mb-6 text-center ${
                            passwordsMatch
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                    >
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </Text>
                )}

                {/* Sign Up Button */}
                <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading || !passwordsMatch || !isPasswordValid}
                    className={`
            p-4 rounded-xl flex-row justify-center items-center
            ${isDark ? "bg-white" : "bg-[#1B263B]"}
            ${(!passwordsMatch || !isPasswordValid) ? "opacity-60" : ""}
          `}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? "black" : "white"} />
                    ) : (
                        <Text
                            className={`font-semibold text-lg ${isDark ? "text-black" : "text-white"}`}
                        >
                            Sign Up
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View className="items-center mt-8">
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                        <Text className={`text-lg ${isDark ? "text-white" : "text-[#1B263B]"}`}>
                            Already have an account?{" "}
                            <Text className="underline font-medium">Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
