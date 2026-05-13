import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { ProductCard } from '../components/ProductCard';
import { useProducts, Product } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { colors, spacing, rounded, typography, shadows } from '../theme';
import { AddProductModal } from '../components/AddProductModal';
import { ProductImageGalleryModal } from '../components/ProductImageGalleryModal';

export const ProductCatalogScreen = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { products, loading, refetch } = useProducts(debouncedSearch);
  const addItem = useCartStore((state) => state.addItem);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={colors.outline} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name or SKU..."
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <AddProductModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={refetch}
      />

      <ProductImageGalleryModal
        product={selectedProduct}
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          addItem(product);
          setSelectedProduct(null);
        }}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAddToCart={addItem}
              onPress={(product) => setSelectedProduct(product)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    marginBottom: spacing.l,
    marginTop: spacing.m,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: 52,
    color: colors.onSurface,
    ...typography.bodyMd,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 52,
    height: 52,
    borderRadius: rounded.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.m,
    ...shadows.sm,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xs,
  },
});
