import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import Animated, { FadeIn, useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Pencil, Trash2 } from "lucide-react-native";

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

const PALETTE = { gold: "#b89d63", tan: "#b8a48c" };

export default function CategoryCard({
                                         item,
                                         onPress,
                                         onEdit,
                                         onDelete,
                                     }: {
    item: any;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const handleDelete = () => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: onDelete },
            ]
        );
    };

    return (
        <AnimatedTouch
            entering={FadeIn}
            onPressIn={() => (scale.value = withSpring(0.96))}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={onPress}
            style={style}
        >
            <LinearGradient colors={[PALETTE.gold, PALETTE.tan]} style={styles.card}>
                <Text style={styles.text}>{item.name}</Text>

                <View style={styles.actions}>
                    {onDelete && (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(); }} style={styles.icon}>
                            <Trash2 size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <ChevronRight size={24} color="#fff" />
                </View>
            </LinearGradient>
        </AnimatedTouch>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    text: { fontSize: 18, fontWeight: "700", color: "#fff" },
    actions: { flexDirection: "row", alignItems: "center", gap: 12 },
    icon: { opacity: 0.9 },
});