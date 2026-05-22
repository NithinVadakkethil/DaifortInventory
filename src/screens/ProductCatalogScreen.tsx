import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { colors, spacing, rounded, typography, shadows } from '../theme';
import { getAllCategories, CategoryRecord } from '../data/db';
import { CategoryCard } from '../components/CategoryCard';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { ProductImageGalleryModal } from '../components/ProductImageGalleryModal';
import { ManageProductsModal } from '../components/ManageProductsModal';

export const ProductCatalogScreen = ({ isCartOpen = true }: { isCartOpen?: boolean }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddCatVisible, setAddCatVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);
  const [manageCategory, setManageCategory] = useState<CategoryRecord | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCategories(debouncedSearch);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const numColumns = isCartOpen ? 3 : 4;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={colors.outline} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories by name..."
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddCatVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <AddCategoryModal
        visible={isAddCatVisible}
        onClose={() => setAddCatVisible(false)}
        onSuccess={fetchCategories}
      />

      <ProductImageGalleryModal
        categoryName={selectedCategory ? selectedCategory.name : null}
        visible={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
      />

      {manageCategory && (
        <ManageProductsModal
          visible={manageCategory !== null}
          categoryName={manageCategory.name}
          onClose={() => setManageCategory(null)}
          onRefreshCatalog={fetchCategories}
        />
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          key={numColumns} // Force component to recreate when grid column count changes
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={(cat) => setSelectedCategory(cat)}
              onManagePress={(cat) => setManageCategory(cat)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No categories found.</Text>
          }
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
    paddingLeft: 320, // Keep space for absolute top-left horizontal navbar
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
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
