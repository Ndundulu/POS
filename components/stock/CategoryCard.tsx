// components/stock/CategoryCard.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Animated, {
    FadeIn,
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

interface CategoryCardProps {
    item: any;
    onPress: () => void;
}

export default function CategoryCard({ item, onPress }: CategoryCardProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouch
            entering={FadeIn}
            onPressIn={() => (scale.value = withSpring(0.96))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={animatedStyle}
            activeOpacity={1}
            className="mb-3"
        >
            {/* Card – backgroundColor via style to avoid Reanimated crash */}
            <View
                className="
          px-5 py-5
          rounded-2xl
          flex-row items-center justify-between
          shadow-lg elevation-6
        "
                style={{
                    backgroundColor: "#A6B9A8",           // Safe for Reanimated
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                }}
            >
                <Text className="text-lg font-bold text-white">
                    {item.name}
                </Text>

                <ChevronRight size={24} color="#fff" />
            </View>
        </AnimatedTouch>
    );
}