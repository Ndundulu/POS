import {View, Text, StyleSheet} from 'react-native'
import React from 'react'

interface typelv {
    label: string
    value: number
    currency?: string
    showCurrency?: boolean

}

const Customers: React.FC<typelv> = ({label, value, currency = "Ksh", showCurrency }) => {

    return (

        <View style={styles.card}>
            <Text style={styles.cardTitle}>{label}</Text>
            {value !== undefined && (
                <Text style={styles.cardValue}>
                    {showCurrency
                        ? `${currency}${value}` : value}
                </Text>
            )}
        </View>

    )
}
export default Customers



const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        width: "48%",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },

    cardTitle: {
        fontSize: 14,
        color : "black",
        fontWeight: "500",
    },

    cardValue: {
        fontSize: 25,
        color : "#11827",
        fontWeight: "700",
        marginTop: 4,
    }





})




