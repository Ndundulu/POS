import React from "react";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import {TouchableOpacity, StyleSheet} from "react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);
const PALETTE = { gold: "#b89d63", tan: "#b8a48c" };

export default function FAB({ style, onPressIn, onPressOut, onPress }: any) {
    return (
        <AnimatedTouch
            style={[
                style,
                {
                    position: "absolute",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 10,
                },
            ]}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
        >
            <LinearGradient colors={[PALETTE.gold, PALETTE.tan]} style={styles.gradient}>
                <Plus size={28} color="#fff" />
            </LinearGradient>
        </AnimatedTouch>
    );
}

const styles = StyleSheet.create({
    gradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
});