import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Animated, { FadeIn, useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { Package, ChevronRight, Pencil, Trash2 } from "lucide-react-native";


const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);
const PALETTE = { gold: "#b89d63" };

export default function ProductCard({
                                        item,
                                        onPress,
                                        textPrimary,
                                        textSecondary,
                                        cardBg,
                                    }: any) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));


    return (
        <View style={{ flex: 1 }}>

        <AnimatedTouch
            entering={FadeIn}
            onPressIn={() => (scale.value = withSpring(0.97))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={style}
        >

            <View style={[styles.card, { backgroundColor: cardBg }]}>
                <View style={styles.icon}>
                    <Package size={28} color={PALETTE.gold} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: textPrimary }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.desc, { color: textSecondary }]}>{item.description}</Text>
                    )}
                </View>
            </View>
        </AnimatedTouch>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#b8a48c30",
    },
    icon: {
        width: 56,
        height: 56,
        backgroundColor: "#b8a48c20",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    name: { fontSize: 17, fontWeight: "600" },
    desc: { fontSize: 13, marginTop: 2 },
    actionBtn: { padding: 4 },
});