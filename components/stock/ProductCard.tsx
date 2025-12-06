// components/stock/ProductCard.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Animated, {
    FadeIn,
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";
import { Package } from "lucide-react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

interface ProductCardProps {
    item: any;
    onPress: () => void;
    textPrimary: string;
    textSecondary: string;
    cardBg: string;
}

export default function ProductCard({
                                        item,
                                        onPress,
                                        textPrimary,
                                        textSecondary,
                                        cardBg,
                                    }: ProductCardProps) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedTouch
            entering={FadeIn}
            onPressIn={() => (scale.value = withSpring(0.97))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={animatedStyle}
            activeOpacity={1}
            className="mb-3"
        >
            <View
                className="p-4 rounded-2xl flex-row items-center border border-[#b8a48c30]"
                style={{
                    backgroundColor: cardBg,   // Fixes the error
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <View className="w-14 h-14 bg-[#b8a48c20] rounded-xl justify-center items-center mr-3">
                    <Package size={28} color="#b89d63" />
                </View>

                <View className="flex-1">
                    <Text className="text-[17px] font-semibold" style={{ color: textPrimary }}>
                        {item.name}
                    </Text>
                    {item.description && (
                        <Text className="text-[13px] mt-0.5" style={{ color: textSecondary }}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </View>
        </AnimatedTouch>
    );
}