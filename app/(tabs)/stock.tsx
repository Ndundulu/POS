// src/screens/StockScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StatusBar,
    BackHandler, useColorScheme,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from "@/src/lib/supabaseClient";
import{ useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { SearchBar } from "react-native-elements";

// Components
import CategoryCard from "@/components/stock/CategoryCard";
import ProductCard from "@/components/stock/ProductCard";
import ItemCard from "@/components/stock/ItemCard";
import AddModal from "@/components/stock/AddModal";
import BackButton from "@/components/stock/BackButton";
import FAB from "@/components/ui/FAB";

const PALETTE = { gold: "#b89d63", cream: "#EDEEDA", navy: "#283A55" };

export default function StockScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Dynamic theme classes
// StockScreen.tsx – ONLY replace these 4 lines:
    const bg = isDark ? 'bg-black' : 'bg-[#EDEEDA]';
    const cardBg       = isDark ? "#1e1e1e" : "#A6B9A8";        // was "bg-[#1e1e1e]" / "bg-[#A6B9A8]"
    const textPrimary  = isDark ? "#ffffff" : "#283A55";        // was "text-white" / "text-[#283A55]"
    const textSecondary = isDark ? "#bbbbbb" : "#555555";      // was "text-[#bbb]" / "text-[#555]"

    // Data states
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Modal & Tabs
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<"category" | "product" | "item">("category");

    // Form states
    const [catName, setCatName] = useState("");
    const [prodName, setProdName] = useState("");
    const [prodDesc, setProdDesc] = useState("");
    const [itemColor, setItemColor] = useState("");
    const [itemMotif, setItemMotif] = useState("");
    const [itemSku, setItemSku] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [itemBuyingPrice, setItemBuyingPrice] = useState("");
    const [itemSize, setItemSize] = useState("");
    const [itemQty, setItemQty] = useState("");

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // FAB Animation
    const fabScale = useSharedValue(1);
    const fabStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fabScale.value }],
    }));

    // Back Handler
    useEffect(() => {
        const onBackPress = () => {
            if (selectedProduct) {
                setSelectedProduct(null);
                setSearchQuery("");
                return true;
            } else if (selectedCategory) {
                setSelectedCategory(null);
                setProducts([]);
                setSearchQuery("");
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => subscription.remove();
    }, [selectedCategory, selectedProduct]);

    // Load Data
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from("categories").select("*").order("name");
        setCategories(data || []);
        setLoading(false);
    };

    const fetchProducts = async (id: number) => {
        setLoading(true);
        const { data } = await supabase
            .from("products")
            .select("*")
            .eq("category_id", id)
            .order("name");
        setProducts(data || []);
        setLoading(false);
    };

    const fetchItems = async (id: number) => {
        setLoading(true);
        const { data } = await supabase
            .from("items")
            .select("*, buying_price")
            .eq("product_id", id)
            .order("color");
        setItems(data || []);
        setLoading(false);
    };

    // Add Functions (unchanged logic)
    const addCategory = async () => {
        if (!catName.trim()) return Toast.show({ type: "error", text1: "Name required" });
        const { data, error } = await supabase
            .from("categories")
            .insert({ name: catName.trim() })
            .select()
            .single();
        if (error) return Toast.show({ type: "error", text1: "Failed", text2: error.message });
        setCategories((p) => [...p, data]);
        setCatName("");
        setModalVisible(false);
        Toast.show({ type: "success", text1: "Category added!" });
    };

    const addProduct = async () => {
        if (!prodName.trim()) return Toast.show({ type: "error", text1: "Name required" });
        if (!selectedCategory) return Toast.show({ type: "error", text1: "Select a category" });
        const { data, error } = await supabase
            .from("products")
            .insert({
                name: prodName.trim(),
                description: prodDesc?.trim() || null,
                category_id: selectedCategory.id,
            })
            .select()
            .single();
        if (error) return Toast.show({ type: "error", text1: "Failed", text2: error.message });
        setProducts((p) => [...p, data]);
        setProdName("");
        setProdDesc("");
        setModalVisible(false);
        Toast.show({ type: "success", text1: "Product added!" });
    };

    const addItem = async () => {
        if (!itemSku.trim()) return Toast.show({ type: "error", text1: "SKU required" });
        if (!itemPrice.trim()) return Toast.show({ type: "error", text1: "Price required" });
        if (!itemQty.trim()) return Toast.show({ type: "error", text1: "Qty required" });
        if (!selectedProduct) return Toast.show({ type: "error", text1: "Select a product" });

        const price = parseFloat(itemPrice);
        const qty = parseInt(itemQty, 10);
        const buyingPrice = itemBuyingPrice.trim() ? parseFloat(itemBuyingPrice) : null;

        if (isNaN(price) || isNaN(qty))
            return Toast.show({ type: "error", text1: "Price & Qty must be numbers" });

        const { data, error } = await supabase
            .from("items")
            .insert({
                product_id: selectedProduct.id,
                color: itemColor.trim() || null,
                motif: itemMotif.trim() || null,
                sku: itemSku.trim(),
                price,
                buying_price: buyingPrice,
                size: itemSize.trim() || null,
                quantity: qty,
            })
            .select()
            .single();

        if (error) return Toast.show({ type: "error", text1: "Failed", text2: error.message });

        setItems((p) => [...p, data]);
        setItemColor("");
        setItemMotif("");
        setItemSku("");
        setItemPrice("");
        setItemBuyingPrice("");
        setItemSize("");
        setItemQty("");
        setModalVisible(false);
        Toast.show({ type: "success", text1: "Item added!" });
    };

    // Filtered Data
    const filteredData = useMemo(() => {
        const list = selectedProduct ? items : selectedCategory ? products : categories;
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            (i) =>
                i.name?.toLowerCase().includes(q) ||
                i.color?.toLowerCase().includes(q) ||
                i.sku?.toLowerCase().includes(q)
        );
    }, [categories, products, items, selectedCategory, selectedProduct, searchQuery]);

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-black" : "bg-[#EDEEDA]"}`}>
                <ActivityIndicator size="large" color={PALETTE.gold} />
                <Text className={`mt-3 ${textSecondary}`}>Loading…</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${bg}`}>
            <StatusBar barStyle={isDark ? "dark-content" : "dark-content"} />

            {/* Title */}
            <View className="px-5 flex-col">
                <Text
                    className={`
                    text-4xl font-extrabold mb-4
                    ${isDark ? "text-primary-light" : "text-primary"}
                  `}
                >
                    {selectedProduct?.name || selectedCategory?.name || "Stock Inventory"}
                </Text>

            {/* Back Button */}
            {(selectedCategory || selectedProduct) && (
                <BackButton
                    onPress={() => {
                        if (selectedProduct) {
                            setSelectedProduct(null);
                            setSearchQuery("");
                        } else {
                            setSelectedCategory(null);
                            setProducts([]);
                            setSearchQuery("");
                        }
                    }}
                    className="absolute top-12 left-5 z-50"   // ← This is the magic value

                />
            )}
           </View>

            {/* Search Bar */}
            {(selectedCategory || selectedProduct) && (
                <View className="px-5 mb-3 mt-4">
                    <SearchBar
                        placeholder={selectedProduct ? "Search items..." : "Search products..."}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        lightTheme={!isDark}
                        platform="default"
                        inputContainerStyle={{ backgroundColor: isDark ? "#1e1e1e" : "#A6B9A8", borderRadius: 8 }}
                        containerStyle={{ backgroundColor: "transparent", padding: 0, borderTopWidth: 0, borderBottomWidth: 0 , marginTop: 20}}
                        inputStyle={{ color: isDark ? "#fff" : "#283A55" }}
                        placeholderTextColor={isDark ? "#bbb" : "#666"}
                        round
                    />
                </View>
            )}

            {/* List */}
            <FlatList
                data={filteredData}
                keyExtractor={(i) => i.id.toString()}
                contentContainerClassName="px-5 pb-32"
                renderItem={({ item }) =>
                    selectedProduct ? (
                        <ItemCard
                            item={item}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            cardBg={cardBg}
                        />
                    ) : selectedCategory ? (
                        <ProductCard
                            item={item}
                            onPress={() => {
                                setSelectedProduct(item);
                                fetchItems(item.id);
                            }}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            cardBg={cardBg}
                        />
                    ) : (
                        <CategoryCard
                            item={item}
                            onPress={() => {
                                setSelectedCategory(item);
                                fetchProducts(item.id);
                            }}
                        />
                    )
                }
                ListEmptyComponent={
                    <Text className={`text-center mt-16 ${textSecondary}`}>
                        {searchQuery ? "No results." : "Nothing here yet."}
                    </Text>
                }
            />

            {/* FAB */}
            <FAB
                style={[fabStyle, { position: "absolute", bottom: 100, right: 20 }]}
                onPressIn={() => (fabScale.value = withSpring(0.9))}
                onPressOut={() => (fabScale.value = withSpring(1))}
                onPress={() => setModalVisible(true)}
            >
                <Plus color="white" size={28} />
            </FAB>

            {/* Add Modal */}
            <AddModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setCatName("");
                    setProdName("");
                    setProdDesc("");
                    setItemColor("");
                    setItemMotif("");
                    setItemSku("");
                    setItemPrice("");
                    setItemBuyingPrice("");
                    setItemSize("");
                    setItemQty("");
                }}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                // Category
                catName={catName}
                setCatName={setCatName}
                addCategory={addCategory}
                // Product
                selectedCategory={selectedCategory}
                prodName={prodName}
                setProdName={setProdName}
                prodDesc={prodDesc}
                setProdDesc={setProdDesc}
                addProduct={addProduct}
                // Item
                selectedProduct={selectedProduct}
                itemColor={itemColor}
                setItemColor={setItemColor}
                itemMotif={itemMotif}
                setItemMotif={setItemMotif}
                itemSku={itemSku}
                setItemSku={setItemSku}
                itemPrice={itemPrice}
                setItemPrice={setItemPrice}
                itemBuyingPrice={itemBuyingPrice}
                setItemBuyingPrice={setItemBuyingPrice}
                itemSize={itemSize}
                setItemSize={setItemSize}
                itemQty={itemQty}
                setItemQty={setItemQty}
                addItem={addItem}
                // Theme props
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                cardBg={cardBg}
            />

            <Toast />
        </SafeAreaView>
    );
}
