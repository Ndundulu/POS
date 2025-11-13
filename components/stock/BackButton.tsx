import React from "react";
import {Text, StyleSheet, TouchableOpacity} from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);
const PALETTE = { gold: "#b89d63" };

export default function BackButton({ onPress }: { onPress: () => void }) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <AnimatedTouch
            onPressIn={() => (scale.value = withSpring(0.92))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={style}
        >
            <Text style={styles.text}>
                <ChevronLeft size={18} /> Back
            </Text>
        </AnimatedTouch>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        color: PALETTE.gold,
    },
});