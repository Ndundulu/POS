import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const PALETTE = { gold: "#b89d63" };

export default function LoadingState({ message = "Loading…" }: { message?: string }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={PALETTE.gold} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 12,
        color: "#bbb",
        fontSize: 16,
    },
});