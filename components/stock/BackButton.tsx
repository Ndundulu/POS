// components/stock/BackButton.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

interface BackButtonProps {
    onPress: () => void;
    className?: string;        // ← ADD THIS
    // …or even better:  ...rest: any
}

export default function BackButton({
                                       onPress,
                                       className = ""           // ← AND THIS (with default)
                                   }: BackButtonProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouch
            onPressIn={() => (scale.value = withSpring(0.92))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={animatedStyle}
            activeOpacity={1}
            className={`absolute top-16 left-6 z-50 ${className}`}   // ← NOW IT WORKS
        >
            <View className="
        w-7 h-7
        bg-white/90 dark:bg-black/80
        backdrop-blur-lg rounded-full
        items-center justify-center
        shadow-2xl shadow-black/30
        border border-white/20 dark:border-black/20
      ">
                <ChevronLeft size={20} color="#b89d63" strokeWidth={3} />
            </View>
        </AnimatedTouch>
    );
}