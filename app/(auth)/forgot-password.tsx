// app/(auth)/forgot-password.tsx
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

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert("Email required", "Please enter your email address");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: "myapp://reset-password", // Update this to match your deep link
        });

        setLoading(false);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert(
                "Check your email",
                "We've sent a password reset link to your email. Click the link to set a new password.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-black" : "bg-cream"}`}
        >
            <View className="flex-1 justify-center px-7">
                {/* Title */}
                <Text
                    className={`text-4xl font-bold text-center mb-6 ${
                        isDark ? "text-white" : "text-[#1B263B]"
                    }`}
                >
                    Reset Password
                </Text>

                <Text
                    className={`text-center text-lg mb-12 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                    Enter your email and we'll send you a link to reset your password.
                </Text>

                {/* Email Input */}
                <TextInput
                    placeholder="Email"
                    placeholderTextColor={isDark ? "#aaa" : "#888"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className={`
            p-4 rounded-xl mb-8 border text-base
            ${isDark
                        ? "bg-[#1e1e1e] border-gray-700 text-white"
                        : "bg-white border-[#D4C9B0] text-black"
                    }
          `}
                />

                {/* Send Reset Link Button */}
                <TouchableOpacity
                    onPress={handleReset}
                    disabled={loading}
                    className={`
            p-4 rounded-xl flex-row justify-center items-center
            ${isDark ? "bg-white" : "bg-[#1B263B]"}
            ${loading ? "opacity-80" : ""}
          `}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? "black" : "white"} />
                    ) : (
                        <Text
                            className={`font-semibold text-lg ${isDark ? "text-black" : "text-white"}`}
                        >
                            Send Reset Link
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login */}
                <View className="items-center mt-10">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            ← Back to{" "}
                            <Text className={`underline ${isDark ? "text-white" : "text-[#1B263B]"}`}>
                                Log in
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
