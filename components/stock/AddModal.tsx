// src/components/stock/AddModal.tsx
import React from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { X } from "lucide-react-native";

const PALETTE = { gold: "#b89d63" };

export default function AddModal({
                                     visible,
                                     onClose,
                                     activeTab,
                                     setActiveTab,

                                     // Category
                                     catName,
                                     setCatName,
                                     addCategory,

                                     // Product
                                     selectedCategory,
                                     prodName,
                                     setProdName,
                                     prodDesc,
                                     setProdDesc,
                                     addProduct,

                                     // Item
                                     selectedProduct,
                                     itemColor,
                                     setItemColor,
                                     itemMotif,
                                     setItemMotif,
                                     itemSku,
                                     setItemSku,
                                     itemPrice,
                                     setItemPrice,
                                     itemBuyingPrice,
                                     setItemBuyingPrice,
                                     itemSize,
                                     setItemSize,
                                     itemQty,
                                     setItemQty,
                                     addItem,

                                     textPrimary,
                                     textSecondary,
                                     cardBg,
                                 }: any) {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: cardBg }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textPrimary }]}>Add New</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabRow}>
                        {["category", "product", "item"].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[
                                    styles.tab,
                                    activeTab === tab && {
                                        borderBottomColor: PALETTE.gold,
                                        borderBottomWidth: 2,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: activeTab === tab ? PALETTE.gold : textSecondary,
                                        fontWeight: activeTab === tab ? "600" : "400",
                                        fontSize: 15,
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ScrollView
                        style={{ padding: 20 }}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        {/* === CATEGORY === */}
                        {activeTab === "category" && (
                            <>
                                <TextInput
                                    placeholder="Category Name"
                                    value={catName}
                                    onChangeText={setCatName}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity style={styles.addBtn} onPress={addCategory}>
                                    <Text style={styles.addBtnText}>Add Category</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* === PRODUCT === */}
                        {activeTab === "product" && !selectedCategory && (
                            <Text
                                style={{ color: "#ef4444", textAlign: "center", marginTop: 20 }}
                            >
                                Select a category first
                            </Text>
                        )}
                        {activeTab === "product" && selectedCategory && (
                            <>
                                <Text style={[styles.label, { color: textPrimary }]}>
                                    Category: {selectedCategory.name}
                                </Text>
                                <TextInput
                                    placeholder="Product Name"
                                    value={prodName}
                                    onChangeText={setProdName}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Description (optional)"
                                    value={prodDesc}
                                    onChangeText={setProdDesc}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    multiline
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity style={styles.addBtn} onPress={addProduct}>
                                    <Text style={styles.addBtnText}>Add Product</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* === ITEM === */}
                        {activeTab === "item" && !selectedProduct && (
                            <Text
                                style={{ color: "#ef4444", textAlign: "center", marginTop: 20 }}
                            >
                                Select a product first
                            </Text>
                        )}
                        {activeTab === "item" && selectedProduct && (
                            <>
                                <Text style={[styles.label, { color: textPrimary }]}>
                                    Product: {selectedProduct.name}
                                </Text>

                                <TextInput
                                    placeholder="Color"
                                    value={itemColor}
                                    onChangeText={setItemColor}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Motif"
                                    value={itemMotif}
                                    onChangeText={setItemMotif}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="SKU"
                                    value={itemSku}
                                    onChangeText={setItemSku}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Selling Price (Ksh)"
                                    value={itemPrice}
                                    onChangeText={setItemPrice}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Buying Price (Ksh)"
                                    value={itemBuyingPrice}
                                    onChangeText={setItemBuyingPrice}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Size"
                                    value={itemSize}
                                    onChangeText={setItemSize}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    placeholderTextColor="#999"
                                />
                                <TextInput
                                    placeholder="Quantity (0 = On order)"
                                    value={itemQty}
                                    onChangeText={setItemQty}
                                    style={[styles.input, { color: textPrimary, borderColor: "#ddd" }]}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />

                                {/* Status is handled by Supabase — no UI */}

                                <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                                    <Text style={styles.addBtnText}>Add Item</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#0008",
        justifyContent: "flex-end",
    },
    content: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    tab: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        fontSize: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: "600",
    },
    addBtn: {
        backgroundColor: "#b89d63",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    addBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});