// src/components/stock.tsx/AddModal.tsx
import React from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
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
            {/* Backdrop */}
            <View className="flex-1 bg-black/50 justify-end">
                {/* Modal Content */}
                <View className="rounded-t-3xl max-h-[90%]" style={{ backgroundColor: cardBg }}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-5 py-5 border-b border-gray-200">
                        <Text className="text-xl font-bold" style={{ color: textPrimary }}>
                            Add New
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row justify-around py-3 border-b border-gray-200">
                        {["category", "product", "item"].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className="px-5 pb-2"
                                style={
                                    activeTab === tab
                                        ? { borderBottomColor: PALETTE.gold, borderBottomWidth: 2 }
                                        : {}
                                }
                            >
                                <Text
                                    className={`text-base ${
                                        activeTab === tab ? "font-semibold" : "font-normal"
                                    }`}
                                    style={{
                                        color: activeTab === tab ? PALETTE.gold : textSecondary,
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Scrollable Form Content */}
                    <ScrollView
                        className="px-5"
                        contentContainerStyle={{ paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* === CATEGORY === */}
                        {activeTab === "category" && (
                            <>
                                <TextInput
                                    placeholder="Category Name"
                                    value={catName}
                                    onChangeText={setCatName}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TouchableOpacity
                                    onPress={addCategory}
                                    className="bg-[#b89d63] py-4 rounded-xl items-center mt-3"
                                >
                                    <Text className="text-white font-semibold text-base">
                                        Add Category
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* === PRODUCT === */}
                        {activeTab === "product" && !selectedCategory && (
                            <Text className="text-red-500 text-center mt-6">
                                Select a category first
                            </Text>
                        )}

                        {activeTab === "product" && selectedCategory && (
                            <>
                                <Text className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                                    Category: {selectedCategory.name}
                                </Text>

                                <TextInput
                                    placeholder="Product Name"
                                    value={prodName}
                                    onChangeText={setProdName}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />

                                <TextInput
                                    placeholder="Description (optional)"
                                    value={prodDesc}
                                    onChangeText={setProdDesc}
                                    multiline
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base min-h-[100px] text-start align-top"
                                    style={{ color: textPrimary }}
                                />

                                <TouchableOpacity
                                    onPress={addProduct}
                                    className="bg-[#b89d63] py-4 rounded-xl items-center mt-3"
                                >
                                    <Text className="text-white font-semibold text-base">
                                        Add Product
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* === ITEM === */}
                        {activeTab === "item" && !selectedProduct && (
                            <Text className="text-red-500 text-center mt-6">
                                Select a product first
                            </Text>
                        )}

                        {activeTab === "item" && selectedProduct && (
                            <>
                                <Text className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                                    Product: {selectedProduct.name}
                                </Text>

                                <TextInput
                                    placeholder="Color"
                                    value={itemColor}
                                    onChangeText={setItemColor}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="Motif"
                                    value={itemMotif}
                                    onChangeText={setItemMotif}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="SKU"
                                    value={itemSku}
                                    onChangeText={setItemSku}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="Selling Price (Ksh)"
                                    value={itemPrice}
                                    onChangeText={setItemPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="Buying Price (Ksh)"
                                    value={itemBuyingPrice}
                                    onChangeText={setItemBuyingPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="Size"
                                    value={itemSize}
                                    onChangeText={setItemSize}
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />
                                <TextInput
                                    placeholder="Quantity (0 = On order)"
                                    value={itemQty}
                                    onChangeText={setItemQty}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                    className="border border-gray-300 rounded-xl px-4 py-3.5 mb-4 text-base"
                                    style={{ color: textPrimary }}
                                />

                                <TouchableOpacity
                                    onPress={addItem}
                                    className="bg-[#b89d63] py-4 rounded-xl items-center mt-6"
                                >
                                    <Text className="text-white font-semibold text-base">
                                        Add Item
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}