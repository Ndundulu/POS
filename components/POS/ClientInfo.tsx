import { View, TextInput, StyleSheet } from 'react-native';

export default function ClientInfo() {
    return (
        <View style={styles.container}>
            <TextInput placeholder="Client Name" style={styles.input} />
            <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" />
            <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
});