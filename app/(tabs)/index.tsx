import React, { useEffect } from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {supabase} from "@/src/lib/supabaseClient";
import Customers from "@/components/Customers";
import ScrollView = Animated.ScrollView;


interface Category {
    id: string;
    name: string;
    created_at: string;
}

export default function App() {


    return (
        <ScrollView>
            <Text style={{paddingTop: 30}}>Alex Kitheka</Text>
        <View style={styles.container}>
            <View style={styles.cardGrid} >
                <View style={{flex:1, flexDirection:"row",gap: 16}}>
                    <Customers label= "Today's Sales"  value={900000} currency="Ksh" showCurrency={true} />
                    <Customers label= "Total Products" value={100}/>
                </View>
                <View style={{flex:1, flexDirection:"row", gap: 16}}>
                    <Customers label= "Low Stock" value={9000}/>
                    <Customers label= "Customers" value={100}/>
                </View>

            </View>
        </View>
            <View style={styles.overViewContainer}>
                <Text style={styles.overViewTitle}>Overview</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16,
        gap: 16
    },

    cardGrid: {

        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "space-between",

    },

    overViewContainer: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      marginBottom: 24,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: {width: 0, height: 2},
    },

    overViewTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    }



})
