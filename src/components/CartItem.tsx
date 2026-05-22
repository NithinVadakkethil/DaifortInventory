import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItemType, useCartStore } from '../store/useCartStore';
import { colors, spacing, typography, rounded } from '../theme';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const { product, quantity } = item;

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.image}
        source={{ uri: product.image }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>£{((item.negotiatedPrice ?? product.price) * quantity).toFixed(2)}</Text>
          {item.negotiatedPrice !== undefined && item.negotiatedPrice !== product.price && (
            <Text style={styles.originalPrice}>£{(product.price * quantity).toFixed(2)}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(product.id)}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: rounded.default,
    marginRight: spacing.m,
  },
  details: {
    flex: 1,
  },
  name: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  price: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.primary,
  },
  originalPrice: {
    ...typography.bodyMd,
    textDecorationLine: 'line-through',
    color: colors.outline,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.full,
    paddingHorizontal: spacing.xs,
  },
  stepButton: {
    padding: spacing.xs,
  },
  quantity: {
    ...typography.labelMd,
    marginHorizontal: spacing.m,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
