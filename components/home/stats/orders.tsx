// components/home/OrdersCard.tsx
import { TouchableOpacity } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import OrdersModal from "@/components/orders/OrdersModal";
import { useState } from "react";

export default function OrdersCard() {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <StatCardBase label="Orders" value="125" />
            </TouchableOpacity>

            <OrdersModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}