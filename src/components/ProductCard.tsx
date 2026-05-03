import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ShoppingCart } from 'lucide-react-native';
import { colors, spacing, typography, rounded } from '../theme';
import { Product } from '../hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = React.memo(({ product, onAddToCart }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <View style={styles.card}>
      <FastImage
        style={styles.image}
        source={{
          uri: product.image,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
      <View style={styles.details}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        
        <View style={styles.footer}>
          <Text style={[styles.stock, isOutOfStock && styles.outOfStock]}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
            disabled={isOutOfStock}
            onPress={() => onAddToCart(product)}
          >
            <ShoppingCart size={20} color={isOutOfStock ? colors.outline : colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    padding: spacing.m,
    flex: 1,
    margin: spacing.s,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  image: {
    height: 120,
    width: '100%',
    marginBottom: spacing.m,
  },
  details: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.full,
    marginBottom: spacing.s,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  name: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
    height: 48, // Fix height for 2 lines
  },
  price: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  stock: {
    ...typography.labelSm,
    color: colors.success,
  },
  outOfStock: {
    color: colors.error,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
});
