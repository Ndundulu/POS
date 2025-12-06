// components/orders/OrdersModal.tsx
import React, { useState } from "react";
import { Modal } from "react-native";
import OrdersHomeScreen from "./screens/OrdersHomeScreen";
import CreateOrderScreen from "./screens/CreateOrderScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";

type View = "home" | "create" | "details";

export default function OrdersModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const [currentView, setCurrentView] = useState<View>("home");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const goTo = (view: View, orderId?: string) => {
        setCurrentView(view);
        if (orderId) setSelectedOrderId(orderId);
    };

    const goHome = () => {
        setCurrentView("home");
        setSelectedOrderId(null);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            {currentView === "home" && <OrdersHomeScreen onClose={onClose} goTo={goTo} />}
            {currentView === "create" && <CreateOrderScreen goHome={goHome} />}
            {currentView === "details" && selectedOrderId && (
                <OrderDetailsScreen orderId={selectedOrderId} goHome={goHome} />
            )}
        </Modal>
    );
}