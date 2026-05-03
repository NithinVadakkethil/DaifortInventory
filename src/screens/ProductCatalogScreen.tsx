import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { colors, spacing, rounded } from '../theme';

export const ProductCatalogScreen = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { products, loading } = useProducts(debouncedSearch);
  const addItem = useCartStore((state) => state.addItem);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <View style={styles.container}>
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

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={addItem} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.s,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: rounded.default,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.onSurface,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
