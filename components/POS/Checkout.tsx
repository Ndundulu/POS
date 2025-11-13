import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CheckoutButton() {
    return (
        <TouchableOpacity style={styles.button}>
            <Text style={styles.text}>CHECKOUT</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    text: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});